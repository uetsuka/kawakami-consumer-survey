import {env} from 'cloudflare:workers';
const encoder=new TextEncoder();
export function decode(value:string){return Uint8Array.from(atob(value),c=>c.charCodeAt(0));}
function secret(){const value=(env as unknown as Record<string,string>).STICKER_ASSET_KEY;if(!value)throw new Error('Gift storage unavailable');return decode(value);}
export async function assetKey(){return crypto.subtle.importKey('raw',secret(),'AES-GCM',false,['decrypt']);}
async function signingKey(){return crypto.subtle.importKey('raw',secret(),{name:'HMAC',hash:'SHA-256'},false,['sign','verify']);}
export async function grant(id:string){const payload=`${id}.${Date.now()+7*24*60*60*1000}`;const signature=new Uint8Array(await crypto.subtle.sign('HMAC',await signingKey(),encoder.encode(payload)));return payload+'.'+btoa(String.fromCharCode(...signature));}
export async function verifyGrant(request:Request){try{const token=request.headers.get('cookie')?.split(';').map(x=>x.trim()).find(x=>x.startsWith('sticker_gift='))?.slice(13);if(!token)return null;const [id,expires,signature,...extra]=token.split('.');if(extra.length||!/^\d+$/.test(expires)||Number(expires)<Date.now()||!signature||!/^[0-9a-f-]{36}$/.test(id))return null;const valid=await crypto.subtle.verify('HMAC',await signingKey(),decode(signature),encoder.encode(`${id}.${expires}`));return valid?id:null;}catch{return null;}}
