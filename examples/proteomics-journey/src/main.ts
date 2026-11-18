import {
  addPlugin, defineSystem, GetWorld, Res, Time, Input, UIEvents,
  Transform, MeshRenderer, Text, UINode, UIVisual, Playthrough
} from 'esengine';
import type { Entity, World } from 'esengine';
import { CHAPTERS, STAGES, chapterFirst, type Visual } from './stages';

// Native Estella 3D primitives. Each chapter uses the same reusable entity pool,
// not 21 static images. Positions are explanatory, not instrument engineering CAD.
type RGB = readonly [number, number, number];
type Point = readonly [number, number, number];
type Shape = {
  mesh: string; p: Point; scale: Point; color: RGB;
  rotation?: { x: number; y: number; z: number; w: number }; alpha?: number;
};
const CYAN: RGB = [.14, .86, .99], BLUE: RGB = [.32, .55, 1];
const VIOLET: RGB = [.72, .41, 1], ORANGE: RGB = [1, .62, .23];
const GREEN: RGB = [.39, .94, .59], RED: RGB = [1, .32, .45];
const YELLOW: RGB = [1, .87, .35], STEEL: RGB = [.22, .46, .63];
const MUTED: RGB = [.10, .23, .34];
const PALETTE: readonly RGB[] = [CYAN, BLUE, VIOLET, ORANGE, GREEN, YELLOW, RED];
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const mix = (a: number, b: number, p: number) => a + (b - a) * p;
const lerp = (a: Point, b: Point, p: number): Point => [
  mix(a[0], b[0], p), mix(a[1], b[1], p), mix(a[2], b[2], p)
];
function orientation(a: Point, b: Point) {
  const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2];
  const len = Math.hypot(dx, dy, dz) || 1;
  const q = { x: dz / len, y: 0, z: -dx / len, w: 1 + dy / len };
  const n = Math.hypot(q.x, q.y, q.z, q.w) || 1;
  return { x: q.x / n, y: q.y / n, z: q.z / n, w: q.w / n };
}

