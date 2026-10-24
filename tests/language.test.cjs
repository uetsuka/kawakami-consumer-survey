const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
const React=require('react');
const {renderToStaticMarkup}=require('react-dom/server');
const cache=new Map();
function load(file){
 file=path.resolve(__dirname,'..',file);if(cache.has(file))return cache.get(file).exports;
 const module={exports:{}};cache.set(file,module);
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText;
 new Function('require','module','exports',code)(name=>name.startsWith('.')?load(path.relative(path.join(__dirname,'..'),path.resolve(path.dirname(file),name+'.ts'))):require(name),module,module.exports);
 return module.exports;
}
const {translate,localize}=load('lib/language.tsx');
const {questions,validAnswer}=load('lib/questions.ts');
test('every question, option, hint and detail label has a Japanese translation',()=>{
 for(const q of questions)for(const value of [q.section,q.title,q.hint,q.detailLabel,...q.options].filter(Boolean))assert.notEqual(translate(value,'ja'),value,value);
});
test('language switching changes display without changing canonical answer values or IDs',()=>{
 const click=()=>{};
 const original=React.createElement('label',{htmlFor:'residence-0'},React.createElement('input',{id:'residence-0',value:'Yes',onChange:click}),React.createElement('span',null,'Yes'));
 const ja=localize(original,'ja');
 assert.equal(ja.props.htmlFor,'residence-0');
 assert.equal(ja.props.children[0].props.value,'Yes');
 assert.equal(ja.props.children[0].props.onChange,click);
 assert.match(renderToStaticMarkup(ja),/>はい</);
 assert.match(renderToStaticMarkup(localize(original,'en')),/>Yes</);
 assert.ok(validAnswer(questions[0],['Yes']));
 assert.equal(validAnswer(questions[0],['はい']),false);
});
test('progress, instructions and accessibility labels localize',()=>{
 assert.equal(translate('3 of 15 answered','ja'),'15問中3問回答済み');
 assert.equal(translate('Choose up to 3.','ja'),'最大3つ選んでください。');
 const node=React.createElement('input',{placeholder:'We’d love to hear it.','aria-label':'Email address',value:'Yes'});
 const ja=localize(node,'ja');assert.equal(ja.props['aria-label'],'メールアドレス');assert.equal(ja.props.value,'Yes');
});
