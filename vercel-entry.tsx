import React from 'react';
import {createRoot} from 'react-dom/client';
import Survey from './app/survey';
import './app/globals.css';
const name=location.pathname.split('/').filter(Boolean)[0];
createRoot(document.getElementById('root')!).render(<Survey initialTheme={['family','fresh','craft'].includes(name)?name:'family'}/>);
