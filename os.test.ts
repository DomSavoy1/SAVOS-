import assert from "node:assert/strict";
import test from "node:test";
import { buildOperatingStateScope, normalizeOperatingUserId } from "../lib/os.ts";

test("normalizes and scopes operating user IDs without unsafe characters", () => {
  assert.equal(normalizeOperatingUserId(" user-42 "), "user-42");
  assert.equal(buildOperatingStateScope("user-42"), "os:user-42");
  assert.throws(() => normalizeOperatingUserId("user/42"), /unsupported characters/);
});
