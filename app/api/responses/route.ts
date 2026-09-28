import {database} from '@/lib/storage';
import {questions,validAnswer} from '@/lib/questions';
export async function POST(request:Request){
if(request.headers.get('origin')&&request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'Request not allowed'},{status:403});
if(!request.headers.get('content-type')?.includes('application/json'))return Response.json({error:'JSON required'},{status:415});
try{const raw=await request.text();if(raw.length>16000)return Response.json({error:'Response too large'},{status:413});const p=JSON.parse(raw);
if(!/^[0-9a-f-]{36}$/.test(p.id)||!['family','fresh','craft'].includes(p.theme)||typeof p.answers!=='object'||!p.answers||questions.some(q=>!validAnswer(q,p.answers[q.id]))||typeof p.feedback!=='string'||p.feedback.length>1000)return Response.json({error:'Please complete all 12 questions.'},{status:400});
const clean=Object.fromEntries(questions.map(q=>[q.id,p.answers[q.id]]));
await database().prepare('INSERT INTO responses (id,theme,answers,feedback,created_at,test) VALUES (?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING').bind(p.id,p.theme,JSON.stringify(clean),p.feedback,Date.now(),p.test===true?1:0).run();
return Response.json({id:p.id,saved:true},{status:201});
}catch(e){console.error('Survey save failed',e instanceof Error?e.message:'Unknown error');return Response.json({error:'We could not save your answers. Please try again. Your answers are still on this page.'},{status:503});}}
export async function PATCH(request:Request){
if(request.headers.get('origin')&&request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'Request not allowed'},{status:403});
try{const raw=await request.text();if(raw.length>2000)return Response.json({error:'Request too large'},{status:413});const p=JSON.parse(raw);if(!/^[0-9a-f-]{36}$/.test(p.id))return Response.json({error:'Invalid response'},{status:400});
if(p.gift!==undefined){if(!['snapchat','wallpaper'].includes(p.gift))return Response.json({error:'Choose a gift'},{status:400});const r=await database().prepare('UPDATE responses SET gift=? WHERE id=?').bind(p.gift,p.id).run();if(!r.meta.changes)return Response.json({error:'Response not found'},{status:404});}
else{if(p.consent!==true||typeof p.email!=='string'||p.email.length>254||!/^\S+@\S+\.\S+$/.test(p.email))return Response.json({error:'Enter a valid email and tick the consent box.'},{status:400});const r=await database().prepare('UPDATE responses SET email=?,marketing_consent=1 WHERE id=?').bind(p.email.trim(),p.id).run();if(!r.meta.changes)return Response.json({error:'Response not found'},{status:404});}
return Response.json({saved:true});}catch{return Response.json({error:'Could not save. Please try again.'},{status:503});}}
