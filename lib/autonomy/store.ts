import {mkdirSync} from "node:fs";
import {dirname} from "node:path";
import {DatabaseSync} from "node:sqlite";
import type {Job,JobKind,JobStatus} from "./types";

const file=process.env.AUTONOMY_DB_FILE||"/tmp/savos/autonomy.sqlite";
let database:DatabaseSync|undefined;
function db(){if(database)return database;mkdirSync(dirname(file),{recursive:true});database=new DatabaseSync(file);database.exec(`
 PRAGMA journal_mode=WAL;
 CREATE TABLE IF NOT EXISTS jobs(id TEXT PRIMARY KEY,kind TEXT NOT NULL,status TEXT NOT NULL,payload TEXT NOT NULL,result TEXT,error TEXT,attempts INTEGER NOT NULL DEFAULT 0,run_after TEXT NOT NULL,created_at TEXT NOT NULL,updated_at TEXT NOT NULL);
 CREATE INDEX IF NOT EXISTS jobs_due ON jobs(status,run_after);
 CREATE TABLE IF NOT EXISTS usage(id INTEGER PRIMARY KEY AUTOINCREMENT,provider TEXT NOT NULL,input_tokens INTEGER NOT NULL,output_tokens INTEGER NOT NULL,estimated_usd REAL NOT NULL,created_at TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS settings(key TEXT PRIMARY KEY,value TEXT NOT NULL);
 `);return database}
type JobRow={id:string;kind:JobKind;status:JobStatus;payload:string;result:string|null;error:string|null;attempts:number;run_after:string;created_at:string;updated_at:string};
type CountRow={status:JobStatus;count:number};
const parse=(value:unknown):Job=>{const row=value as JobRow;return {id:row.id,kind:row.kind,status:row.status,payload:JSON.parse(row.payload) as Record<string,unknown>,result:row.result?JSON.parse(row.result) as Record<string,unknown>:undefined,error:row.error||undefined,attempts:row.attempts,runAfter:row.run_after,createdAt:row.created_at,updatedAt:row.updated_at}};
export function enqueue(kind:JobKind,payload:Record<string,unknown>={},runAfter=new Date().toISOString()){const now=new Date().toISOString(),id=crypto.randomUUID();db().prepare("INSERT INTO jobs(id,kind,status,payload,attempts,run_after,created_at,updated_at) VALUES(?,?,?,?,0,?,?,?)").run(id,kind,"queued",JSON.stringify(payload),runAfter,now,now);return getJob(id)!}
export function getJob(id:string){const row=db().prepare("SELECT * FROM jobs WHERE id=?").get(id);return row?parse(row):undefined}
export function listJobs(limit=50){return db().prepare("SELECT * FROM jobs ORDER BY created_at DESC LIMIT ?").all(limit).map(parse)}
export function claimDueJob(){const row=db().prepare("SELECT * FROM jobs WHERE status='queued' AND run_after<=? ORDER BY run_after LIMIT 1").get(new Date().toISOString()) as JobRow|undefined;if(!row)return;const now=new Date().toISOString();const result=db().prepare("UPDATE jobs SET status='running',attempts=attempts+1,updated_at=? WHERE id=? AND status='queued'").run(now,row.id);return result.changes?getJob(row.id):undefined}
export function finishJob(id:string,status:Extract<JobStatus,"completed"|"blocked"|"failed">,result?:Record<string,unknown>,error?:string){db().prepare("UPDATE jobs SET status=?,result=?,error=?,updated_at=? WHERE id=?").run(status,result?JSON.stringify(result):null,error||null,new Date().toISOString(),id);return getJob(id)}
export function counts(){const base:Record<JobStatus,number>={queued:0,running:0,completed:0,blocked:0,failed:0};for(const value of db().prepare("SELECT status,COUNT(*) count FROM jobs GROUP BY status").all()){const row=value as CountRow;base[row.status]=Number(row.count)}return base}
export function addUsage(provider:string,input:number,output:number,usd:number){db().prepare("INSERT INTO usage(provider,input_tokens,output_tokens,estimated_usd,created_at) VALUES(?,?,?,?,?)").run(provider,input,output,usd,new Date().toISOString())}
export function monthlySpend(){const row=db().prepare("SELECT COALESCE(SUM(estimated_usd),0) total FROM usage WHERE created_at>=?").get(new Date(Date.UTC(new Date().getUTCFullYear(),new Date().getUTCMonth(),1)).toISOString()) as {total:number};return Number(row.total)}
export function lastCompleted(kind:JobKind){return (db().prepare("SELECT updated_at FROM jobs WHERE kind=? AND status='completed' ORDER BY updated_at DESC LIMIT 1").get(kind) as {updated_at:string}|undefined)?.updated_at}
