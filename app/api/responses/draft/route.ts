import {database} from '@/lib/storage';
import {questions,validAnswer} from '@/lib/questions';

export async function POST(request:Request){
  if(request.headers.get('origin')&&request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'Request not allowed'},{status:403});
  if(!request.headers.get('content-type')?.includes('application/json'))return Response.json({error:'JSON required'},{status:415});
  try{
    const raw=await request.text();
    if(raw.length>16000)return Response.json({error:'Response too large'},{status:413});
    const p=JSON.parse(raw);
    if(typeof p.id!=='string'||!/^[0-9a-f-]{36}$/.test(p.id)||!['family','fresh','craft'].includes(p.theme)||!Number.isSafeInteger(p.revision)||p.revision<1||!p.answers||typeof p.answers!=='object'||Array.isArray(p.answers)||typeof p.feedback!=='string'||p.feedback.length>1000)return Response.json({error:'Invalid draft'},{status:400});
    if(Object.entries(p.answers).some(([key,value])=>{const q=questions.find(q=>q.id===key);return !q||!(Array.isArray(value)&&value.length===0)&&!validAnswer(q,value)}))return Response.json({error:'Invalid answers'},{status:400});
    if(p.details!==undefined&&(!p.details||typeof p.details!=='object'||Array.isArray(p.details)||Object.values(p.details).some(v=>typeof v!=='string'||v.length>500)))return Response.json({error:'Invalid details'},{status:400});
    const answered=questions.filter(q=>validAnswer(q,p.answers[q.id]));
    // An empty page view is not a response. An emptied existing draft may still update.
    const details=Object.fromEntries(questions.filter(q=>q.detailWhen&&p.answers[q.id]?.includes(q.detailWhen)&&p.details?.[q.id]).map(q=>[q.id,p.details[q.id].trim()]));
    const clean={...Object.fromEntries(answered.map(q=>[q.id,p.answers[q.id]])),_details:details,_version:2};
    const now=Date.now();
    await database().prepare(`INSERT INTO responses (id,theme,answers,feedback,created_at,test,status,updated_at,answered_count,revision)
      VALUES (?,?,?,?,?,?,'in_progress',?,?,?)
      ON CONFLICT(id) DO UPDATE SET theme=excluded.theme,answers=excluded.answers,feedback=excluded.feedback,updated_at=excluded.updated_at,answered_count=excluded.answered_count,revision=excluded.revision
      WHERE responses.status='in_progress' AND excluded.revision>responses.revision`).bind(p.id,p.theme,JSON.stringify(clean),p.feedback,now,p.test===true?1:0,now,answered.length,p.revision).run();
    return Response.json({saved:true,revision:p.revision});
  }catch{console.error('Survey draft save failed');return Response.json({error:'Could not save progress'},{status:503});}
}
