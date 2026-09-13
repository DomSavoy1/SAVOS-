import {createHmac,timingSafeEqual} from "node:crypto";
import {enqueue} from "@/lib/autonomy/store";

export const runtime="nodejs";

function verified(raw:string,header:string,secret:string){const parts=Object.fromEntries(header.split(",").map(part=>part.split("=",2)));if(!parts.t||!parts.v1)return false;const age=Math.abs(Date.now()/1000-Number(parts.t));if(!Number.isFinite(age)||age>300)return false;const expected=createHmac("sha256",secret).update(`${parts.t}.${raw}`).digest("hex"),actual=parts.v1;return expected.length===actual.length&&timingSafeEqual(Buffer.from(expected),Buffer.from(actual))}

export async function POST(request:Request){const secret=process.env.STRIPE_WEBHOOK_SECRET;if(!secret)return Response.json({error:"Stripe webhook is not configured"},{status:503});const raw=await request.text(),signature=request.headers.get("stripe-signature")||"";if(!verified(raw,signature,secret))return Response.json({error:"Invalid signature"},{status:400});const event=JSON.parse(raw) as {id:string;type:string;data?:{object?:Record<string,unknown>}};if(event.type==="checkout.session.completed"||event.type==="payment_intent.succeeded")enqueue("delivery_router",{stripeEventId:event.id,eventType:event.type,payment:event.data?.object||{}});return Response.json({received:true})}
