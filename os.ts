export type Venture={id:string;name:string;stage:string;status:"green"|"yellow"|"red";problem:string;offer:string;recurring:boolean;score:number;nextAction:string;revenue:number;hours:number};
export type Mission={id:string;title:string;ventureId:string;type:string;priority:"high"|"medium"|"low";status:"queued"|"approved"|"deferred"|"complete";reason:string;roi:string;risk:string;alternative:string;confidence:number;createdAt:string};
export type Ledger={id:string;date:string;ventureId:string;revenueGenerated:number;revenueProtected:number;cashSaved:number;hoursSaved:number;processesAutomated:number;customerValue:string;knowledge:string;documentation:string;improvement:string;asset:string};
export type Log={id:string;at:string;actor:string;action:string;reason:string;reversible:boolean};
export type Knowledge={id:string;type:string;title:string;summary:string;ventureId?:string;updatedAt:string};
export type Agent={id:string;name:string;department:string;mandate:string;status:"ready"|"working"|"blocked";lastRun:string};
export type OSState={ventures:Venture[];missions:Mission[];ledger:Ledger[];logs:Log[];knowledge:Knowledge[];agents:Agent[];briefing:{date:string;summary:string;opportunity:string;risk:string;nextAction:string};settings:{weeklyFreedomTarget:number;founderHoursTarget:number};updatedAt:string};

export function normalizeOperatingUserId(value: unknown): string {
  if (typeof value !== "string") {
    throw new Error("Operating user ID is required.");
  }

  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error("Operating user ID is required.");
  }

  if (!/^[A-Za-z0-9._:-]+$/.test(trimmed)) {
    throw new Error("Operating user ID contains unsupported characters.");
  }

  return trimmed;
}

export function buildOperatingStateScope(userId: string): string {
  return `os:${normalizeOperatingUserId(userId)}`;
}

const now=new Date().toISOString();
export const seedState:OSState={
 ventures:[
  {id:"catalog-rescue",name:"Savoy Catalog Rescue",stage:"Validation",status:"yellow",problem:"Retailers abandon launches when supplier files, SKUs, variants, and pricing are inconsistent.",offer:"Fixed-scope catalog cleanup, variant normalization, and upload-ready spreadsheet prep for retailers who need clean product data fast.",recurring:false,score:5,nextAction:"Run a 2-client pilot at $650 per package, confirm delivery time, and then decide whether to continue or refine offer scope.",revenue:0,hours:0},
  {id:"reporting-desk",name:"Savoy Reporting Desk",stage:"Research",status:"yellow",problem:"Agencies spend recurring time turning approved exports into client-ready reports.",offer:"Standardized monthly reporting from a fixed input format.",recurring:true,score:4,nextAction:"Interview three agency operators about input variability and revision time.",revenue:0,hours:0}],
 missions:[{id:"fm-capacity",title:"Validate the catalog rescue pilot",ventureId:"portfolio",type:"Commercial validation",priority:"high",status:"queued",reason:"The first offer should be tested before expanding scope. Keep the pilot tightly bounded and require a human approval before any outreach, spending, or delivery.",roi:"Confirms whether a $650 package can be delivered profitably and without founder overload.",risk:"Without clear scope, the work becomes low-margin labor and undermines the entire venture path.",alternative:"Use a small pilot with a limited file size, one revision round, and explicit review checkpoints.",confidence:95,createdAt:now}],
 ledger:[],logs:[{id:"log-import",at:now,actor:"Jamal",action:"Prioritized Savoy Catalog Rescue as the active validation venture.",reason:"The first paid test should be a clean, scoped service with clear package pricing and delivery limits.",reversible:true}],
 knowledge:[{id:"constitution",type:"Principle",title:"SVOS Constitution v1.0",summary:"Build ethical, recurring, standardized ventures that reduce founder work and compound reusable assets.",updatedAt:now},{id:"catalog-kit",type:"Playbook",title:"Catalog Rescue Pilot Launch Kit",summary:"2 packages at $650 each = $1,300 gross revenue target. Keep direct costs at or below $300, exclude MTurk, and do not record revenue before client approval and delivery.",ventureId:"catalog-rescue",updatedAt:now},{id:"venture-lifecycle",type:"SOP",title:"Venture Creation Lifecycle",summary:"Capture, research, validate, filter, design, build, acquire, measure, document, automate, scale, repeat.",updatedAt:now}],
 agents:[
  ["jamal","Jamal","Chief of Staff","Filter recommendations, protect founder attention, resolve conflicts, and issue the briefing."],
  ["strategy","Maya","Strategy","Test venture logic, prioritize opportunities, and challenge weak assumptions."],
  ["market","Owen","Market Intelligence","Research painful problems, buyers, competitors, and willingness to pay."],
  ["finance","Priya","Finance","Track cash, unit economics, ROI, runway, and freedom progress."],
  ["operations","Rosa","Operations","Turn delivery into SOPs, quality controls, and repeatable workflows."],
  ["growth","Marcus","Growth","Design ethical acquisition tests and measure qualified demand."],
  ["automation","Ada","Automation","Automate proven work and keep changes logged and reversible."],
  ["risk","Nadia","Risk & Compliance","Surface legal, privacy, tax, contract, and regulatory risks early."]
 ].map(([id,name,department,mandate])=>({id,name,department,mandate,status:"ready" as const,lastRun:"Never"})),
 briefing:{date:now,summary:"The operating system is online. Two opportunities are preserved as proposed ventures; neither has revenue or validation.",opportunity:"Validate one narrow paid outcome before adding more ventures.",risk:"Founder constraints and commercial authority are not yet recorded.",nextAction:"Resolve the Fire Mission: set operating constraints."},settings:{weeklyFreedomTarget:1000,founderHoursTarget:10},updatedAt:now};
