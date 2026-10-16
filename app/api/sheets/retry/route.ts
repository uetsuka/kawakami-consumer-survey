import {env} from 'cloudflare:workers';
import {database} from '@/lib/storage';
import {deliverSheets,syncConsumer} from '@/lib/sheet-delivery';
export async function POST(request:Request){
 const cfg=env as unknown as {SHEETS_SYNC_TOKEN?:string};
 if(!cfg.SHEETS_SYNC_TOKEN||request.headers.get('authorization')!=='Bearer '+cfg.SHEETS_SYNC_TOKEN)return Response.json({error:'Not authorized'},{status:401});
 try{
 const raw=await request.text();if(raw.length>1024)return Response.json({error:'Too large'},{status:413});
 const p=raw?JSON.parse(raw):{};
 if(p.id!==undefined&&!/^[0-9a-f-]{36}$/i.test(p.id))return Response.json({error:'Invalid id'},{status:400});
 if(p.id)await syncConsumer(p.id,false);
 if(p.backfill===true){const records=await database().prepare('SELECT id FROM responses ORDER BY created_at LIMIT 50 OFFSET ?').bind(Math.max(0,Math.min(100000,Number(p.offset)||0))).all<{id:string}>();for(const r of records.results)await syncConsumer(r.id,false);}
 const delivery=p.statusOnly===true?null:await deliverSheets();
 const jobs=await database().prepare('SELECT id,status,version,attempts,last_error,synced_at FROM sheet_jobs '+(p.id?'WHERE id IN (?,?)':'ORDER BY updated_at DESC LIMIT 20')).bind(...(p.id?['consumer:'+p.id,'enquiry:'+p.id]:[])).all();
 const counts=await database().prepare("SELECT count(*) AS total,sum(status='submitted') AS submitted,sum(test=1) AS test FROM responses").first();
 return Response.json({delivery,counts,jobs:jobs.results},{headers:{'Cache-Control':'no-store'}});
 }catch(e){console.error('Sheet retry failed',e instanceof Error?e.message:'Unknown error');return Response.json({error:'Retry failed'},{status:503});}
}
