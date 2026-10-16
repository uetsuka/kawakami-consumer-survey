import assets from '@/lib/sticker-assets.json';
import {assetKey,decode,verifyGrant} from '@/lib/sticker-access';
import {database} from '@/lib/storage';
export async function GET(request:Request,{params}:{params:Promise<{name:string}>}){
const headers={'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'};
try{
const id=await verifyGrant(request);if(!id)return new Response('Register your email to unlock your gift.',{status:403,headers});
const row=await database().prepare("SELECT id FROM responses WHERE id=? AND status='submitted' AND email IS NOT NULL AND email<>''").bind(id).first();if(!row)return new Response('Gift not unlocked.',{status:403,headers});
const {name}=await params;const clean=name.replace(/\.png$/,'');if(!Object.prototype.hasOwnProperty.call(assets,clean))return new Response('Not found',{status:404,headers});
const asset=assets[clean as keyof typeof assets];const png=await crypto.subtle.decrypt({name:'AES-GCM',iv:decode(asset.iv)},await assetKey(),decode(asset.data));
return new Response(png,{headers:{...headers,'Content-Type':'image/png','Content-Disposition':`${new URL(request.url).searchParams.get('view')==='1'?'inline':'attachment'}; filename="kawakami-${clean}.png"`}});
}catch{return new Response('Please try downloading again.',{status:503,headers});}}
