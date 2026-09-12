import {createHmac,timingSafeEqual} from "node:crypto";

const cookieName="savos_session";
const maxAge=60*60*24*7;

function secret(){return process.env.SAVOS_SESSION_SECRET||""}
function signature(value:string){return createHmac("sha256",secret()).update(value).digest("base64url")}
function equal(a:string,b:string){const left=Buffer.from(a),right=Buffer.from(b);return left.length===right.length&&timingSafeEqual(left,right)}
function cookie(request:Request){const raw=request.headers.get("cookie")||"";return raw.split(";").map(v=>v.trim()).find(v=>v.startsWith(`${cookieName}=`))?.slice(cookieName.length+1)}

export function authConfigured(){return Boolean(process.env.SAVOS_OWNER_PASSWORD&&secret())}
export function verifyPassword(password:string){const expected=process.env.SAVOS_OWNER_PASSWORD||"";return expected.length>0&&equal(password,expected)}
export function isOwner(request:Request){if(!authConfigured())return false;const value=cookie(request);if(!value)return false;const [expires,sig]=value.split(".");return Boolean(expires&&sig&&Number(expires)>Date.now()&&equal(signature(expires),sig))}
const secure=()=>process.env.NODE_ENV==="production"?"; Secure":"";
export function sessionCookie(){const expires=String(Date.now()+maxAge*1000);return `${cookieName}=${expires}.${signature(expires)}; HttpOnly${secure()}; SameSite=Strict; Path=/; Max-Age=${maxAge}`}
export function clearSessionCookie(){return `${cookieName}=; HttpOnly${secure()}; SameSite=Strict; Path=/; Max-Age=0`}
export function unauthorized(){return Response.json({error:"Sign in required."},{status:401})}
