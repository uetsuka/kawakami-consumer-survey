'use client';
import {useState,useEffect,useRef} from 'react';
import {RadioGroup,RadioGroupItem} from '@/components/ui/radio-group';
import {Checkbox} from '@/components/ui/checkbox';
import {Progress} from '@/components/ui/progress';
import {Gift,ArrowUpRight,Check,ArrowLeft,Clock,LockKeyhole} from 'lucide-react';
import {questions,validAnswer} from '@/lib/questions';
import {StickerGift} from '@/components/sticker-gift';

const products=[{"name":"Yushi tofu","jp":"ゆし豆腐","image":"/images/yushi.jpg","text":"Soft tofu curds for a quick warm meal. Enjoy with an Okara Spoon and optional spring onions and grated ginger.","serve":"3–5 min (estimate). Follow the pack instructions; heat in the original container only when it is suitable for heating, otherwise use a microwave-safe dish. Enjoy with an Okara Spoon. Add spring onions and grated ginger if you like. For busy parents, including households with a baby.","allergen":"Contains soy. Okara Spoon contains wheat, egg and soy."},{"name":"Shima tofu","jp":"島豆腐","image":"/images/shima.webp","text":"Firm Okinawan tofu for a quick pan-fry. Season to taste, scatter with spring onions, and add cabbage or carrots if you like.","serve":"3–10 min (estimate). Drain, cut into bite-sized pieces and pan-fry in a little oil. Season to taste and scatter with spring onions. Add cabbage or carrots if you like.","allergen":"Contains soy."},{"name":"Atsuage","jp":"厚揚げ","image":"/images/atsuage.webp","text":"Pan-seared tofu steak with a simple soy sauce, water and sugar sauce, made with plant-based ingredients.","serve":"3–10 min (estimate). Pat dry and pan-sear both sides in vegetable oil until heated through. Simmer soy sauce, water and a little sugar, then pour over the tofu.","allergen":"Contains soy."},{"name":"Okara spoon","jp":"おからスプーン","image":null,"text":"An edible spoon made with okara from tofu-making. Enjoy with dessert and explore food and ingredients together.","serve":"2–5 min to serve. Add to a dessert just before serving. A playful opportunity for parents and children to talk about food and its ingredients.","allergen":"Contains wheat, egg and soy."}];
export default function Survey({initialTheme}:{initialTheme:string}){
const [theme,setTheme]=useState(initialTheme),[answers,setAnswers]=useState<Record<string,string[]>>({}),[visible,setVisible]=useState(0),[details,setDetails]=useState<Record<string,string>>({}),[feedback,setFeedback]=useState(''),[status,setStatus]=useState<'editing'|'saving'|'saved'>('editing'),[error,setError]=useState(''),[email,setEmail]=useState(''),[consent,setConsent]=useState(false),[registered,setRegistered]=useState(false),[registerBusy,setRegisterBusy]=useState(false),[giftSkipped,setGiftSkipped]=useState(false);
const id=useRef(''),timer=useRef<ReturnType<typeof setTimeout>|null>(null),answersRef=useRef(answers);answersRef.current=answers;
const draftRevision=useRef(0),draftPayload=useRef(''),draftStatus=useRef(status);
draftStatus.current=status;
const [autosave,setAutosave]=useState<'idle'|'saving'|'saved'|'error'>('idle');
useEffect(()=>{
 if(status!=='editing'||(!Object.keys(answers).length&&!id.current))return;
 id.current ||=crypto.randomUUID();
 const revision=++draftRevision.current;
 const body=JSON.stringify({id:id.current,theme,answers,details,feedback,revision,test:true});
 draftPayload.current=body;
 let disposed=false;let retry:ReturnType<typeof setTimeout>|undefined;
 async function save(){
  setAutosave('saving');
  try{const r=await fetch('/api/responses/draft',{method:'POST',headers:{'Content-Type':'application/json'},body,keepalive:true});if(!r.ok)throw new Error();if(!disposed)setAutosave('saved');}
  catch{if(!disposed){setAutosave('error');retry=setTimeout(save,5000);}}
 }
 const pending=setTimeout(save,450);
 return()=>{disposed=true;clearTimeout(pending);clearTimeout(retry);};
},[answers,details,feedback,theme,status]);
useEffect(()=>{
 const flush=()=>{if(draftStatus.current!=='editing'||!draftPayload.current)return;const blob=new Blob([draftPayload.current],{type:'application/json'});if(!navigator.sendBeacon('/api/responses/draft',blob))void fetch('/api/responses/draft',{method:'POST',headers:{'Content-Type':'application/json'},body:draftPayload.current,keepalive:true}).catch(()=>{});};
 const hidden=()=>{if(document.visibilityState==='hidden')flush();};
 window.addEventListener('pagehide',flush);document.addEventListener('visibilitychange',hidden);
 return()=>{window.removeEventListener('pagehide',flush);document.removeEventListener('visibilitychange',hidden);};
},[]);
const count=questions.filter(q=>validAnswer(q,answers[q.id])).length;
function scroll(target:string){requestAnimationFrame(()=>{const el=document.getElementById(target);el?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});el?.focus({preventScroll:true});});}
function advance(index:number){if(timer.current)clearTimeout(timer.current);setVisible(v=>Math.max(v,index+1));timer.current=setTimeout(()=>scroll(index===3?'products':index===11?'review':`q-${index+1}`),220);}
function choose(index:number,value:string,auto=true){if(status!=='editing')return;const q=questions[index];if(!q.options.includes(value))return;setAnswers(prev=>{const old=prev[q.id]||[];let next:string[];if(!q.max)next=[value];else if(old.includes(value))next=old.filter(v=>v!==value);else if(q.exclusive?.includes(value))next=[value];else{next=old.filter(v=>!q.exclusive?.includes(v));if(next.length>=q.max)return prev;next=[...next,value];}return {...prev,[q.id]:next};});if(!q.max&&auto){if(timer.current)clearTimeout(timer.current);if(value!==q.detailWhen)advance(index);}}
useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current)},[]);
useEffect(()=>{const ctx=(document as unknown as {modelContext?:{registerTool:(tool:unknown,options:unknown)=>void}}).modelContext;if(!ctx)return;const ctl=new AbortController();try{ctx.registerTool({name:'get_survey_state',description:'Read the current questionnaire answers and progress. Does not submit data.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:()=>({answers:answersRef.current,questionCount:12})},{signal:ctl.signal});}catch{}return()=>ctl.abort();},[]);
async function submit(){if(count!==12||status!=='editing')return;setStatus('saving');setError('');id.current ||=crypto.randomUUID();try{const r=await fetch('/api/responses',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:id.current,theme,answers,details,feedback,test:true})});const data=await r.json() as {error?:string};if(!r.ok)throw new Error(data.error);setStatus('saved');scroll('gifts');}catch(e){setStatus('editing');setError(e instanceof Error?e.message:'Unable to save. Please try again.');}}
async function subscribe(e:React.FormEvent){e.preventDefault();setRegisterBusy(true);setError('');try{const r=await fetch('/api/responses',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:id.current,email,consent,giftDelivery:true})});const data=await r.json() as {error?:string;delivery?:string};if(!r.ok)throw new Error(data.error);if(data.delivery!=='download')throw new Error('Please try again to unlock your images.');setRegistered(true);scroll('sticker-signup');}catch(e){setError((e as Error).message);}finally{setRegisterBusy(false);}}
return <main className={`site ${theme}`}>
<div className="fv-screen">
<div className="review-bar"><span>DESIGN PREVIEW</span><nav aria-label="Design variants">{['family','fresh','craft'].map((t,i)=><button key={t} onClick={()=>{setTheme(t);history.replaceState(null,'',`/${t}`)}} aria-pressed={theme===t}>{`0${i+1} ${t==='family'?'Family':t==='fresh'?'Everyday':'Craft'}`}</button>)}</nav></div>
<header className="masthead"><a className="kawakami-brand" href="#top" aria-label="Kawakami Foods, back to top"><img src="/images/kawakami-logo.png" alt="川上食品" width="327" height="73"/><small>KAWAKAMI FOODS</small></a><a className="business-link" href="https://uetsuka.github.io/kawakami-business-survey/" target="_blank" rel="noopener noreferrer" aria-label="For Businesses (opens in a new tab)">For Businesses <ArrowUpRight size={16}/></a></header>
<section className="fv-stage" id="top">
<img className="fv-image" src={theme==='craft'?'/images/craft.jpg':theme==='fresh'?'/images/woman.jpg':'/images/family.jpg'} alt={theme==='craft'?'A tofu craftsman at work in Okinawa':theme==='fresh'?'A woman enjoying tofu':'A smiling baby at a family mealtime'}/>
{theme==='craft'&&<div className="fv-gold" aria-hidden="true"/>}
<div className="fv-heading"><p>TRADITIONAL OKINAWAN TOFU</p><h1>A Little <em>Luxury.</em></h1><span>A Taste of Okinawa at Your Table</span></div>
<div className="fv-present reward-card"><p>A gift for everyone</p><div className="reward-showcase"><img className="reward-use-preview" src="/images/stickers/whatsapp-use-v2.jpg" alt="Usage mockup: a Kawakami Foods Take Care sticker in a WhatsApp conversation" draggable={false}/><div className="reward-sample-strip"><div className="reward-sample-tile"><img src="/images/stickers/reward-sample-v2.jpg" alt="SAMPLE: Can! WhatsApp sticker" draggable={false}/></div><div className="reward-sample-tile"><img src="/images/stickers/reward-sample-v2.jpg" alt="SAMPLE: Makan Time? WhatsApp sticker" draggable={false}/></div></div></div><span>4 WhatsApp stickers</span><small>Complete the survey and claim your pack.</small></div>
<div className="fv-heritage heritage-lockup"><span>SINCE 1958</span><p className="heritage-top"><b>68</b> <em>Years</em> <span>of Taste</span></p><p className="heritage-bottom"><span>&amp;</span>Craftsmanship</p></div>
</section>
<div className="fv-start"><button onClick={()=>scroll('q-0')}>Start the survey <ArrowUpRight size={22}/></button><p>12 questions <span>·</span> ~4 minutes</p></div>
</div>
<div className="fv-disclosure"><p>A little Okinawan character for your everyday chats.</p><small>Estimated survey time: about 4 minutes.</small></div>
<div className="fv-disclosure"><small>Your answers are saved automatically as you go, even if you do not submit the survey, to help us understand product preferences. Please do not include personal or sensitive information.</small>{status==='editing'&&autosave!=='idle'&&<p role="status" aria-live="polite">{autosave==='saved'?'Progress saved':autosave==='saving'?'Saving progress…':'Progress could not be saved. Retrying… Please keep this page open.'}</p>}</div>
<div className="survey-top"><div><span>YOUR OKINAWA FOOD SURVEY</span><span>{status==='saved'?'Complete':`${count} of 12 answered`}</span></div><Progress value={count/12*100} aria-label="Questions answered"/></div>
<div className="survey-body">{questions.slice(0,Math.min(visible+1,12)).map((q,index)=><div key={q.id}>
{index===4&&<section className="product-section" id="products" tabIndex={-1}><div className="section-heading"><p className="eyebrow">FROM OKINAWA TO YOUR TABLE</p><h2>Meet your next<br/><em>little discovery.</em></h2><p>Explore a few ways to enjoy tofu and more. Which one feels like you?</p></div><div className="product-grid">{products.map(p=><article key={p.name}>{p.image?<img src={p.image} alt={p.name} loading="lazy"/>:<div className="product-wordmark"><span>OKARA</span><span>SPOON</span><small>PRODUCT PHOTO TO COME</small></div>}<div className="product-copy"><span className="jp">{p.jp}</span><h3>{p.name}</h3><p>{p.text}</p><p className="serving">{p.serve}</p><small>{p.allergen}</small></div></article>)}</div><button className="text-button" onClick={()=>scroll('q-4')}>Choose your favourite <ArrowUpRight size={18}/></button></section>}
<section className={`question ${answers[q.id]?.length?'answered':''}`} id={`q-${index}`} tabIndex={-1}><div className="question-meta"><span>{String(index+1).padStart(2,'0')} / 12</span><span>{q.section}</span>{validAnswer(q,answers[q.id])&&<Check size={18}/>}</div><h2 id={`title-${q.id}`}>{q.title}</h2><p className="question-hint">{q.hint|| (q.max?(q.all?'Select all that apply.':`Choose up to ${q.max}.`):'Choose one. We’ll take you to the next question.')} {q.max&&q.hint?(q.all?'Select all that apply.':`Choose up to ${q.max}.`):''}</p>
{q.max?<div className="options" role="group" aria-labelledby={`title-${q.id}`}>{q.options.map((o,i)=><label className={`option ${(answers[q.id]||[]).includes(o)?'selected':''}`} key={o}><Checkbox id={`${q.id}-${i}`} checked={(answers[q.id]||[]).includes(o)} disabled={status!=='editing'} onCheckedChange={()=>choose(index,o)}/><span>{o}</span></label>)}</div>:<RadioGroup className="options" value={answers[q.id]?.[0]||''} onValueChange={v=>choose(index,v)} aria-labelledby={`title-${q.id}`} disabled={status!=='editing'}>{q.options.map((o,i)=><label className={`option ${answers[q.id]?.[0]===o?'selected':''}`} key={o}><RadioGroupItem value={o} id={`${q.id}-${i}`}/><span>{o}</span></label>)}</RadioGroup>}
{q.exclusive&&<p className="tiny">“{q.exclusive.join('” and “')}” cannot be combined with other options.</p>}
{q.detailWhen&&answers[q.id]?.includes(q.detailWhen)&&<div className="answer-detail"><label htmlFor={`detail-${q.id}`}>{q.detailLabel} <span>(optional)</span></label><textarea id={`detail-${q.id}`} maxLength={500} disabled={status!=='editing'} value={details[q.id]||''} onChange={e=>setDetails(prev=>({...prev,[q.id]:e.target.value}))}/><p className="tiny">Choose Next when you are ready.</p></div>}
<div className="question-nav">{index>0?<button className="text-button" onClick={()=>scroll(`q-${index-1}`)}><ArrowLeft size={16}/> Back</button>:<span className="tiny">Your honest opinion matters.</span>}<button className="next-button" disabled={!validAnswer(q,answers[q.id])||status!=='editing'} onClick={()=>advance(index)}>{index===11?'Review & submit':'Next'} <ArrowUpRight size={17}/></button></div></section></div>)}
{visible>=12&&status!=='saved'&&<section className="question review" id="review" tabIndex={-1}><p className="eyebrow">THANK YOU FOR YOUR TIME</p><h2>Anything else<br/>you’d like us to know?</h2><label htmlFor="feedback">Optional — ideas, questions or suggestions. Do not include personal details or medical history.</label><textarea id="feedback" value={feedback} maxLength={1000} onChange={e=>setFeedback(e.target.value)} placeholder="We’d love to hear it."/><p className="privacy"><LockKeyhole size={17}/> Your responses are used to explore product demand and presentation for Singapore. Contact details are not required. This preview saves test responses only; please do not enter personal or sensitive information.</p><button className="primary" disabled={count!==12||status==='saving'} onClick={submit}>{status==='saving'?'Saving your answers…':'Submit & claim my stickers'} <Gift size={20}/></button><p className="tiny">All completed responses qualify, whatever your answers.</p>{error&&<p className="error" role="alert">{error}</p>}</section>}
{status==='saved'&&<section className="gift-section" id="gifts" tabIndex={-1}>
{giftSkipped?<><h2>Thank you for<br/><em>sharing your thoughts.</em></h2><p>Your survey response is saved.</p><button className="text-button" onClick={()=>setGiftSkipped(false)}>Back to my sticker gift</button></>:<>
<p className="eyebrow">YOUR WHATSAPP STICKER GIFT</p><h2>{registered?<>A little character<br/><em>for your chats.</em></>:<>One more step<br/><em>to your stickers!</em></>}</h2>
{!registered&&<><p>Get all four Kawakami Foods sticker images.<br/>Enter your email to unlock your PNG downloads and illustrated guide.</p><div className="gift-pack-preview"><img src="/images/stickers/reward-sample-v2.jpg" alt="SAMPLE preview of the new four Kawakami Foods stickers" draggable={false}/></div></>}
<div className="signup gift-signup" id="sticker-signup" tabIndex={-1}>{registered?<StickerGift/>:<form onSubmit={subscribe}>
<label htmlFor="email">Email address</label><input id="email" type="email" autoComplete="email" value={email} required maxLength={254} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" aria-describedby="gift-email-use"/>
<p id="gift-email-use" className="tiny">We’ll use this address for your sticker gift. Product news is optional.</p>
<label className="consent"><Checkbox checked={consent} onCheckedChange={v=>setConsent(v===true)}/><span>Also send me product news and Singapore availability updates from Kawakami Foods. (Optional)</span></label>
<button className="next-button" disabled={registerBusy}>{registerBusy?'Saving…':'Unlock my sticker images'} <ArrowUpRight size={18}/></button>
{error&&<p className="error" role="alert">{error}</p>}
</form>}</div>
{!registered&&<button className="text-button gift-skip" disabled={registerBusy} onClick={()=>{setGiftSkipped(true);setError('');scroll('gifts');}}>Finish without my gift</button>}
</>}
</section>}
</div><footer><span>KAWAKAMI FOODS</span><p>Okinawan roots. Everyday pleasure.</p><small>Design preview · Not yet open for consumer research</small></footer></main>
}
