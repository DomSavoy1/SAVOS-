"use client";

import { useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, CircleStop, LoaderCircle, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CODEX_REQUEST_MAX_CHARS, type OpenResponsesEvent } from "@/lib/codex-task";

type TaskState = "idle" | "working" | "finished" | "stopped" | "problem";

const EXAMPLE = "Draft a Savoy Catalog Rescue service offer for retailers with messy product spreadsheets. Include a $650 package, clear scope limits, delivery steps, and a 2-client validation target.";

export function CodexTaskPanel() {
  const [request, setRequest] = useState("");
  const [status, setStatus] = useState<TaskState>("idle");
  const [response, setResponse] = useState("");
  const [problem, setProblem] = useState("");
  const [signInPath, setSignInPath] = useState("");
  const activeController = useRef<AbortController | null>(null);

  async function runTask() {
    const task = request.trim();
    if (task.length < 3 || task.length > CODEX_REQUEST_MAX_CHARS) {
      setStatus("problem");
      setProblem(
        task.length > CODEX_REQUEST_MAX_CHARS
          ? `Keep the request under ${CODEX_REQUEST_MAX_CHARS.toLocaleString()} characters.`
          : "Describe the task in at least 3 characters.",
      );
      return;
    }

    const controller = new AbortController();
    activeController.current = controller;
    setStatus("working");
    setResponse("");
    setProblem("");
    setSignInPath("");

    let accumulated = "";
    let completed = false;
    let failed = false;

    try {
      const upstream = await fetch("/api/codex/tasks", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ request: task }),
        signal: controller.signal,
      });

      if (!upstream.ok) {
        const payload = (await upstream.json().catch(() => ({}))) as {
          error?: string;
          signInPath?: string;
        };
        if (payload.signInPath) setSignInPath(payload.signInPath);
        throw new Error(payload.error || "Codex could not start this task.");
      }
      if (!upstream.body) throw new Error("Codex returned no response stream.");

      const reader = upstream.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        buffer += decoder.decode(value, { stream: !done });
        const frames = buffer.split(/\r?\n\r?\n/);
        buffer = done ? "" : frames.pop() || "";

        for (const frame of frames) {
          const data = frame
            .split(/\r?\n/)
            .filter((line) => line.startsWith("data:"))
            .map((line) => line.slice(5).trimStart())
            .join("\n");
          if (!data || data === "[DONE]") continue;

          let event: OpenResponsesEvent;
          try {
            event = JSON.parse(data) as OpenResponsesEvent;
          } catch {
            failed = true;
            throw new Error("Codex returned an unreadable progress event.");
          }

          if (event.type === "response.output_text.delta" && event.delta) {
            accumulated += event.delta;
            setResponse(accumulated);
          } else if (event.type === "response.completed") {
            if (event.response?.status && event.response.status !== "completed") {
              failed = true;
              throw new Error("Codex did not confirm a completed task.");
            }
            const completedText = event.response?.output_text?.trim();
            if (completedText) accumulated = completedText;
            setResponse(accumulated);
            completed = true;
          } else if (event.type === "response.failed") {
            failed = true;
            throw new Error(
              event.error?.message ||
                event.response?.error?.message ||
                "Codex encountered a problem before it finished.",
            );
          }
        }

        if (done) break;
      }

      if (!completed) {
        throw new Error("The Codex stream ended without a completion confirmation.");
      }
      if (!accumulated.trim()) {
        throw new Error("Codex completed without a text response, so Quick Cash did not mark it finished.");
      }
      setStatus("finished");
    } catch (error) {
      if (controller.signal.aborted) {
        setStatus("stopped");
      } else {
        setStatus("problem");
        setProblem(
          error instanceof Error
            ? error.message
            : failed
              ? "Codex encountered a problem before it finished."
              : "The Codex task could not be completed.",
        );
      }
    } finally {
      if (activeController.current === controller) activeController.current = null;
    }
  }

  function stopTask() {
    activeController.current?.abort();
    activeController.current = null;
    setStatus("stopped");
    setProblem("");
  }

  return (
    <section className="panel codex-task-panel">
      <div className="codex-task-heading">
        <div>
          <p className="eyebrow">OPENCLAW · NATIVE CODEX ROUTING</p>
          <h2>Ask Codex to work</h2>
          <p>
            OpenClaw routes the request from the server. Gateway credentials are never sent to this browser.
          </p>
        </div>
        <TaskStatus status={status} />
      </div>

      <label htmlFor="codex-task-request">Task request</label>
      <Textarea
        id="codex-task-request"
        value={request}
        maxLength={CODEX_REQUEST_MAX_CHARS}
        disabled={status === "working"}
        placeholder={EXAMPLE}
        rows={5}
        onChange={(event) => setRequest(event.target.value)}
      />
      <div className="codex-task-controls">
        <small>
          {request.length.toLocaleString()} / {CODEX_REQUEST_MAX_CHARS.toLocaleString()} characters
        </small>
        <div>
          {status === "working" && (
            <Button type="button" variant="destructive" onClick={stopTask}>
              <CircleStop /> Stop
            </Button>
          )}
          <Button type="button" disabled={status === "working"} onClick={runTask}>
            <Play /> Run with Codex
          </Button>
        </div>
      </div>

      <p className="codex-stop-note">
        Stopping cancels the active task. Side effects already completed by Codex are not undone.
      </p>

      {status === "working" && (
        <div className="codex-task-message" role="status" aria-live="polite">
          <LoaderCircle className="spin" /> Codex is working through OpenClaw…
        </div>
      )}
      {status === "stopped" && (
        <div className="codex-task-message stopped" role="status">
          <CircleStop /> Task stopped. Any side effects completed before cancellation were not undone.
        </div>
      )}
      {status === "problem" && (
        <div className="codex-task-message problem" role="alert">
          <AlertTriangle />
          <span>
            {problem}
            {signInPath && (
              <>
                {" "}
                <a href={signInPath} target="_top">Sign in with ChatGPT</a>
              </>
            )}
          </span>
        </div>
      )}
      {status === "finished" && (
        <div className="codex-task-message finished" role="status">
          <CheckCircle2 /> Codex finished the task.
        </div>
      )}

      {response && (
        <article className="codex-response" aria-label="Codex response">
          <small>COMPLETED RESPONSE</small>
          <pre>{response}</pre>
        </article>
      )}
    </section>
  );
}

function TaskStatus({ status }: { status: TaskState }) {
  const labels: Record<TaskState, string> = {
    idle: "Ready",
    working: "Working",
    finished: "Finished",
    stopped: "Stopped",
    problem: "Problem",
  };
  return (
    <span className={`codex-status ${status}`} aria-label={`Codex status: ${labels[status]}`}>
      <i /> {labels[status]}
    </span>
  );
}
