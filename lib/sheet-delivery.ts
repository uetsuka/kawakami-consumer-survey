import {env} from 'cloudflare:workers';
import {database} from './storage';

type Settings={SHEETS_WEBHOOK_URL?:string;SHEETS_SYNC_TOKEN?:string;ADMIN_EMAIL?:string};
export type SheetKind='consumer'|'business'|'enquiry';
type Job={id:string;payload:string;version:number;attempts:number};
export async function queueSheet(kind:SheetKind,id:string,version:number,cells:Record<string,unknown>){
 const payload=JSON.stringify({kind,id,version,cells});
 await database().prepare(`INSERT INTO sheet_jobs (id,payload,version,status,attempts,updated_at,lease_until) VALUES (?,?,?,'pending',0,?,0)
 ON CONFLICT(id) DO UPDATE SET payload=excluded.payload,version=excluded.version,status='pending',updated_at=excluded.updated_at,lease_until=0
 WHERE excluded.version>sheet_jobs.version`).bind(`${kind}:${id}`,payload,version,Date.now()).run();
}
export async function deliverSheets(jobId?:string){
 const cfg=env as unknown as Settings;
 if(!cfg.SHEETS_WEBHOOK_URL||!cfg.SHEETS_SYNC_TOKEN)return {configured:false,synced:0,pending:true};
 const endpoint=new URL(cfg.SHEETS_WEBHOOK_URL);
 if(endpoint.protocol!=='https:'||endpoint.hostname!=='script.google.com'||!endpoint.pathname.endsWith('/exec'))throw new Error('Invalid Sheets endpoint');
 const jobs=await database().prepare(`SELECT id,payload,version,attempts FROM sheet_jobs WHERE status='pending' AND lease_until<? ${jobId?'AND id=?':''} ORDER BY updated_at LIMIT 5`).bind(Date.now(),...(jobId?[jobId]:[])).all<Job>();
 let synced=0;
 for(const job of jobs.results){
  const claim=await database().prepare("UPDATE sheet_jobs SET lease_until=?,attempts=attempts+1 WHERE id=? AND version=? AND status='pending' AND lease_until<?").bind(Date.now()+45000,job.id,job.version,Date.now()).run();
  if(!claim.meta.changes)continue;
  try{
   const p=JSON.parse(job.payload);
   const r=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...p,token:cfg.SHEETS_SYNC_TOKEN}),redirect:'follow',signal:AbortSignal.timeout(25000)});
   if(!r.ok)throw new Error(`Sheet receiver HTTP ${r.status}`);
   const data=await r.json() as {saved?:boolean;id?:string;notified?:boolean};
   if(data.saved!==true||data.id!==p.id)throw new Error('Sheet receiver did not confirm save');
   if(data.notified===false)throw new Error('Sheet saved; admin notification pending');
   await database().prepare("UPDATE sheet_jobs SET status='synced',last_error=NULL,lease_until=0,synced_at=? WHERE id=? AND version=?").bind(Date.now(),job.id,job.version).run();synced++;
  }catch(e){
   const delay=Math.min(300000,1000*2**Math.min(job.attempts,8));
   await database().prepare('UPDATE sheet_jobs SET last_error=?,lease_until=? WHERE id=? AND version=?').bind(e instanceof Error?e.message:'Sheet delivery failed',Date.now()+delay,job.id,job.version).run();
  }
 }
 const pending=await database().prepare("SELECT count(*) AS count FROM sheet_jobs WHERE status='pending'").first<{count:number}>();
 return {configured:true,synced,pending:!!pending?.count};
}

const consumerKeys=['residence','breakfast','priorities','challenges','product','occasion','appeal','preparation','interest','barriers','pack','channel'];
const consumerHeaders=['Q1 居住地','Q2 食事の取り方','Q3 食事で重視すること','Q4 食事の困りごと','Q5 試したい商品','Q6 利用シーン','Q7 魅力を感じた点','Q8 許容する準備時間','Q9 購入への関心','Q10 購入前に知りたいこと','Q11 希望するパック','Q12 希望する購入場所'];
export async function syncConsumer(id:string,send=true){
 const r=await database().prepare('SELECT * FROM responses WHERE id=?').bind(id).first<Record<string,any>>();if(!r)return;
 const a=JSON.parse(r.answers);
 const cells:Record<string,unknown>={'回答ID':r.id,'回答日時（UTC）':new Date(r.created_at).toISOString(),'LPパターン':r.theme,'補足回答':JSON.stringify(a._details||{}),'自由記述':r.feedback,'選んだプレゼント':r.gift||'','回答者メールアドレス':r.email||'','マーケティング同意':!!r.marketing_consent,'テスト回答':!!r.test,'回答状態':r.status,'最終更新日時（UTC）':new Date(r.updated_at||r.created_at).toISOString(),'回答済み質問数':r.answered_count,'プレゼント申込状態':r.email?'registered':'','回答リビジョン':r.revision,'Q13 性別':(a.gender||[]).join('; '),'Q14 職業・役職':(a.occupation||[]).join('; ')};
 consumerKeys.forEach((k,i)=>cells[consumerHeaders[i]]=(a[k]||[]).join('; '));
 await queueSheet('consumer',id,(r.updated_at||r.created_at),cells);
 if(send)await deliverSheets('consumer:'+id);
}
