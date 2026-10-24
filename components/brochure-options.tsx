'use client';
import {Localized,useLanguage,translate} from '@/lib/language';
import {useRef} from 'react';
import {RadioGroup,RadioGroupItem} from '@/components/ui/radio-group';

const designs=[
  {name:'Craft',image:'craft',concept:'Japanese tradition & trust',description:'Traditional Japanese values and the reassurance of trusted craftsmanship.'},
  {name:'Family',image:'family',concept:'Healthy food to share',description:'A wholesome food choice for the whole family to enjoy together.'},
  {name:'Everyday',image:'everyday',concept:'A little luxury for yourself',description:'An everyday luxury for your personal wellbeing and a better quality of life.'},
];
export function BrochureOptions({options,value,disabled,onChange}:{options:string[];value:string;disabled:boolean;onChange:(value:string)=>void}){
 const {language}=useLanguage();
 const preview=useRef<HTMLDialogElement>(null);
 const previewImage=useRef<HTMLImageElement>(null);
 function enlarge(image:string,name:string){if(previewImage.current){previewImage.current.src=`/images/brochures/${image}.jpg`;previewImage.current.alt=language==='ja'?`${name} パンフレット・外面全体`:`${name} brochure, full outer spread`;}preview.current?.showModal();}
 return <Localized><>
 <RadioGroup className="brochure-options" value={value} onValueChange={onChange} aria-labelledby="title-designPreference" disabled={disabled}>
 {designs.map((design,i)=><article className={`brochure-card ${value===options[i]?'selected':''}`} key={design.name}>
 <button type="button" className="brochure-enlarge" onClick={()=>enlarge(design.image,design.name)} aria-label={`Enlarge ${design.name} brochure`}><img src={`/images/brochures/${design.image}.jpg`} alt={`${design.name} brochure, full outer spread`} loading="lazy"/><span>View larger ↗</span></button>
 <label className="brochure-choice" htmlFor={`designPreference-${i}`}><RadioGroupItem value={options[i]} id={`designPreference-${i}`}/><span><strong>{design.name}</strong><b>{design.concept}</b><span>{design.description}</span></span></label>
 </article>)}
 <label className="option brochure-neutral"><RadioGroupItem value={options[3]} id="designPreference-3"/><span>{options[3]}</span></label>
 </RadioGroup>
 <dialog ref={preview} className="brochure-dialog" aria-label="Brochure preview" onClick={event=>{if(event.target===event.currentTarget)preview.current?.close();}}><button type="button" className="next-button" onClick={()=>preview.current?.close()} autoFocus>Close ×</button><img ref={previewImage} alt="Brochure preview"/></dialog>
 </></Localized>;
}