function buildVisual(visual: Visual, p: number, t: number, mode: string): Shape[] {
  const out: Shape[] = [];
  const push = (mesh: string, pt: Point, scale: Point, color: RGB, rotation?: Shape['rotation']) =>
    out.length < 92 && out.push({mesh, p: pt, scale, color, rotation});
  const ball = (x: number, y: number, z: number, r: number, c: RGB) =>
    push('sphere', [x,y,z], [r/50,r/50,r/50], c);
  const block = (x: number, y: number, z: number, sx: number, sy: number, sz: number, c: RGB) =>
    push('cube', [x,y,z], [sx,sy,sz], c);
  const tube = (a: Point,b: Point,r: number,c:RGB) => {
    const pt = lerp(a,b,.5);
    push('cylinder',pt,[r/50,Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2])/100,r/50],c,orientation(a,b));
  };
  const chain = (x: number, y: number, z: number, n: number, c: RGB, spread = 1) => {
    let prev: Point | null = null;
    for(let i=0;i<n;i++){
      const a: Point=[x+i*spread*10,y+Math.sin(i*.91+t*.28)*spread*15,z+Math.cos(i*.73)*spread*12];
      ball(...a,3.6,c);
      if(prev) tube(prev,a,1.15,STEEL);
      prev=a;
    }
  };
  const ring = (x:number,y:number,z:number,r:number,c:RGB,n=12)=>{
    for(let i=0;i<n;i++) {
      const a=i*Math.PI*2/n, b=(i+1)*Math.PI*2/n;
      tube([x+Math.cos(a)*r,y+Math.sin(a)*r,z],[x+Math.cos(b)*r,y+Math.sin(b)*r,z],.8,c);
    }
  };
  const graph = (arr:number[], color:RGB, base=-45, scale=65, x0=-64, step=10, z=0) => {
    for(let i=1;i<arr.length;i++)
      tube([x0+(i-1)*step,base+arr[i-1]*scale,z],[x0+i*step,base+arr[i]*scale,z],1.5,color);
  };
  const frame = () => {
    block(32,-68,-12,3.9,.10,1.65,MUTED);
    for(const x of [-135,195]) tube([x,-55,-12],[x,99,-12],1,STEEL);
    tube([-135,99,-12],[195,99,-12],1,STEEL);
  };
  const pct = clamp(p);
  frame();
  switch(visual){
    case 'sample':
    case 'dna':
    case 'reduce':
    case 'digest': {
      if(visual==='dna') {
        for(let i=0;i<18;i++){
          const x=-92+i*14, a=i*.66;
          const f=pct*.8;
          const ya=10+Math.sin(a)*25+((i>8)?f*13:0);
          const yb=10-Math.sin(a)*25-((i>8)?f*13:0);
          ball(x,ya,18,2.8,CYAN);ball(x,yb,18,2.8,VIOLET);
          if(i%3===0&&i<16) tube([x,ya,18],[x,yb,18],.8,STEEL);
        }
        break;
      }
      const chunks=visual==='digest'&&pct>.38?3:1;
      for(let k=0;k<chunks;k++){
        const n=visual==='digest'?Math.round(mix(15,5,pct)):(visual==='sample'?12:15);
        const x=-100+k*(visual==='digest'?90:0);
        const y=(visual==='sample'&&pct<.2)?-10:(visual==='sample'?15:5);
        chain(x,y+k*8,5,n,PALETTE[k%7],visual==='sample'?mix(.34,.9,pct):.9);
      }
      if(visual==='reduce'){
        const a:Point=[-8,28,13],b:Point=[50,4,13];
        if(pct<.48)tube(a,b,2.8,YELLOW);
        else{ball(...a,6,GREEN);ball(...b,6,GREEN);}
        if(pct>.68){ball(-2,32,13,8,VIOLET);ball(58,7,13,8,VIOLET);}
      }
      if(visual==='sample'){
        for(let i=0;i<15;i++) {
          const a=i*2.4+t*.4;
          ball(-55+Math.cos(a)*mix(15,87,pct),-6+Math.sin(a)*mix(9,39,pct),19,
            2.4,i%2===0?CYAN:BLUE);
        }
      }
      if(visual==='digest'){
        for(let i=0;i<9;i++)ball(-95+i*33,-36+pct*17+Math.sin(i+t)*5,16,2.8,GREEN);
      }
      break;
    }
    case 'assay': {
      for(let i=0;i<8;i++){
        const x=-100+(i%4)*65,y=34-Math.floor(i/4)*65;
        block(x,y-15,10,.53,.45,.55,MUTED);
        const raw=(.22+((i*7)%9)/11);
        const value=mix(raw,.7,pct);
        push('cylinder',[x,y-5,18],[.20, .10+value*.25,.2],i%2?BLUE:CYAN);
      }
      break;
    }
    case 'trap':
    case 'cleanup': {
      tube([20,-49,0],[20,77,0],31,STEEL);
      for(let i=0;i<16;i++){
        const a=(i*2.4)%6.28;
        ball(20+Math.cos(a)*21,-2+((i*11)%5)*6,Math.sin(a)*18+11,4.2,visual==='trap'?BLUE:CYAN);
      }
      for(let i=0;i<25;i++){
        const x=-115+(i*17)%285, y=70-(i*29)%85;
        const bind=visual==='trap'||i%3!==0;
        const tx=20+Math.sin(i*7.4)*19;
        const ty=-2+Math.cos(i*2.2)*15;
        const end: Point=bind?[tx,ty,15]:[105,-55,12];
        const start: Point=[x,y,15];
        const q=lerp(start,end,pct);
        ball(...q,3.3,bind?CYAN:ORANGE);
      }
      break;
    }
    case 'pickup': {
      block(-75,-53,0,.68,1.1,.72,STEEL);
      tube([-75,-52,0],[-75,14,0],18,BLUE);
      const nx=mix(56,-75,pct<.5?pct*2:1);
      const ny=pct<.5?mix(90,8,pct*2):mix(8,91,(pct-.5)*2);
      tube([nx,ny,0],[nx,ny-57,0],4,CYAN);
      if(mode==='Trap loading'){
        tube([nx,ny+5,0],[40,ny+5,0],4,STEEL);
        tube([40,ny+5,0],[40,-45,0],4,BLUE);
        push('cylinder',[40,-28,0],[.16,.48,.16],VIOLET);
        tube([40,-50,0],[140,-50,0],3,CYAN);
      } else {
        tube([nx,ny+5,0],[148,ny+5,0],4,CYAN);
        tube([148,ny+5,0],[148,-48,0],3,STEEL);
      }
      for(let i=0;i<14;i++){
        const q=clamp((pct-.48)*2.7-i*.02);
        ball(mix(-75,125,q),mix(-6,20+((i%3)-1)*4,q),3,2.2,GREEN);
      }
      break;
    }
    case 'lc': {
      tube([-118,0,0],[190,0,0],20,STEEL);
      for(let i=0;i<30;i++){
        const shift=(i*5)%55;
        const x=mix(-107,180,clamp(pct*1.4+shift/95-.35));
        ball(x,Math.sin(i*2.3)*15,Math.cos(i*.85)*15,2.1,PALETTE[i%7]);
      }
      for(let i=0;i<7;i++){
        const center=mix(-95,165,clamp(pct*1.3-i*.065));
        for(let j=0;j<4;j++)ball(center+(j-1.5)*3,42+Math.sin(j+i)*2,10,2.5,PALETTE[i]);
      }
      break;
    }
    case 'esi': {
      tube([-100,64,0],[-68,15,0],12,STEEL);
      for(let i=0;i<55;i++){
        const u=(i*13%55)/55, phase=clamp(u+pct*.7);
        const r=phase*70;
        const a=i*2.41+t*.6;
        ball(-55+phase*195,10+(Math.sin(a)*r),Math.cos(a)*r*.55, mix(5,2,phase),
          PALETTE[i%7]);
      }
      break;
    }
    case 'ms1':
    case 'isolate':
    case 'fragment':
    case 'ms3': {
      for(let k=0;k<4;k++){
        const x=-85+k*75;
        ring(x,0,0,30,k===2?ORANGE:BLUE,12);
        tube([x,-36,0],[x,-46,0],3,MUTED);
      }
      for(let i=0;i<33;i++){
        const u=(i/33), speed=visual==='ms1'?.88:.65;
        const x=mix(-130,170,clamp(pct*speed+u*.30));
        ball(x,Math.sin(i*2.5+t*1.1)*18,Math.cos(i*.9)*13,3.6,PALETTE[i%7]);
      }
      if(visual==='isolate'){
        const window=mode==='DIA'?90:22,center=mode==='DIA'?46:85;
        block(center,60,5,window/100,.07,.5,mode==='DIA'?CYAN:ORANGE);
        for(let i=0;i<12;i++){
          const x=-70+i*23, y=-52+((i*13)%7)*10;
          const selected=Math.abs(x-center)<window/2;
          ball(x,y,36,selected?4.9:2.5,selected?GREEN:MUTED);
        }
      }
      if(visual==='fragment'||visual==='ms3'){
        for(let i=0;i<20;i++){
          const x=22+(i%10)*17,y=-40+Math.floor(i/10)*55;
          const delta=clamp(pct*2-.25);
          ball(mix(20,x,delta),mix(0,y,delta),34,3,i%2?VIOLET:GREEN);
        }
      }
      if(visual==='ms3'){
        for(let i=0;i<10;i++){
          const h=8+((i*13)%27)+pct*20;
          block(-96+i*29,-64+h/2,54,.10,h/100,.12,PALETTE[i%7]);
        }
      }
      if(visual==='ms1'){
        // Different selectable teaching schematics, not OEM-exact ion paths.
        if(mode==='Orbitrap Astral'){
          tube([65,6,0],[65,77,0],2.3,CYAN);
          ring(65,76,0,19,CYAN,10);
          tube([65,76,0],[160,76,0],2.1,ORANGE);
        } else if(mode==='Orbitrap Eclipse'){
          ring(50,57,0,17,VIOLET,10);
          tube([50,45,0],[160,76,0],2.3,VIOLET);
          ring(165,76,0,18,YELLOW,10);
        } else {
          ring(98,54,0,23,GREEN,12);
          tube([25,30,0],[100,53,0],2,GREEN);
        }
        for(let i=0;i<12;i++){
          const h=12+((i*31)%56);
          block(-103+i*25,-58+h/2,55,.08,h/100,.1,i%2?CYAN:BLUE);
        }
      }
      break;
    }
    case 'fasta':{
      for(let row=0;row<4;row++){
        const y=70-row*40;
        for(let i=0;i<14;i++){
          const x=-98+i*20;
          const separation=clamp(pct*1.5);
          ball(x,y+(row-1.5)*separation*13,0,4,PALETTE[(i+row)%7]);
          if(i%5!==4&&i<13) tube([x,y+(row-1.5)*separation*13,0],[x+17,y+(row-1.5)*separation*13,0],1.1,STEEL);
        }
      }
      break;
    }
    case 'psm':{
      const threshold=mix(73,30,pct);
      tube([-115,-55,0],[174,-55,0],1.3,STEEL);
      tube([-115,-55,0],[-115,91,0],1.3,STEEL);
      tube([-115,threshold-55,0],[174,threshold-55,0],1.2,YELLOW);
      for(let i=0;i<58;i++){
        const score=(i*19+((i*i)%13))%100;
        const isDecoy=i%7===0;
        const y=-52+score*1.25;
        ball(-105+(i%29)*9.4,y,8,2.8,isDecoy?RED:(score>threshold?GREEN:BLUE));
      }
      break;
    }
    case 'protein':{
      for(let j=0;j<3;j++)chain(-105,-45+j*58,4,5,j===1?VIOLET:CYAN,.58);
      for(let k=0;k<3;k++){
        block(144,61-k*67,12,.72,.35,.44,PALETTE[k+1]);
        for(let j=0;j<3;j++){
          const a:Point=[-72,-45+j*58,0],b:Point=[124,61-k*67,12];
          if((k+j)%3!==1)tube(a,lerp(a,b,pct),1.3,k===1?VIOLET:STEEL);
        }
      }
      break;
    }
    case 'lfq':
    case 'dia':{
      tube([-107,-55,0],[190,-55,0],1.2,STEEL);
      tube([-107,-55,0],[-107,85,0],1.2,STEEL);
      const peaks=(x:number,shift:number)=>Math.exp(-Math.pow((x-12-shift)/11,2))*.78
         +Math.exp(-Math.pow((x-49-shift)/16,2))*.63
         +Math.exp(-Math.pow((x-78-shift)/8,2))*.41;
      for(let k=0;k<(visual==='dia'?4:2);k++){
        const trace:number[]=[];
        for(let i=0;i<24;i++){
          const v=i*4.2, alignment=mix((k-1)*5,0,pct);
          trace.push(peaks(v,alignment+(visual==='dia'?k-1:0)*2)*(1-k*.12));
        }
        graph(trace,PALETTE[k],-45,105,-102,12,2+k*8);
      }
      break;
    }
    case 'tmt':{
      tube([-105,-58,0],[183,-58,0],1.4,STEEL);
      for(let i=0;i<10;i++){
        const v=(12+((i*17)%58))*(.3+.7*pct);
        block(-93+i*28,-58+v/2,5,.13,v/100,.18,PALETTE[i%7]);
        ball(-93+i*28,-58+v,5,3.4,PALETTE[i%7]);
      }
      break;
    }
    case 'statistics':{
      tube([0,-53,0],[0,95,0],1.2,STEEL);
      tube([-112,-53,0],[193,-53,0],1.2,STEEL);
      const border=-16+pct*17;
      tube([-112,border,0],[193,border,0],.7,YELLOW);
      for(let i=0;i<67;i++){
        const effect=(((i*37)%79)-39)/39;
        const strength=clamp((Math.abs(effect)*.75+(i*11%19)/60)*pct);
        const x=30+effect*136;
        const y=-42+strength*123;
        ball(x,y,9,2.5,Math.abs(effect)>.48&&strength>.53?(effect>0?RED:GREEN):BLUE);
      }
      break;
    }
  }
  return out;
}

