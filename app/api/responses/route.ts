import {database} from '@/lib/storage';
import {questions,validAnswer} from '@/lib/questions';
import {grant} from '@/lib/sticker-access';
export async function POST(request:Request){
if(request.headers.get('origin')&&request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'Request not allowed'},{status:403});
if(!request.headers.get('content-type')?.includes('application/json'))return Response.json({error:'JSON required'},{status:415});
try{const raw=await request.text();if(raw.length>16000)return Response.json({error:'Response too large'},{status:413});const p=JSON.parse(raw);
if(!/^[0-9a-f-]{36}$/.test(p.id)||!['family','fresh','craft'].includes(p.theme)||typeof p.answers!=='object'||!p.answers||questions.some(q=>!validAnswer(q,p.answers[q.id]))||typeof p.feedback!=='string'||p.feedback.length>1000)return Response.json({error:`Please complete all ${questions.length} questions. pick Prefer not to say if you would rather not answer a personal question.`},{status:400});
if(p.details!==undefined&&(typeof p.details!=='object'||p.details===null||Array.isArray(p.details)||Object.values(p.details).some(v=>typeof v!=='string'||v.length>500)))return Response.json({error:'Please shorten your additional answers.'},{status:400});
const details=Object.fromEntries(questions.filter(q=>q.detailWhen&&p.answers[q.id].includes(q.detailWhen)&&p.details?.[q.id]).map(q=>[q.id,p.details[q.id].trim()]));
const clean={...Object.fromEntries(questions.map(q=>[q.id,p.answers[q.id]])),_details:details,_version:3};
const now=Date.now();
await database().prepare(`INSERT INTO responses (id,theme,answers,feedback,created_at,test,status,updated_at,answered_count) VALUES (?,?,?,?,?,?,'submitted',?,?)
ON CONFLICT(id) DO UPDATE SET theme=excluded.theme,answers=excluded.answers,feedback=excluded.feedback,status='submitted',updated_at=excluded.updated_at,answered_count=excluded.answered_count
WHERE responses.status='in_progress'`).bind(p.id,p.theme,JSON.stringify(clean),p.feedback,now,p.test===true?1:0,now,questions.length).run();
return Response.json({id:p.id,saved:true},{status:201});
}catch(e){console.error('Survey save failed',e instanceof Error?e.message:'Unknown error');return Response.json({error:'We could not save your answers. Please try again. Your answers are still on this page.'},{status:503});}}
export async function PATCH(request:Request){
if(request.headers.get('origin')&&request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'Request not allowed'},{status:403});
if(!request.headers.get('content-type')?.includes('application/json'))return Response.json({error:'JSON required'},{status:415});
try{
 const raw=await request.text();if(raw.length>2000)return Response.json({error:'Request too large'},{status:413});
 const p=JSON.parse(raw);
 if(!/^[0-9a-f-]{36}$/.test(p.id))return Response.json({error:'Invalid response'},{status:400});
 const email=typeof p.email==='string'?p.email.trim():'';
 if(typeof p.consent!=='boolean'||email.length>254||!/^\S+@\S+\.\S+$/.test(email))return Response.json({error:'Enter a valid email address.'},{status:400});
 const r=await database().prepare("UPDATE responses SET gift='whatsapp',email=?,marketing_consent=?,updated_at=? WHERE id=? AND status='submitted'").bind(email,p.consent?1:0,Date.now(),p.id).run();
 if(!r.meta.changes)return Response.json({error:'Please submit your survey before requesting your stickers.'},{status:409});
 const token=await grant(p.id);const secure=new URL(request.url).protocol==='https:'?'; Secure':'';
 return Response.json({saved:true,delivery:'download',downloads:['can','makan','sorry','takecare'].map(name=>({name,url:`/api/stickers/${name}.png`}))},{headers:{'Cache-Control':'no-store','Set-Cookie':`sticker_gift=${token}; HttpOnly; SameSite=Lax; Path=/api/stickers; Max-Age=604800${secure}`}});
}catch{return Response.json({error:'Could not save your sticker request. Please try again.'},{status:503});}}
