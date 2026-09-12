import {authConfigured,clearSessionCookie,isOwner,sessionCookie,verifyPassword} from "@/lib/auth";
export const runtime="nodejs";

export async function GET(request:Request){return Response.json({authenticated:isOwner(request),configured:authConfigured()})}
export async function POST(request:Request){const body=await request.json() as {password?:string};if(!authConfigured())return Response.json({error:"Owner access has not been configured."},{status:503});if(!verifyPassword(body.password||""))return Response.json({error:"That password is incorrect."},{status:401});return new Response(JSON.stringify({authenticated:true}),{headers:{"content-type":"application/json","set-cookie":sessionCookie()}})}
export async function DELETE(){return new Response(JSON.stringify({authenticated:false}),{headers:{"content-type":"application/json","set-cookie":clearSessionCookie()}})}