addPlugin({
  name:'proteomics-journey',
  build(app){
    let stageIndex=0, modeIndex=0, phase=0, running=false, auto=false, hold=0, elapsed=0;
    let lastIndex=-1, lastMode='', lastAuto=false;
    const cache=new Map<string,Entity>();
    const facts={ready:false,stage:1,total:STAGES.length,title:'',chapter:0,mode:'',phase:0,running:false,auto:false,frame:0,visibleShapes:0};
    app.insertResource(Playthrough,{facts});
    const find=(w:World,name:string)=>{
      let e=cache.get(name);
      if(e===undefined){
        const found=w.findEntityByName(name);
        if(found===null)throw new Error('Proteomics Journey entity missing: '+name);
        e=found;cache.set(name,e);
      }
      return e;
    };
    const label=(w:World,name:string,value:string,fontsize?:number)=>{
      const e=find(w,name),v=w.get(e,Text);
      if(v.content!==value||(fontsize!==undefined&&v.fontSize!==fontsize))
        w.insert(e,Text,{...v,content:value,...(fontsize?{fontSize:fontsize}:{})});
    };
    const color=(w:World,name:string,rgba:{r:number;g:number;b:number;a:number})=>{
      const e=find(w,name),v=w.get(e,UIVisual);
      if(v.color.r!==rgba.r||v.color.g!==rgba.g||v.color.b!==rgba.b)
        w.insert(e,UIVisual,{...v,color:rgba});
    };
    const jump=(n:number)=>{
      stageIndex=Math.max(0,Math.min(STAGES.length-1,n));
      modeIndex=0;phase=0;running=false;hold=0;
    };
    const start=()=>{phase=0;running=true;hold=0;};
    app.addSystem(defineSystem(
      [GetWorld(),Res(Time),Res(Input),Res(UIEvents)],
      (world,time,input,events)=>{
        if(world.findEntityByName('Stage Title')===null)return;
        facts.frame++;
        const dt=Math.min(.05,Math.max(0,time.delta));
        elapsed+=dt;
        if(input.isKeyPressed('ArrowRight')||input.isKeyPressed('PageDown'))jump(stageIndex+1);
        if(input.isKeyPressed('ArrowLeft')||input.isKeyPressed('PageUp'))jump(stageIndex-1);
        if(input.isKeyPressed('Space'))start();
        if(input.isKeyPressed('KeyP'))auto=!auto;
        if(input.isKeyPressed('KeyM'))modeIndex++;
        for(let k=1;k<=4;k++)if(input.isKeyPressed('Digit'+k))jump(chapterFirst(k-1));
        for(const evt of events.query('click')){
          const e=evt.target;
          if(e===find(world,'Next'))jump(stageIndex+1);
          if(e===find(world,'Prev'))jump(stageIndex-1);
          if(e===find(world,'Action'))start();
          if(e===find(world,'Auto'))auto=!auto;
          if(e===find(world,'Mode'))modeIndex++;
          for(let k=0;k<4;k++)if(e===find(world,'Chapter '+k))jump(chapterFirst(k));
        }
        const s=STAGES[stageIndex];
        const variants=s.modes||['SCHEMATIC'];
        const mode=variants[((modeIndex%variants.length)+variants.length)%variants.length];
        if(running){
          phase=clamp(phase+dt/3.6);
          if(phase>=1){running=false;hold=0;}
        }else if(auto){
          if(phase<1)running=true;
          else {
            hold+=dt;
            if(hold>2.5)jump(stageIndex===STAGES.length-1?0:stageIndex+1);
          }
        }
        if(lastIndex!==stageIndex||lastMode!==mode||lastAuto!==auto){
          label(world,'Stage Number',String(stageIndex+1).padStart(2,'0')+'  /  '+STAGES.length);
          label(world,'Stage Strap',s.strap);
          label(world,'Stage Title',s.title,s.title.length>30?29:33);
          label(world,'Concept',s.concept,s.concept.length>175?18:20);
          label(world,'Observation',s.observable,s.observable.length>140?16:18);
          label(world,'Caution',s.caution,s.caution.length>175?13:15);
          label(world,'Stage Caption',CHAPTERS[s.chapter]);
          label(world,'Mode',mode+'  ↻');
          s.labels.forEach((value,i)=>label(world,'Pill Label '+i,value));
          for(let i=0;i<4;i++)
            color(world,'Chapter '+i,i===s.chapter?
              {r:.08,g:.41,b:.49,a:1}:{r:.068,g:.12,b:.17,a:1});
          label(world,'Auto',auto?'AUTO  ON':'AUTO  OFF');
          lastIndex=stageIndex;lastMode=mode;lastAuto=auto;
        }
        label(world,'Action',running?'ANIMATING…':phase>=1?'↺  REPLAY STEP':s.action.toUpperCase());
        label(world,'Status',(running?'RUNNING':'READY')+' · '+String(stageIndex+1).padStart(2,'0')+'/'+STAGES.length);
        const fill=find(world,'Progress Fill'),f=world.get(fill,UINode);
        const width=435*(stageIndex+phase)/STAGES.length;
        if(f.width.value!==width)world.insert(fill,UINode,{...f,width:{unit:0,value:Math.max(5,width)}});
        const shapes=buildVisual(s.visual,phase,elapsed,mode);
        // MeshRenderer.mesh is an engine mesh handle (number), not a resource
        // path. Use scene-authored mesh pools and change visibility / pose.
        for(let i=0;i<92;i++){
          const sh=shapes[i];
          for(const kind of ['sphere','cube','cylinder'] as const){
            const prefix=kind==='sphere'?'Part ':kind==='cube'?'Cube ':'Cylinder ';
            const e=find(world,prefix+String(i).padStart(3,'0'));
            const m=world.get(e,MeshRenderer);
            const active=!!sh&&sh.mesh===kind;
            if(!active){
              if(m.enabled)world.insert(e,MeshRenderer,{...m,enabled:false});
              continue;
            }
            const nextColor={r:sh.color[0],g:sh.color[1],b:sh.color[2],a:sh.alpha??1};
            if(!m.enabled||m.color.r!==nextColor.r||m.color.g!==nextColor.g
               ||m.color.b!==nextColor.b||m.color.a!==nextColor.a)
              world.insert(e,MeshRenderer,{...m,enabled:true,color:nextColor});
            const tr=world.get(e,Transform);
            world.insert(e,Transform,{
              ...tr,position:{x:sh.p[0],y:sh.p[1],z:sh.p[2]},
              scale:{x:sh.scale[0],y:sh.scale[1],z:sh.scale[2]},
              rotation:sh.rotation||{x:0,y:0,z:0,w:1}
            });
          }
        }
        Object.assign(facts,{ready:true,stage:stageIndex+1,title:s.title,chapter:s.chapter,
          total:STAGES.length,mode,phase,running,auto,visibleShapes:shapes.length});
      },{name:'ProteomicsJourneyDirector'}
    ));
  }
});
