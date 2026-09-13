import {mkdirSync,writeFileSync} from "node:fs";
import {dirname} from "node:path";

const clientId=process.env.MICROSOFT_CLIENT_ID;
const tenant=process.env.MICROSOFT_TENANT_ID||"consumers";
const output=process.env.MICROSOFT_REFRESH_TOKEN_FILE||"/var/lib/savos/microsoft-refresh-token";
if(!clientId)throw new Error("MICROSOFT_CLIENT_ID is required");
const scope="offline_access User.Read Mail.Send";
const deviceResponse=await fetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/devicecode`,{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body:new URLSearchParams({client_id:clientId,scope})});
const device=await deviceResponse.json() as {device_code?:string;user_code?:string;verification_uri?:string;expires_in?:number;interval?:number;message?:string;error_description?:string};
if(!deviceResponse.ok||!device.device_code)throw new Error(device.error_description||"Unable to begin Microsoft device authorization");
console.log(device.message||`Open ${device.verification_uri} and enter ${device.user_code}`);
const deadline=Date.now()+(device.expires_in||900)*1000;
while(Date.now()<deadline){
  await new Promise(resolve=>setTimeout(resolve,(device.interval||5)*1000));
  const response=await fetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`,{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body:new URLSearchParams({grant_type:"urn:ietf:params:oauth:grant-type:device_code",client_id:clientId,device_code:device.device_code})});
  const token=await response.json() as {refresh_token?:string;error?:string;error_description?:string};
  if(token.error==="authorization_pending"||token.error==="slow_down")continue;
  if(!response.ok||!token.refresh_token)throw new Error(token.error_description||"Microsoft authorization failed");
  mkdirSync(dirname(output),{recursive:true});
  writeFileSync(output,`${token.refresh_token}\n`,{mode:0o600});
  console.log(`Microsoft mailbox authorization saved to ${output}. No token was printed.`);
  process.exit(0);
}
throw new Error("Microsoft authorization expired before completion");
