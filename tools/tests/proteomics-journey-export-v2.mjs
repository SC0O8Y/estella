// SPDX-License-Identifier: Apache-2.0
// Verify the real Estella export, including renderer state and user navigation.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
const root=process.cwd(), out=path.join(root,'output');
const arg=process.argv.indexOf('--check-export');
if(arg<0||!process.argv[arg+1]) throw new Error('Expected --check-export <dir>');
const exported=path.resolve(process.argv[arg+1]);
assert(fs.existsSync(path.join(exported,'index.html')));
fs.mkdirSync(out,{recursive:true});
const cases=[],warnings=[];
function check(id,input,title){
 const png=path.join(out,'proteomics-'+id+'.png');
 const argv=['-a','pnpm','exec','electron','tools/launchers/launch-export.mjs',
   '--dir',exported,'--w','960','--h','540','--settle','14',
   '--timeout','95000','--out',png,'--probe','Stage Title','--facts'];
 if(input)argv.push('--input',JSON.stringify(input));
 const p=spawnSync('xvfb-run',argv,{cwd:root,encoding:'utf8',timeout:130000,maxBuffer:8*1024*1024,
   env:{...process.env,ELECTRON_DISABLE_SANDBOX:'1'}});
 const output=(p.stdout??'')+'\n'+(p.stderr??'');
 fs.writeFileSync(path.join(out,'proteomics-'+id+'.log'),output);
 assert(!p.error,id+': '+String(p.error));
 assert.match(output,/painted=true live=true/,id+': no live frame');
 const facts=JSON.parse((/\bfacts: (\{[^\n]*\})/.exec(output)||[])[1]||'null');
 const probe=JSON.parse((/\bprobe: (\{[^\n]*\})/.exec(output)||[])[1]||'null');
 assert(facts?.ready,id+': game not ready');
 assert.equal(facts.total,21,id+': wrong stage count');
 assert.equal(probe?.at?.['Stage Title']?.text,title,id+': wrong stage title');
 assert(fs.existsSync(png)&&fs.statSync(png).size>10000,id+': screenshot missing');
 const softwareLoss=/GPU device lost: context-lost/.test(output)&&/SwiftShader/.test(output);
 if(p.status!==0&&!softwareLoss)throw new Error(id+': unexpected browser exit '+p.status);
 if(softwareLoss)warnings.push(id+': SwiftShader context loss after a live rendered frame');
 cases.push({id,title,rendered:true,ready:true,frame:facts.frame,
   shapes:facts.visibleShapes,softwareGpuWarning:softwareLoss,screenshot:path.basename(png)});
}
try{
 check('initial',null,'Protein extraction');
 check('next',{taps:[{key:'ArrowRight',at:5}],frames:25},'DNA shearing and clarification');
 check('chapter4',{taps:[{key:'Digit4',at:5}],frames:25},'DDA label-free quantitation');
 check('animate',{taps:[{key:'Space',at:5}],frames:25},'Protein extraction');
 const report={pass:true,level:warnings.length?'rendered-with-software-gpu-warning':'fully-passed',cases,warnings};
 fs.writeFileSync(path.join(out,'proteomics-validation.json'),JSON.stringify(report,null,2));
 console.log(JSON.stringify(report));
}catch(e){
 const report={pass:false,error:String(e),cases,warnings};
 fs.writeFileSync(path.join(out,'proteomics-validation.json'),JSON.stringify(report,null,2));
 console.error(e);process.exitCode=1;
}
