'use client';
import {useEffect,useState} from 'react';
import {translate,useLanguage} from '@/lib/language';

const scenes=[
  {id:'family',src:'/images/family.jpg',alt:'A smiling baby at a family mealtime'},
  {id:'fresh',src:'/images/woman.jpg',alt:'A woman enjoying tofu'},
  {id:'craft',src:'/images/craft.jpg',alt:'A tofu craftsman at work in Okinawa'},
];

export function HeroSlideshow({theme}:{theme:string}){
  const {language}=useLanguage();
  const [active,setActive]=useState(0);
  useEffect(()=>{
    if(theme!=='family')return;
    const preference=matchMedia('(prefers-reduced-motion: reduce)');
    let timer:ReturnType<typeof setInterval>|undefined;
    function update(){
      if(timer)clearInterval(timer);
      if(preference.matches){setActive(0);return;}
      timer=setInterval(()=>{
        if(!document.hidden)setActive(previous=>(previous+1)%scenes.length);
      },6500);
    }
    update();
    preference.addEventListener('change',update);
    return()=>{if(timer)clearInterval(timer);preference.removeEventListener('change',update);};
  },[theme]);
  const displayed=theme==='family'?scenes:scenes.filter(scene=>scene.id===theme);
  return <>{displayed.map((scene,index)=><img key={scene.id}
    className={`fv-image fv-scene fv-scene-${scene.id}${index===active||theme!=='family'?' is-active':''}`}
    src={scene.src} alt={translate(scene.alt,language)} aria-hidden={theme==='family'&&index!==active}
    loading="eager" decoding="async" draggable={false}/>)}</>;
}
