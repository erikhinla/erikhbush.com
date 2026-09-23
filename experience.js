(() => {
'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const local=location.protocol==='file:'||['localhost','127.0.0.1','[::1]'].includes(location.hostname);
const media=name=>window.REVIEW_MEDIA?.[name]||('assets/'+name);

function mountInfra(){
 const stale=$('.infra');
 if(stale && stale.querySelector('.infra-hang'))return;
 stale?.remove();
 $('.mark')?.remove();
 const onBiz=document.body.dataset.page==='business';
 const onLife=document.body.dataset.page==='life';
 const home=onLife?'#arrival':(onBiz?'/':'#arrival');
 const life=onLife?'#routes':'https://erikhbush.com';
 const daily=onLife?'#daily':'https://erikhbush.com';
 const proof=onLife?'https://transformby10x.ai/bbai':'#proof';
 const me=onLife?'/story':'https://erikhbush.com/story';
 const mark=document.createElement('a');
 mark.className='mark';
 mark.href=home;
 mark.innerHTML='<span class="mark-back" aria-hidden="true">‹</span><span class="mark-here"></span>';
 mark.setAttribute('aria-label','Back');
 const box=document.createElement('details');
 box.className='infra';
 const hangHref=onLife?'/story#wall':'#gallery';
 const hangOpen=onLife?'':'data-open="gallery"';
 box.innerHTML=`<summary class="infra-trace" aria-label="INFRA"><span></span></summary><nav aria-label="INFRA"><p class="infra-word">INFRA</p><a class="infra-lane" data-lane="life" href="${life}">Life</a><a class="infra-child" data-lane="life" href="${daily}">De-Fog</a><a class="infra-lane" data-lane="biz" href="${onLife?'https://transformby10x.ai/bbai':'/bbai'}">Work</a><a class="infra-child" data-lane="biz" href="${proof}">PROOF</a><a class="infra-me" href="${me}">How we got here</a><a class="infra-child" href="${me}#notes">Field notes</a><a class="infra-child infra-hang" href="${hangHref}" ${hangOpen}>The hang</a></nav>`;
 document.body.append(mark,box);
 box.querySelectorAll('nav a').forEach(el=>el.addEventListener('click',()=>box.removeAttribute('open')));
 markInfra();
 syncMark($('[data-world]'));
}
function markInfra(){
 const life=document.body.classList.contains('lane-life');
 const biz=document.body.classList.contains('lane-biz');
 document.querySelectorAll('.infra [data-lane]').forEach(el=>{
  const here=(life&&el.dataset.lane==='life')||(biz&&el.dataset.lane==='biz');
  const dim=(life&&el.dataset.lane==='biz')||(biz&&el.dataset.lane==='life');
  el.classList.toggle('is-here',here);
  el.classList.toggle('is-dim',dim);
 });
 const me=document.querySelector('.infra-me');
 if(me){
  const onMe=['founder','about'].includes(($('[data-world].is-in')||{}).id)||!!document.getElementById('gallery')?.open;
  me.classList.toggle('is-here',onMe);
  me.classList.toggle('is-dim',!onMe&&(life||biz));
 }
 const hang=document.querySelector('.infra-hang');
 if(hang) hang.classList.toggle('is-here',!!document.getElementById('gallery')?.open);
}
function syncMark(best){
 const mark=$('.mark');if(!mark)return;
 const onBiz=document.body.dataset.page==='business';
 const onLife=document.body.dataset.page==='life';
 const id=best?.id||(onLife?'arrival':(onBiz?'proof':'arrival'));
 const names={arrival:'',recognition:'Fog',gate:'Gate',carry:'',routes:'',proof:'PROOF',daily:'De-Fog',founder:'Me',build:'BBAI','how-i-build':'BBAI','business-close':'BBAI'};
 const here=names[id]||'';
 const atHome=onLife?id==='arrival':(onBiz?id==='proof':id==='arrival');
 const list=$$('[data-world]');
 const i=list.findIndex(el=>el.id===id);
 const prev=i>0?list[i-1]:null;
 const back=prev?('#'+prev.id):(onLife?'/life':(onBiz?'/bbai':'#arrival'));
 mark.classList.toggle('is-home',atHome);
 const label=mark.querySelector('.mark-here');
 if(label) label.textContent=atHome?'':here;
 mark.setAttribute('href',atHome?(onLife?'/life':(onBiz?'/bbai':'#arrival')):back);
 mark.setAttribute('aria-label',atHome?'Home':'Back to '+(names[prev?.id]||'the last beat'));
}

const SOUND_FILM={
  'b2b-task-1-world.mp4':'b2b-task-1.mp4',
  'b2b-task-2-world.mp4':'b2b-task-2.mp4',
  'b2b-task-4-world.mp4':'b2b-task-4.mp4',
  'b2b-task-5-world.mp4':'b2b-task-5.mp4',
  'b2b-task-6-world.mp4':'b2b-task-6.mp4',
  'proof-world.mp4':'proof-mood-3.mp4'
};
const videos=[$('#world-a'),$('#world-b')].filter(Boolean);videos.forEach(v=>{v.autoplay=!reduced;v.muted=true;v.playsInline=true;const file=(v.getAttribute('src')||'').split('/').pop();if(file)v.dataset.file=file;});let version=0,wanted='',activeScene=null,modalFilm=null,soundOn=false,bed=null;
try{soundOn=sessionStorage.getItem('tbtx-sound')==='on';}catch{}
function ensureBed(){
  if(bed)return bed;
  bed=document.createElement('video');
  bed.id='world-bed';
  bed.loop=true;
  bed.playsInline=true;
  bed.setAttribute('playsinline','');
  bed.muted=true;
  bed.setAttribute('aria-hidden','true');
  bed.style.cssText='position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;left:-99px;top:-99px';
  document.body.appendChild(bed);
  return bed;
}
function stopBed(){
  if(!bed)return;
  bed.pause();
  bed.muted=true;
}
function liveWorld(){return videos.find(v=>v.classList.contains('visible')&&v.dataset.file)||videos.find(v=>v.dataset.file)||videos[0];}
function syncBed(name){
  const live=liveWorld();
  videos.forEach(v=>{v.muted=true;});
  if(!soundOn||!name||name==='off'){stopBed();return;}
  const mapped=SOUND_FILM[name];
  if(!mapped){
    stopBed();
    if(live){live.muted=false;live.volume=1;live.play().catch(()=>{});}
    return;
  }
  const b=ensureBed();
  const url=media(mapped);
  if(b.dataset.file!==mapped){
    b.dataset.file=mapped;
    b.src=url;
    b.load();
  }
  b.muted=false;
  b.volume=1;
  b.play().catch(()=>{});
}
function applySound(){
  const scene=wanted||activeScene?.dataset.world||'';
  syncBed(scene);
  const gal=$('#gallery-film');
  if(gal)gal.muted=!soundOn;
  $$('.route-lane video,.fog-stack video').forEach(v=>{v.muted=true;});
  const b=$('#sound-toggle');if(!b)return;
  b.setAttribute('aria-pressed',String(soundOn));
  b.setAttribute('aria-label',soundOn?'Sound on':'Sound off');
}
function setSound(on){
  soundOn=!!on;
  try{sessionStorage.setItem('tbtx-sound',soundOn?'on':'');}catch{}
  applySound();
}
function changeWorld(name,light=.8,crop){
 const world=$('#world');if(!world)return;
 const level=Number.isFinite(Number(light))?Number(light):.8;
 world.style.setProperty('--light',String(level));
 world.dataset.scene=name||'off';
 if(crop)world.style.setProperty('--crop',crop);else world.style.removeProperty('--crop');
 const hide=v=>{v.classList.remove('visible');v.style.opacity='0';v.pause();};
 const show=v=>{v.classList.add('visible');v.style.opacity=String(level);};
 if(!name||name==='off'){
  wanted='off';
  videos.forEach(hide);
  stopBed();
  return;
 }
 const holding=videos.find(v=>v.dataset.file===name);
 if(holding){
  wanted=name;
  videos.forEach(v=>{if(v!==holding)hide(v);});
  show(holding);
  holding.muted=true;
  if(!reduced&&!document.hidden)holding.play().catch(()=>{});
  syncBed(name);
  return;
 }
 wanted=name;
 const token=++version;
 const outgoing=videos.find(v=>v.classList.contains('visible'))||null;
 const next=outgoing===videos[0]?videos[1]:videos[0];
 next.dataset.file=name;
 next.preload='auto';
 next.setAttribute('preload','auto');
 next.muted=true;
 next.loop=true;
 next.playsInline=true;
 next.poster='assets/'+(name==='proof-world.mp4'?'proof-mood-3':name.replace('.mp4',''))+'.jpg';
 next.src=media(name);
 let shown=false;
 const reveal=()=>{
  if(token!==version||shown)return;
  shown=true;
  videos.forEach(v=>{if(v!==next)hide(v);});
  show(next);
  syncBed(name);
  if(outgoing&&outgoing!==next) setTimeout(()=>{if(outgoing.dataset.file!==wanted){outgoing.pause();outgoing.removeAttribute('src');outgoing.removeAttribute('poster');delete outgoing.dataset.file;outgoing.load();}},900);
 };
 next.addEventListener('canplay',()=>{reveal();if(!reduced&&!document.hidden)next.play().catch(()=>{});},{once:true});
 next.addEventListener('error',reveal,{once:true});
 reveal();
 if(!reduced&&!document.hidden) next.play().catch(()=>{});
}
const acts=$$('[data-world]');let framePending=false;
function syncChrome(best){
 const chrome=$('.chrome');if(!chrome)return;
 const id=best?.id||(document.body.dataset.page==='business'?'proof':'arrival');
 const nudesOpen=!!$('#gallery')?.open;
 const atHome=id==='arrival'&&!nudesOpen&&document.body.dataset.page!=='business';
 const label=nudesOpen?'THE HANG':({arrival:'',recognition:'',gate:'',routes:'',proof:'PROOF',build:'BBAI',daily:'DDD',founder:'TBTX','how-i-build':'BBAI','business-close':'BBAI'}[id]||'');
 chrome.classList.toggle('is-away',!atHome);
 chrome.dataset.chapter=nudesOpen?'hang':(label||id||'');
 const now=$('.brand-now');if(now) now.textContent=atHome?'':label;
 const nav=nudesOpen?'hang':id==='proof'?'proof':id==='daily'?'daily':id==='build'?'build':'';
 $$('[data-nav]').forEach(el=>el.setAttribute('aria-current',String(el.dataset.nav===nav)));
}
function updateWorld(){
 framePending=false;if(!acts.length)return;
 const mid=innerHeight*.45;let best=acts[0],bestScore=-Infinity;
 for(const act of acts){
  const r=act.getBoundingClientRect();if(r.height<=0)continue;
  const vis=Math.min(r.bottom,innerHeight)-Math.max(r.top,0);if(vis<=0)continue;
  const score=vis-Math.abs((r.top+r.bottom)/2-mid)*.25;
  if(score>bestScore){bestScore=score;best=act;}
 }
 activeScene=best;if(!modalFilm)changeWorld(best.dataset.world,Number(best.dataset.light),best.dataset.crop);
 syncMark(best);
 document.body.classList.add('world-ready');
 syncChrome(best);
 document.body.classList.toggle('on-arrival',best?.id==='arrival');
 const arrival=$('#arrival');
 if(arrival){const r=arrival.getBoundingClientRect();arrival.classList.toggle('is-past',r.bottom<innerHeight*.5);}
}
function queueWorld(){if(!framePending){framePending=true;requestAnimationFrame(updateWorld);}}
function bindWorldScroll(){
 const seen=new Set();
 const add=el=>{if(!el||seen.has(el))return;seen.add(el);el.addEventListener('scroll',queueWorld,{passive:true});};
 add(window);add(document);add(document.scrollingElement);add(document.documentElement);add(document.body);add($('#experience'));
 addEventListener('resize',queueWorld);
 if('IntersectionObserver' in window){const io=new IntersectionObserver(()=>queueWorld(),{threshold:[0,.25,.5,1],rootMargin:'0px'});acts.forEach(a=>io.observe(a));}
 updateWorld();
}
if(reduced)$$('[data-sc-act]').forEach(a=>a.setAttribute('data-sc-act','flow'));
if(acts[0]) changeWorld(acts[0].dataset.world,Number(acts[0].dataset.light),acts[0].dataset.crop);
try{if(window.ScrollCraft&&$('#experience'))window.reviewScrollcraft=window.ScrollCraft.mount($('#experience'));}catch(err){}
bindWorldScroll();
const modalVideos={'method-dialog':'proof-mood-2.mp4','map-intro':'b2b-task-6-world.mp4','ddd-intro':'off','ddd':'off','ddd-method':'off','funding':'off','trace':'b2b-task-1-world.mp4','blueprint':'proof-world.mp4','growth':'b2b-task-5-world.mp4','philosophy':'b2b-task-1-world.mp4','flow-engine':'b2b-task-1-world.mp4','about':'erik-portrait.mp4','gallery':'off'};
let lastTrigger=null,modalStack=[];
let lastScroll=0;
function coverPage(on){
 if(on){
  if(!document.documentElement.classList.contains('is-sheet')) lastScroll=window.scrollY||document.documentElement.scrollTop||0;
 }else if(state.gate) document.body.classList.add('stood');
 document.documentElement.classList.toggle('is-sheet',on);
 document.body.classList.toggle('is-sheet',on);
 ['#experience','.chrome','.mark','.infra','.site-menu'].forEach(sel=>{
  const el=$(sel); if(!el) return;
  if(on){el.setAttribute('hidden','');el.setAttribute('inert','');el.style.setProperty('display','none','important');el.style.setProperty('visibility','hidden','important');}
  else{el.removeAttribute('hidden');el.removeAttribute('inert');el.style.removeProperty('display');el.style.removeProperty('visibility');}
 });
 if(!on) requestAnimationFrame(()=>{window.scrollTo(0,lastScroll);requestAnimationFrame(()=>window.scrollTo(0,lastScroll));});
}
function modalWorld(){const opened=$$('dialog[open]'),topId=modalStack.at(-1)?.id,d=opened.find(x=>x.id===topId)||opened.at(-1);opened.forEach(x=>x.classList.toggle('behind-dialog',x!==d));if(!d){modalFilm=null;updateWorld();return;}
 if(d.id==='questionnaire'&&state.lane==='personal'){
  if(state.showingResult){modalFilm='defog-daily-hero.mp4';changeWorld(modalFilm,.92);return;}
  modalFilm='fog-story.mp4';changeWorld(modalFilm,.72);return;
 }
 const film=modalVideos[d.id];if(film==='off'){modalFilm='off';changeWorld('off',0);return;}modalFilm=film||activeScene?.dataset.world||null;if(!modalFilm){updateWorld();return;}const bright=['map-intro','ddd-intro'].includes(d.id)?.88:.58;const crop=d.id==='about'?'50% 18%':undefined;changeWorld(modalFilm,bright,crop);}
function open(id,trigger=document.activeElement){if(id==='trace'&&!state.traceDone){beginTrace();return;}if(!document.documentElement.classList.contains('is-sheet')) lastScroll=window.scrollY||document.documentElement.scrollTop||0;if(id==='gallery')buildHang();const d=$('#'+id);if(!d)return;lastTrigger=trigger;if(!d.open){modalStack.push({id,trigger});d.classList.remove('behind-dialog');try{d.showModal();}catch{d.setAttribute('open','');}}coverPage(true);document.documentElement.style.overflow='hidden';modalWorld();d.scrollTop=0;requestAnimationFrame(()=>d.querySelector('h2')?.focus({preventScroll:true}));}
function close(d){(typeof d==='string'?$('#'+d):d)?.close();}
function closeAll(){for(const d of $$('dialog[open]'))d.close();modalStack=[];}
function bindDialog(d){if(!d||d.dataset.bound)return;d.dataset.bound='1';d.addEventListener('close',()=>{d.querySelectorAll('video').forEach(v=>v.pause());const entry=modalStack.findLast(x=>x.id===d.id);modalStack=modalStack.filter(x=>x.id!==d.id);if(!$$('dialog[open]').length){document.documentElement.style.overflow='';coverPage(false);entry?.trigger?.focus?.({preventScroll:true});}modalWorld();syncChrome(activeScene);});d.addEventListener('click',e=>{if(e.target.closest('[data-close]'))close(d);});}$$('dialog').forEach(bindDialog);
document.addEventListener('click',e=>{const b=e.target.closest('[data-open]');if(b){e.preventDefault();open(b.dataset.open,b);}});
document.addEventListener('click',e=>{const jump=e.target.closest('[data-close-go]');if(!jump)return;e.preventDefault();const target=jump.getAttribute('data-close-go')||jump.getAttribute('href');closeAll();if(target)go(target.startsWith('#')?target:'#'+target);});
function go(id){const el=$(id);if(!el)return;el.scrollIntoView({behavior:reduced?'instant':'smooth',block:'start'});}
const state={gate:false,lane:null,step:0,selections:[],personalSelections:null,showingResult:false,traceDone:false};
try{state.gate=sessionStorage.getItem('tbtx-entry')==='up';const p=JSON.parse(localStorage.getItem('tbtx-scan-v3'));if(p?.version==='site-20260914'&&score('personal',p.answers))state.personalSelections=p.answers;}catch{}
function beginTrace(){setStood(true);setLane('business');state.lane='business';state.step=0;state.traceDone=false;const qs=window.REVIEW_QUESTIONS?.business;if(!qs){open('map-intro');return;}state.selections=Array(qs.length).fill(null);renderQuestion();open('questionnaire');}
function setStood(on){state.gate=!!on;document.body.classList.toggle('stood',state.gate);if(on)$$('[data-sc-in]').forEach(el=>el.classList.add('sc-in'));try{sessionStorage.setItem('tbtx-entry',state.gate?'up':'');}catch{}}
if(state.gate){document.body.classList.add('stood');$$('[data-sc-in]').forEach(el=>el.classList.add('sc-in'));}
const gateCopy={out:'Consume and be consumed by AI tools without learning them and get passed by those who did.',back:'Continue Managing Digital Fog as AI\'s assistant, always busy but not building something scalable that moves you.',up:'It was never yours to carry. Eight answers. See where it shows up.'};
const gateUpHtml=document.body.dataset.page==='life'
  ?'It was never yours to carry.<br>Eight answers. See where it shows up.'
  :'It was never yours to carry.<br>Fifteen answers. See where it shows up.';
$$('[data-choice]').forEach(b=>b.onclick=()=>{const choice=b.dataset.choice,gateEl=$('#gate .gate')||$('#gate');$$('[data-choice]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));const copy=$('#gate-copy');if(copy){copy.hidden=false;copy.innerHTML=choice==='up'?gateUpHtml:(gateCopy[choice]||'');}gateEl.classList.add('is-answered');setStood(choice==='up');document.body.classList.toggle('held',choice!=='up');if(choice==='up'){document.body.classList.remove('held');if(document.body.dataset.page==='business'){beginTrace();return;}go($('#routes')?'#routes':($('#daily')?'#daily':'#proof'));}});
function score(lane,selections){const qs=window.REVIEW_QUESTIONS[lane];if(!qs||!Array.isArray(selections)||selections.length!==qs.length||qs.some((q,i)=>!Number.isInteger(selections[i])||!q.options[selections[i]]))return null;const values=qs.map((q,i)=>q.options[selections[i]].value),raw=values.reduce((a,b)=>a+b,0),max=qs.length*2,result=Math.round(100*raw/max);const band=lane==='personal'?(result<50?'Carrying it':'Clear enough'):result<25?'Fragmented':result<50?'Stalled':result<75?'Scaling':'Compounding';return{raw,max,result,band,values};}
function setLane(lane){document.body.classList.toggle('lane-life',lane==='personal');document.body.classList.toggle('lane-biz',lane==='business');try{if(lane)sessionStorage.setItem('tbtx-lane',lane);}catch{}markInfra();}
try{const lane=sessionStorage.getItem('tbtx-lane');if(lane==='personal'||lane==='business')setLane(lane);}catch{}
if(document.body.dataset.page==='business'){ setLane('business'); setStood(true); }
if(document.body.dataset.page==='life'){ /* gate stays a beat. do not auto-stand. */ }
try{
 const path=location.pathname.replace(/\/$/,'')||'/';
 if(path==='/scan'||/\bstart=scan\b/.test(location.search)){setStood(true);setTimeout(()=>start('personal'),280);}
 if(path==='/map'||path==='/bbai/map'||/\bstart=map\b/.test(location.search)){setStood(true);setLane('business');setTimeout(()=>start('business'),280);}
}catch{}
function start(lane){closeAll();const onBiz=document.body.dataset.page==='business';const onLife=document.body.dataset.page==='life';if(lane==='personal'&&onBiz){location.href='/life?start=scan';return;}if(lane==='business'&&onLife){location.href='https://transformby10x.ai/bbai?start=map';return;}if(!state.gate&&!onBiz){if($('#gate')){go('#gate');return;}}if(!state.gate)setStood(true);setLane(lane);state.lane=lane;state.step=0;const qs=window.REVIEW_QUESTIONS?.[lane];if(!qs){if(lane==='business')open('map-intro');return;}state.selections=Array(qs.length).fill(null);if(lane==='business')open('map-intro');else{renderQuestion();open('questionnaire');}}
document.addEventListener('click',e=>{const a=e.target.closest('a[href="#proof"],a[href="#daily"]');if(!a)return;const onBiz=document.body.dataset.page==='business';const onLife=document.body.dataset.page==='life';if(onBiz)return;if(a.getAttribute('href')==='#proof'&&onLife){e.preventDefault();location.href='/bbai';return;}if(!state.gate){e.preventDefault();go('#gate');return;}setLane(a.getAttribute('href')==='#proof'?'business':'personal');},true);
document.addEventListener('click',e=>{const b=e.target.closest('[data-start]');if(!b)return;e.preventDefault();e.stopPropagation();start(b.dataset.start);});
const beginMap=$('#begin-map');if(beginMap)beginMap.onclick=()=>{close('map-intro');renderQuestion();open('questionnaire');};
function focusQuestion(){$('#question-title').focus({preventScroll:true});$('#questionnaire').scrollTop=0;}
function renderQuestion(){state.traceDone=false;const qs=window.REVIEW_QUESTIONS[state.lane],q=qs[state.step],selected=state.selections[state.step];state.showingResult=false;$('#questionnaire')?.classList.remove('is-handoff');$('#question-lane').textContent=(state.lane==='business'?'Friction Trace':'Digital Fog Scan')+' · '+(state.step+1)+' / '+qs.length;
 $('#question-body').innerHTML=`<div class="question-progress" aria-hidden="true"><span style="width:${100*state.step/qs.length}%"></span></div><h2 id="question-title" tabindex="-1">${escape(q.text)}</h2><div class="answer-options" role="radiogroup" aria-labelledby="question-title">${q.options.map((o,i)=>`<label class="answer-option"><input type="radio" name="answer" value="${i}" ${i===selected?'checked':''}><span>${escape(o.text)}</span></label>`).join('')}</div><details class="question-insight"><summary aria-label="Why this question?">Y?</summary><p>${escape(window.QUESTION_NOTES[state.lane][q.id])}</p></details><div class="q-nav"><button id="previous" ${state.step===0?'disabled':''}>Back</button><button id="next" class="action" ${selected===null?'disabled':''}>${state.step===qs.length-1?'See the starting point':'Next'} <span class="arr" aria-hidden="true"></span></button></div>`;
 $$('input[name=answer]').forEach(el=>el.onchange=()=>{state.selections[state.step]=Number(el.value);$('#next').disabled=false;});$('#previous').onclick=()=>{if(state.step>0){state.step--;renderQuestion();focusQuestion();}};$('#next').onclick=()=>{if(state.selections[state.step]===null)return;if(state.step<qs.length-1){state.step++;renderQuestion();focusQuestion();}else renderResult();};modalWorld();}
function pointLabel(n){return n===1?'1 point':n+' points';}
const READOUT={
 Fragmented:{
  pattern:'Nobody is holding the thread. Work starts in several places and does not come back as a record.',
  pressure:'You are reconstructing the business every morning from memory and inboxes.',
  repair:'Asking whoever was last in the thread. That person is the system.'
 },
 Stalled:{
  pattern:'Context does not survive the handoff. Tools multiply the same gap. The work comes back to a person.',
  pressure:'Someone on your crew is the filing system. When they are in the room, it looks like a process. When they are not, it stops looking like one.',
  repair:'Reconstructing what the last person knew, from the thread, from the deck, from memory. That repair is the leftover job. It is not on the org chart.'
 },
 Scaling:{
  pattern:'There is a way of working, and it is not the same way twice. Tools and people both have a version.',
  pressure:'You spend the extra capacity keeping the versions from colliding.',
  repair:'Translating between the system you meant and the one people actually use.'
 },
 Compounding:{
  pattern:'The answers describe a spine. Work has a place to sit.',
  pressure:'The leftover job is smaller. It is not gone. Oversight still has to be a person.',
  repair:'Checking that the rule still matches the work. That is the remaining human step.'
 }
};
function sayBusiness(qs,sel){
 const frames={
  1:t=>`You said work loses momentum <b>${t}</b>.`,
  2:t=>`You said the next task is <b>${t}</b>.`,
  3:t=>`You keep what you know <b>${t.toLowerCase()}</b>.`,
  4:t=>`You run <b>${t.toLowerCase()}</b>.`,
  5:t=>`When a project ends, <b>${t.toLowerCase()}</b>.`,
  6:t=>`Missed leads: <b>${t.toLowerCase()}</b>.`,
  7:t=>`Ownership is <b>${t.toLowerCase()}</b>.`,
  8:t=>`AI fits as <b>${t.toLowerCase()}</b>.`,
  9:t=>`Under pressure you decide by <b>${t.toLowerCase()}</b>.`,
  10:t=>`Revenue still depends on memory: <b>${t.toLowerCase()}</b>.`,
  11:t=>`Work that is already done: <b>${t.toLowerCase()}</b>.`,
  12:t=>`When a key person is out, <b>${t.toLowerCase()}</b>.`,
  13:t=>`The pipeline is <b>${t.toLowerCase()}</b>.`,
  14:t=>`Improvement happens <b>${t.toLowerCase()}</b>.`,
  15:t=>`You said the word for how work runs is <b>${t}</b>.`
 };
 return qs.map((q,i)=>{
  const raw=q.options[sel[i]].text.replace(/^We /,'').replace(/^It /,'').replace(/\.$/,'');
  return (frames[q.id]||(t=>`You said <b>${t}</b>.`))(escape(raw));
 }).join(' ');
}
function sayPersonal(qs,sel){
 const frames={
  1:t=>`When you sit down, <b>${t.toLowerCase()}</b>.`,
  2:t=>`You search for something you saved <b>${t.toLowerCase()}</b>.`,
  3:t=>`By evening it feels <b>${t.toLowerCase()}</b>.`,
  4:t=>`Unfinished loops: <b>${t.toLowerCase()}</b>.`,
  5:t=>`When a tool produces something, <b>${t.toLowerCase()}</b>.`,
  6:t=>`A week without the phone: <b>${t.toLowerCase()}</b>.`,
  7:t=>`The morning usually goes to <b>${t.toLowerCase()}</b>.`,
  8:t=>`If it worked, you would feel <b>${t.toLowerCase()}</b>.`
 };
 return qs.map((q,i)=>{
  const raw=q.options[sel[i]].text.replace(/^I /,'').replace(/\.$/,'');
  return (frames[q.id]||(t=>`You said <b>${t}</b>.`))(escape(raw));
 }).join(' ');
}
const SCANOUT={
 'Carrying it':{
  pattern:'The day does not sit down as one thing. What you meant to do waits while you hunt, rewrite, and hold unfinished loops in your head.',
  pressure:'You are the filing system. If the phone went down, the map would go with it.',
  repair:'Picking one surface and making one thing findable. That is where the fog sits. It is not the whole day.'
 },
 'Clear enough':{
  pattern:'You can put a hand on the thing. The leftover work still exists, and it has a place.',
  pressure:'The leftover job is smaller. It is not gone.',
  repair:'Twenty minutes on one surface. Keep it that small so it stays a daily, not a project.'
 }
};
function renderScan(r,qs){
 const voice=SCANOUT[r.band]||SCANOUT['Carrying it'];
 const math=`<details class="result-math"><summary>The answer arithmetic</summary><div class="score-number">${r.result}<small>/100</small></div><p class="result-formula">round(100 × ${r.raw} ÷ ${r.max}) = ${r.result}</p><p>Carrying it 0-49 · Clear enough 50-100.</p><p>This reflects the answers given. It isn't measured productivity, hours saved or a diagnosis.</p><details><summary>The answers, one by one</summary>${qs.map((q,i)=>`<div class="answer-record"><strong>${q.id}. ${escape(q.text)}</strong><p>${escape(q.options[state.selections[i]].text)}</p><small>${pointLabel(r.values[i])}</small></div>`).join('')}</details></details>`;
 return `<div class="readout scan-handoff"><h2 id="question-title" tabindex="-1">Where the fog sits</h2><p class="said">${sayPersonal(qs,state.selections)}</p><p class="ev">Reported. Those are your selections. Nothing was added.</p><div class="trace-step"><b>The pattern</b><p>${voice.pattern}</p></div><div class="trace-step"><b>The pressure</b><p>${voice.pressure}</p></div><div class="trace-step"><b>The likely human repair</b><p>${voice.repair}</p></div><p class="readout-close">This is what you reported, not what we measured.</p>${math}<div class="result-ctas"><button class="action lane-life" id="result-next">Start Digital De-Fog Daily <span class="arr" aria-hidden="true"></span></button></div><button class="text-action" id="review-answers">Review answers <i class="arr" aria-hidden="true"></i></button></div>`;
}
function renderReadout(r,qs){
 const voice=READOUT[r.band]||READOUT.Stalled;
 const math=`<details class="result-math"><summary>The answer arithmetic</summary><div class="score-number">${r.result}<small>/100</small></div><p class="result-formula">round(100 × ${r.raw} ÷ ${r.max}) = ${r.result}</p><p>Fragmented 0-24 · Stalled 25-49 · Scaling 50-74 · Compounding 75-100.</p><p>This reflects the answers given. It isn't measured productivity, hours saved or a diagnosis.</p><details><summary>The answers, one by one</summary>${qs.map((q,i)=>`<div class="answer-record"><strong>${q.id}. ${escape(q.text)}</strong><p>${escape(q.options[state.selections[i]].text)}</p><small>${pointLabel(r.values[i])}</small></div>`).join('')}</details></details>`;
 return `<div class="readout"><h2 id="question-title" tabindex="-1">The pattern</h2><p class="said">${sayBusiness(qs,state.selections)}</p><p class="ev">Reported. Those are your selections. Nothing was added.</p><div class="trace-step"><b>The pattern</b><p>${voice.pattern}</p><p class="ev">Inferred from the pattern those answers form. Not measured.</p></div><div class="trace-step"><b>The pressure</b><p>${voice.pressure}</p><p class="ev">Inferred. The pressure if nothing changes.</p></div><div class="trace-step"><b>The likely human repair</b><p>${voice.repair}</p><p class="ev">Inferred. A place to look, not a prescription.</p></div><p class="readout-close">This is what you reported, not what we measured.</p><div class="result-ctas"><button class="action lane-biz" id="result-next">Walk this with me <span class="arr" aria-hidden="true"></span></button></div>${math}<button class="text-action" id="review-answers">Review answers <i class="arr" aria-hidden="true"></i></button></div>`;
}
function renderResult(){const r=score(state.lane,state.selections);if(!r)return;if(state.lane==='business')state.traceDone=true;const qs=window.REVIEW_QUESTIONS[state.lane];if(state.lane==='personal'){state.personalSelections=[...state.selections];try{localStorage.setItem('tbtx-scan-v3',JSON.stringify({version:'site-20260914',answers:state.personalSelections}));}catch{}}
 if(state.lane==='business'){try{localStorage.setItem('tbtx-trace-v1',JSON.stringify({answers:[...state.selections],band:r.band,result:r.result}));}catch{}}
 state.showingResult=true;
 if(state.lane==='business'){
  $('#questionnaire')?.classList.remove('is-handoff');
  $('#question-lane').textContent='Friction Trace / The pattern';
  $('#question-body').innerHTML=renderReadout(r,qs);
 }else{
  $('#questionnaire')?.classList.add('is-handoff');
  $('#question-lane').textContent='Digital Fog Scan / Where the fog sits';
  $('#question-body').innerHTML=renderScan(r,qs);
 }
 $('#result-next').onclick=()=>{close('questionnaire');if(state.lane==='business')open('trace');else window.DDD.open();};$('#review-answers').onclick=()=>{state.step=0;renderQuestion();focusQuestion();};modalWorld();focusQuestion();}
function proofAgenda(){
 const r=score('business',state.selections);if(!r)return '';
 const qs=window.REVIEW_QUESTIONS.business||[];
 const voice=READOUT[r.band]||{};
 return ['PROOF walk request',`Band: ${r.band} (${r.result})`,voice.pattern||'','',
  ...qs.map((q,i)=>`${q.id}. ${q.text}\n   ${(q.options[state.selections[i]]||{}).text||''}`)
 ].join('\n');
}
const walkForm=$('#walk-form');
function nextTueWed(n=6){
 const out=[]; const d=new Date();
 d.setHours(0,0,0,0); d.setDate(d.getDate()+1);
 while(out.length<n){
  const day=d.getDay();
  if(day===2||day===3) out.push(new Date(d));
  d.setDate(d.getDate()+1);
 }
 return out;
}
function slotLabel(d,time){
 const days=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
 const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
 return days[d.getDay()]+' '+d.getDate()+' '+months[d.getMonth()]+' · '+time+' AST';
}
function fillWalkSlots(){
 const box=$('#walk-slots'); if(!box) return;
 const times=['10:00 AM','2:00 PM'];
 const rows=[];
 nextTueWed(6).forEach((d,i)=>{
  times.forEach((time,j)=>{
   const id='slot-'+i+'-'+j;
   const val=d.toISOString().slice(0,10)+' '+time;
   const label=slotLabel(d,time);
   rows.push(`<label class="walk-slot"><input type="radio" name="when" value="${escape(val)}" required> <span>${escape(label)}</span></label>`);
  });
 });
 box.insertAdjacentHTML('beforeend', rows.join(''));
}
fillWalkSlots();
function walkConfirmCopy(slot){
 return `<h2 id="trace-title" tabindex="-1">You're on the calendar.</h2>
<p class="walk-slot-set">${escape(slot)}</p>
<p>You don't need anything. You already gave the insight. I'll bring the Trace to the video call.</p>
<p>It's a conversation. We look at what you reported, the pattern it forms, and where the friction sits. Then we see if there's a next step.</p>
<p>Two days before, an email. The day before, a call. Two hours before, a text.</p>
<p class="walk-note">This meeting is not the engagement. The BizBlueprint starts after we agree to work together.</p>`;
}
if(walkForm) walkForm.addEventListener('submit',e=>{
 e.preventDefault();
 const data=new FormData(walkForm);
 const name=String(data.get('name')||'').trim();
 const email=String(data.get('email')||'').trim();
 const phone=String(data.get('phone')||'').trim();
 const company=String(data.get('company')||'').trim();
 const when=String(data.get('when')||'').trim();
 if(!when){const note=$('#walk-note'); if(note) note.textContent='Pick a time.'; return;}
 const request={name,email,phone,company,when,agenda:proofAgenda(),at:new Date().toISOString()};
 try{localStorage.setItem('tbtx-walk',JSON.stringify(request));}catch{}
 const body=['Walk this PROOF with me.',`Name: ${name}`,`Email: ${email}`,`Phone: ${phone}`,company?`Company: ${company}`:'',`When: ${when}`,'Reminders: email 2 days before, call 1 day before, text 2 hours before.','','They do not need to prepare. Bring the Trace.','',request.agenda].filter(Boolean).join('\n');
 const mailto='mailto:erik@transformby10x.ai?subject='+encodeURIComponent('Walk this PROOF · '+when+' · '+name)+'&body='+encodeURIComponent(body);
 walkForm.hidden=true;
 const confirm=$('#walk-confirm');
 if(confirm){confirm.hidden=false;confirm.innerHTML=walkConfirmCopy(when);$('#trace-title')?.focus({preventScroll:true});}
 const note=$('#walk-note'); if(note) note.hidden=true;
 window.location.href=mailto;
});

function startDDD(){closeAll();if(window.DDD?.hasDraft()){window.DDD.open();}else open('ddd-intro');}
if($('#open-ddd'))$('#open-ddd').onclick=startDDD;if($('#ddd-method-start'))$('#ddd-method-start').onclick=startDDD;if($('#begin-ddd'))$('#begin-ddd').onclick=()=>{close('ddd-intro');window.DDD.open();};
const studioLead=[
 {when:'Process',claim:'What two AI agents disagreeing looks like',title:'Conflicting outputs',cover:'assets/b2b-task-3.jpg',href:'/story#hang-conflict'},
 {when:'Process',claim:'Picking a logo without a design team',title:'Choosing a logo',cover:'assets/b2b-task-4.jpg',href:'/story#hang-logo'},
 {when:'Process',claim:'Where the context actually drops',title:'The handoff',cover:'assets/proof-mood-3.jpg',href:'/story#hang-handoff'},
 {when:'Process',claim:'Auditing code nobody on staff wrote',title:'Checking the code',cover:'assets/b2b-task-1.jpg',href:'/story#hang-code'}
];
const studioMore=[
 {when:'Campaign',claim:'AI created a job. Nobody wanted it.',title:'The origin lockup',cover:'assets/ai-created-a-job.jpg',href:'/story#hang-created'},
 {when:'Process',claim:'The leftover job, looping',title:'Desk fog',cover:'assets/desk-fog-loop.jpg',href:'/story#hang-desk'},
 {when:'PROOF',claim:'From fog to architecture',title:'Fog and friction, then a spine',cover:'assets/proof-to-architecture.jpg',href:'/story#hang-spine'},
 {when:'PROOF',claim:'The repair nobody named',title:'Hidden human repair',cover:'assets/hidden-repair-load.jpg',href:'/story#hang-repair'},
 {when:'BizBuilders',claim:'Where the fix lives',title:'BBAI momentum',cover:'assets/bbai-momentum-loop.jpg',href:'/story#hang-bbai'},
 {when:'Campaign',claim:'A kit that lifts the fog',title:'Fog Lift Kit',cover:'assets/fog-lift-kit.jpg',href:'/story#hang-kit'},
 {when:'Process',claim:'What happens when the glue snaps',title:'Computer explodes',cover:'assets/computer-explodes.jpg',href:'/story#hang-explodes'},
 {when:'Satire',claim:'The fog, with the joke left in',title:'Digital Fog satire',cover:'assets/satire-digital-fog.jpg',href:'/story#hang-satire'}
];
const hangRooms=[
 {q:'The rooms · newest first',works:[
  {when:'Sept 2026',claim:'AI Created a Job. (Nobody wanted.)',title:'Architecting Momentum',cover:'assets/studio/14/cover.jpg',href:'/story#hang-architecting'},
  {when:'Sept 2026',claim:'Where work gets a spine',title:'Architecting AI Momentum',cover:'assets/studio/0/cover.jpg',href:'/story#hang-momentum'},
  {when:'Sept 2026',claim:'Vercel executes. FLOW dictates the rules.',title:'The Enterprise Agentic OS',cover:'assets/studio/12/cover.jpg',href:'/story#hang-agentic'},
  {when:'Sept 2026',claim:'What people carry',title:'Governing AI Shadow Work',cover:'assets/studio/3/cover.jpg',href:'/story#hang-shadow'},
  {when:'July 2026',claim:'The path to done',title:'Governed Execution',cover:'assets/studio/2/cover.jpg',href:'/story#hang-governed'},
  {when:'July 2026',claim:'From fog to governed execution',title:'The Architecture of AI-Native Operations',cover:'assets/studio/4/cover.jpg',href:'/story#hang-architecture'},
  {when:'2026',claim:'The spine under the work',title:'The Operating Backbone',cover:'assets/studio/11/cover.jpg',href:'/story#hang-backbone'},
  {when:'2026',claim:'The path the work takes',title:'Engineering Operational Flow',cover:'assets/studio/10/cover.jpg',href:'/story#hang-flow'},
  {when:'2026',claim:'How the work keeps moving',title:'The operator archive',cover:'assets/studio/1/cover.jpg',href:'/story#hang-operator'},
  {when:'2026',claim:'Most systems generate. Few govern what happens next.',title:'AI Operational Architecture',cover:'assets/studio/7/cover.jpg',href:'/story#hang-ops'},
  {when:'2026',claim:'Your tools didn’t remove the work.',title:'Architecting Digital Order',cover:'assets/studio/8/cover.jpg',href:'/story#hang-order'},
  {when:'2026',claim:'PROOF, in three pages',title:'Proof Overview',cover:'assets/studio/6/cover.jpg',href:'/story#hang-overview'},
  {when:'2026',claim:'Most AI programs fail in the handoff.',title:'The Forensic Instrument',cover:'assets/studio/9/cover.jpg',href:'/story#hang-forensic'}
 ]}
];
function hangCard(n){return `<a class="nudes-work is-flip" href="${n.href}"><span class="frame"><img src="${n.cover}" alt="${n.claim}" loading="lazy" decoding="async" width="600" height="336"></span><span class="when">${n.when}</span><b>${n.claim}</b><small>${n.title}</small></a>`;}
let hangBuilt=false;
function buildHang(){
 if(hangBuilt)return;hangBuilt=true;
 if($('#hang-studio')) $('#hang-studio').innerHTML=studioLead.map(hangCard).join('');
 if($('#hang-studio-more')) $('#hang-studio-more').innerHTML=studioMore.map(hangCard).join('');
 if($('#hang-rooms')) $('#hang-rooms').innerHTML=hangRooms.map(r=>`<section class="hang-room"><h3>${r.q}</h3><div class="nudes-hall">${r.works.map(hangCard).join('')}</div></section>`).join('');
 if($('#hang-more-line')) $('#hang-more-line').onclick=()=>{const more=$('#hang-studio-more');if(!more)return;more.hidden=!more.hidden;$('#hang-more-line').textContent=more.hidden?'Eight more, each with its own claim and its own page.':'The rest of the studio.';};
}
document.addEventListener('click',e=>{
 const door=e.target.closest('[data-yt]');
 if(!door||door.dataset.ready)return;
 door.dataset.ready='1';
 const crop=document.createElement('div');
 crop.className='hang-film-crop';
 const frame=document.createElement('iframe');
 frame.className='hang-film';
 frame.title='TBTX, BBAI, BBM — the ecosystem in one sitting';
 frame.allow='autoplay; encrypted-media; picture-in-picture';
 frame.referrerPolicy='strict-origin-when-cross-origin';
 frame.src='https://www.youtube-nocookie.com/embed/'+door.dataset.yt+'?autoplay=1&controls=0&modestbranding=1&rel=0&iv_load_policy=3&playsinline=1&fs=0&disablekb=1&cc_load_policy=0';
 crop.appendChild(frame);
 door.replaceWith(crop);
});
const galleryItems=[['The handoff','proof-mood-3.mp4','Where the context actually drops.'],['How PROOF finds the fog','proof-mood-2.mp4','The leftover job, on film.'],['PROOF / First cut','proof-mood-1.mp4','Before the method had a name.'],['Checking the code','b2b-task-1.mp4','Auditing code nobody on staff wrote.'],['Content strategy','b2b-task-2.mp4','Holding the story still.'],['Conflicting outputs','b2b-task-3.mp4','What two AI agents disagreeing looks like.'],['Choosing a logo','b2b-task-4.mp4','Picking a logo without a design team.'],['The final summary','b2b-task-5.mp4','What the work actually said.'],['Keeping strategy in view','b2b-task-6.mp4','The plan that has to stay in the room.'],['The Map','b2b-task-6-world.mp4','Where the work comes back.'],['Digital De-Fog Daily','defog-daily-hero.mp4','The fog leaves. Twenty minutes.'],['The concept artwork',null,'Some labels predate Finder.'],['The origin lockup','ai-created-a-job.mp4','AI created a job. Nobody wanted it.'],['Desk fog','desk-fog-loop.mp4','The leftover job, looping.'],['Fog to architecture','proof-to-architecture.mp4','From fog to architecture.'],['Hidden repair','hidden-repair-load.mp4','The repair nobody named.'],['BBAI momentum','bbai-momentum-loop.mp4','Where the fix lives.'],['Fog Lift Kit','fog-lift-kit.mp4','A kit that lifts the fog.'],['Computer explodes','computer-explodes.mp4','What happens when the glue snaps.'],['Digital Fog satire','satire-digital-fog.mp4','The fog, with the joke left in.']];
$('#gallery-nav') && ($('#gallery-nav').innerHTML=galleryItems.map((a,i)=>`<button data-gallery="${i}">${a[0]}</button>`).join(''));function chooseGallery(i){const item=galleryItems[i],v=$('#gallery-film');if(!v)return;v.pause();$$('[data-gallery]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.gallery)===i)));v.hidden=!item[1];const art=$('#gallery-art');if(art)art.hidden=!!item[1];if(item[1])v.src=media(item[1]);else v.removeAttribute('src');const cap=$('#gallery-caption');if(cap)cap.textContent=item[2];}
$$('[data-gallery]').forEach(b=>b.onclick=()=>chooseGallery(Number(b.dataset.gallery)));$('#gallery-film').addEventListener('play',()=>videos.forEach(v=>v.pause()));$('#gallery-film').addEventListener('pause',()=>{if($('#gallery').open&&!document.hidden&&!reduced)liveWorld()?.play().catch(()=>{});});
document.addEventListener('visibilitychange',()=>{if(document.hidden)$$('video').forEach(v=>v.pause());else if(!reduced){if($('#world').dataset.scene!=='off'&&!($('#gallery').open&&!$('#gallery-film').paused))liveWorld()?.play().catch(()=>{});$$('.fog-stack video,.route-lane video').forEach(v=>v.play().catch(()=>{}));syncBed(wanted||activeScene?.dataset.world);}});
if(reduced)$$('.fog-stack video,.route-lane video').forEach(v=>{v.pause();v.removeAttribute('autoplay');});
$$('.route-lane video[data-film]').forEach(v=>{
 const arm=()=>{if(v.dataset.armed)return;v.dataset.armed='1';v.src=media(v.dataset.film);if(!reduced)v.play().catch(()=>{});};
 if('IntersectionObserver' in window){
  const io=new IntersectionObserver(ents=>{if(ents.some(en=>en.isIntersecting)){arm();io.disconnect();}},{rootMargin:'240px'});
  io.observe(v);
 }else arm();
});
applySound();
$('#sound-toggle')?.addEventListener('click',e=>{e.stopPropagation();setSound(!soundOn);});
let tapX=0,tapY=0;
document.addEventListener('pointerdown',e=>{tapX=e.clientX;tapY=e.clientY;},{passive:true});
document.addEventListener('pointerup',e=>{
 if(document.body.classList.contains('is-sheet'))return;
 if(Math.hypot(e.clientX-tapX,e.clientY-tapY)>14)return;
 const hit=e.target.closest('a,button,input,textarea,select,summary,label,dialog,.route-lane,.gate-board,.chrome,.site-menu,.sheet,.action,.text-action,.read-link,.family-line,.daily-pay,.method-launch,.mark');
 if(hit)return;
 setSound(!soundOn);
});
// Direction and color move with intent; pointer movement never shifts a click target.

document.querySelectorAll('.site-menu nav a,.site-menu nav button').forEach(el=>el.addEventListener('click',()=>{const m=el.closest('.site-menu');if(m)m.removeAttribute('open');}));
$$('.action,.route,.route-lane,.gate-choices button,.method-launch').forEach(b=>{b.addEventListener('pointermove',e=>{if(reduced||e.pointerType==='touch')return;const r=b.getBoundingClientRect();b.style.setProperty('--pointer',(e.clientX-r.left)/r.width);});b.addEventListener('pointerleave',()=>b.style.removeProperty('--pointer'));});
mountInfra();
window.TBTX={open,close,closeAll,startDDD,state,escape,media,score,chooseGallery,bindDialog};window.reviewScore=score;window.reviewState=state;
})();
