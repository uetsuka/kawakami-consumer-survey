import Survey from '../survey';
import {notFound} from 'next/navigation';
export default async function Variant({params}:{params:Promise<{theme:string}>}){const {theme}=await params;if(!['family','fresh','craft'].includes(theme))notFound();return <Survey initialTheme={theme}/>;}
