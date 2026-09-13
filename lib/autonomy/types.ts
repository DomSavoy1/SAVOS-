export type JobStatus="queued"|"running"|"completed"|"blocked"|"failed";
export type JobKind="operating_cycle"|"revenue_hunter"|"opportunity_score"|"catalog_intake"|"catalog_transform"|"prospect_research"|"outreach"|"reply_triage"|"payment_sync"|"delivery_router"|"daily_briefing";
export type ApprovalKind="publish"|"spend"|"price_change"|"delete_customer_data"|"contract"|"major_deployment";
export type Job={id:string;kind:JobKind;status:JobStatus;payload:Record<string,unknown>;result?:Record<string,unknown>;error?:string;attempts:number;createdAt:string;updatedAt:string;runAfter:string};
export type AutonomyStatus={enabled:boolean;modelConfigured:boolean;deliveryConfigured:boolean;budgetUsd:number;estimatedSpendUsd:number;jobs:Job[];counts:Record<JobStatus,number>;lastCycleAt?:string};
