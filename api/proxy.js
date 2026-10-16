const allowed=new Set(["responses","responses/draft","stickers/can.png","stickers/makan.png","stickers/takecare.png","stickers/sorry.png"]);
export default async function handler(req,res){
 const url=new URL(req.url,'https://proxy.local');
 const path=url.searchParams.get('route')||url.pathname.replace(/^\/api\//,'');
 url.searchParams.delete('route');
 if(!allowed.has(path)||!["POST","PATCH","GET"].includes(req.method)){res.status(404).json({error:'Not found'});return;}
 const origin=req.headers.origin;
 const host=req.headers['x-forwarded-host']||req.headers.host;
 if(origin&&new URL(origin).host!==host){res.status(403).json({error:'Request not allowed'});return;}
 const body=['GET','HEAD'].includes(req.method)?undefined:JSON.stringify(req.body);
 if(body&&Buffer.byteLength(body)>65536){res.status(413).json({error:'Request too large'});return;}
 try{
  const headers=body?{'Content-Type':'application/json'}:{};
  const giftCookie=(req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith('sticker_gift='));
  if(giftCookie)headers.Cookie=giftCookie;
  const upstream=await fetch("https://kawakami-consumer-survey.chiekouetsuka.chatgpt.site"+'/api/'+path+url.search,{method:req.method,headers,body,signal:AbortSignal.timeout(25000),redirect:'error'});
  res.statusCode=upstream.status;
  for(const key of ['content-type','content-disposition','cache-control']){const value=upstream.headers.get(key);if(value)res.setHeader(key,value);}
  const cookies=upstream.headers.getSetCookie().filter(value=>value.startsWith('sticker_gift='));if(cookies.length)res.setHeader('Set-Cookie',cookies);
  res.end(Buffer.from(await upstream.arrayBuffer()));
 }catch{res.status(502).json({error:'Please try again.'});}
}
