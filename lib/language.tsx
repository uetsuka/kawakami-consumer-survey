'use client';
import {Children,cloneElement,createContext,isValidElement,useContext,useEffect,useState,type ReactNode} from 'react';
import {japanese} from './translations-ja';
export type Language='en'|'ja';
const LanguageContext=createContext<{language:Language;setLanguage:(language:Language)=>void}>({language:'en',setLanguage:()=>{}});
export function LanguageProvider({children}:{children:ReactNode}){
 const [language,setLanguageState]=useState<Language>('en');
 useEffect(()=>{const query=new URLSearchParams(location.search).get('lang');let saved:string|null=null;try{saved=localStorage.getItem('kawakami-language');}catch{}setLanguageState(query==='ja'||(query!=='en'&&saved==='ja')?'ja':'en');},[]);
 useEffect(()=>{document.documentElement.lang=language;},[language]);
 function setLanguage(next:Language){setLanguageState(next);try{localStorage.setItem('kawakami-language',next);}catch{}const url=new URL(location.href);url.searchParams.set('lang',next);history.replaceState(null,'',url);}
 return <LanguageContext.Provider value={{language,setLanguage}}>{children}</LanguageContext.Provider>;
}
export const useLanguage=()=>useContext(LanguageContext);
export function translate(text:string,language:Language):string{
 if(language==='en')return text;
 const key=text.trim();
 const translated=japanese[key];
 if(translated)return text.replace(key,translated);
 if(/^Choose up to \d+\.$/.test(key))return `最大${key.match(/\d+/)![0]}つ選んでください。`;
 const progress=key.match(/^(\d+) of (\d+) answered$/);if(progress)return `${progress[2]}問中${progress[1]}問回答済み`;
 const brochure=key.match(/^Enlarge (.+) brochure$/);if(brochure)return `${brochure[1]}のパンフレットを拡大`;
 const spread=key.match(/^(.+) brochure, full outer spread$/);if(spread)return `${spread[1]}のパンフレット・外面全体`;
 const sticker=key.match(/^(.+) Kawakami Foods sticker image — press and hold to save to your photos$/);if(sticker)return `${sticker[1]} 川上食品のステッカー画像・長押しして写真に保存`;
 const incomplete=key.match(/^Please complete all (\d+) questions\. pick Prefer not to say if you would rather not answer a personal question\.$/);if(incomplete)return `全${incomplete[1]}問にご回答ください。個人に関する質問に答えたくない場合は「回答しない」を選んでください。`;
 if(key==='questions')return '問';if(key==='~5 minutes')return '約5分';
 if(key.includes('” and “'))return key.split('” and “').map(part=>translate(part,language)).join('」「');
 return text;
}
// Translate presentation only. Answer values, IDs, URLs, event handlers and user input stay unchanged.
export function localize(node:ReactNode,language:Language):ReactNode{
 if(language==='en')return node;
 if(typeof node==='string')return translate(node,language);
 if(Array.isArray(node))return Children.map(node,child=>localize(child,language));
 if(!isValidElement<Record<string,unknown>>(node))return node;
 const props:Record<string,unknown>={};
 if(node.props.children!==undefined)props.children=localize(node.props.children as ReactNode,language);
 for(const key of ['alt','title','placeholder','aria-label'])if(typeof node.props[key]==='string')props[key]=translate(node.props[key] as string,language);
 return cloneElement(node,props);
}
export function Localized({children}:{children:ReactNode}){const {language}=useLanguage();return localize(children,language);}
