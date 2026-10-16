import {build} from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
await build({configFile:false,root,resolve:{alias:{'@':root}},plugins:[{name:'vercel-links',enforce:'pre',transform(code,id){if(id.endsWith('/app/survey.tsx'))return code.replaceAll('https://uetsuka.github.io/kawakami-business-survey/','https://kawakami-business-survey.vercel.app/');}},react()],build:{outDir:'vercel-dist',emptyOutDir:true,rollupOptions:{input:path.join(root,'vercel-index.html')}}});
await fs.rename(path.join(root,'vercel-dist/vercel-index.html'),path.join(root,'vercel-dist/index.html'));
