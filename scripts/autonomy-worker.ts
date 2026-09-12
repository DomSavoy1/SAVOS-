const api=process.env.AUTONOMY_API_URL||"http://127.0.0.1:3000/api/autonomy";
const headers={"content-type":"application/json",...(process.env.AUTONOMY_WORKER_TOKEN?{authorization:`Bearer ${process.env.AUTONOMY_WORKER_TOKEN}`}:{})};
async function post(body:unknown){const response=await fetch(api,{method:"POST",headers,body:JSON.stringify(body)});if(!response.ok)throw new Error(`Autonomy API returned ${response.status}`);return response.json()}
let lastCycle="";
async function tick(){if(process.env.AUTONOMY_ENABLED!=="true")return;const now=new Date(),eastern=new Intl.DateTimeFormat("en-CA",{timeZone:"America/New_York",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",hour12:false}).formatToParts(now),part=(type:string)=>eastern.find(p=>p.type===type)?.value||"",day=`${part("year")}-${part("month")}-${part("day")}`;if(Number(part("hour"))>=8&&lastCycle!==day){await post({action:"enqueue",kind:"operating_cycle",payload:{scheduledFor:day}});lastCycle=day}for(let i=0;i<5;i++){const result=await post({action:"work"}) as {job?:unknown};if(!result.job)break}}
tick().catch(console.error);setInterval(()=>tick().catch(console.error),60_000);
