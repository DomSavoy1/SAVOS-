import {readFileSync,writeFileSync} from "node:fs";

const tokenFile=()=>process.env.MICROSOFT_REFRESH_TOKEN_FILE||"/var/lib/savos/microsoft-refresh-token";
const clientId=()=>process.env.MICROSOFT_CLIENT_ID||"";
const tenant=()=>process.env.MICROSOFT_TENANT_ID||"consumers";

export function graphConfigured(){
  try{return Boolean(clientId()&&readFileSync(tokenFile(),"utf8").trim())}catch{return false}
}

async function accessToken(){
  if(!clientId())throw new Error("Microsoft Graph client ID is not configured");
  let refreshToken:string;
  try{refreshToken=readFileSync(tokenFile(),"utf8").trim()}catch{throw new Error("Microsoft Graph mailbox authorization is not configured")}
  const body=new URLSearchParams({client_id:clientId(),grant_type:"refresh_token",refresh_token:refreshToken,scope:"offline_access User.Read Mail.Send"});
  const response=await fetch(`https://login.microsoftonline.com/${tenant()}/oauth2/v2.0/token`,{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body});
  const json=await response.json() as {access_token?:string;refresh_token?:string;error_description?:string};
  if(!response.ok||!json.access_token)throw new Error(`Microsoft token refresh failed: ${json.error_description||response.status}`);
  if(json.refresh_token&&json.refresh_token!==refreshToken)writeFileSync(tokenFile(),`${json.refresh_token}\n`,{mode:0o600});
  return json.access_token;
}

export async function sendGraphMail(input:{to:string;subject:string;html?:string;text?:string}){
  if(!input.to||!input.subject||(!input.html&&!input.text))throw new Error("Outreach requires a recipient, subject, and message body");
  const token=await accessToken();
  const response=await fetch("https://graph.microsoft.com/v1.0/me/sendMail",{method:"POST",headers:{authorization:`Bearer ${token}`,"content-type":"application/json"},body:JSON.stringify({message:{subject:input.subject,body:{contentType:input.html?"HTML":"Text",content:input.html||input.text},toRecipients:[{emailAddress:{address:input.to}}]},saveToSentItems:true})});
  if(response.status!==202)throw new Error(`Microsoft Graph send failed (${response.status}): ${(await response.text()).slice(0,400)}`);
  return {message:"Outreach accepted by Microsoft Graph",recipient:input.to,subject:input.subject,providerStatus:202};
}
