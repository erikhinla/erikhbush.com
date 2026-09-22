(() => {
'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,portrait=$('#portrait');
const media=name=>window.REVIEW_MEDIA?.[name]||('assets/'+name);
const scenes=[
 {label:'The leftover job',line:'AI created a job. Nobody wanted it.',sub:"The output arrived. The job didn't finish.",film:'b2b-task-2.mp4'},
 {label:'The carry',line:'Move the context. Chase the answer.',sub:'Find the version. Hand it on.',film:'b2b-task-1.mp4'},
 {label:'Not just you',line:'Nobody assigned this job. Millions of us do it anyway.',sub:'We named it Digital Fog.',film:'fog-story.mp4'},
 {label:"What's missing",line:'The world built the generator.',sub:"It didn't build the spine.",film:'managing-digital-fog.mp4'},
 {label:'The crew',line:'Twenty years moving work between people.',sub:'Three years with AI. Not a demo. A colleague.',film:'erik-portrait.mp4'},
 {label:'What we build',line:'We find the fog. We build the fix a home.',sub:'PROOF. BizBuilders. Digital De-Fog Daily.',film:'proof-mood-3.mp4'},
 {label:'Momentum',line:'Room to build again.',sub:"Work keeps moving, your attention doesn't have to.",film:'ddd-r5-picture-sfx.mp4'}
];
let chapter=0,playing=false,timer=null,trigger=null,readMode=false,soundOn=false,cardSlot=0,cardWanted='';
const decks=[
 {title:'Architecting AI Momentum',count:15,file:'Architecting_AI_Momentum.pdf',note:'Working concept deck. Its model, pricing and outcome illustrations are not measured client results or a live offer.',notes:{5:'This slide shows a source-deck model. It is not the current Map scoring rule or a calibrated operational measurement.',11:'These are source-deck pricing concepts, not current offers or checkout prices.',13:'The supplied Google screenshot records program membership, not professional certification or endorsement.'}},
 {title:'The operator archive',count:13,file:'FLOW_AS_2.0_Operator_Manual.pdf',note:'Architecture archive. Agent assignments, model names and claims of live or autonomous operation are source-deck descriptions, not runtime verification.',notes:{}},
 {title:'Governed Execution',count:15,file:'Governed_Execution.pdf',note:'Working architecture deck. Original wording is preserved; current site copy uses PROOF Finder and Digital De-Fog Daily.',notes:{}},
 {title:'Governing AI Shadow Work',count:15,file:'Governing_AI_Shadow_Work.pdf',note:'Concept and research framing. Illustrations and diagnostic language are not a clinical diagnosis or measured client results.',notes:{12:'This slide records design principles from the deck; it does not describe a verified client result.'}},
 {title:'The Architecture of AI-Native Operations',count:13,file:'The_Architecture_of_AI_Native_Operations.pdf',note:'Working concept deck. Ecosystem Canon v2026.07. Sequence, offers and illustrations are source-deck descriptions, not measured client results or a live offer.',notes:{}},
 {title:'Managing Digital Fog',count:15,file:'Managing_Digital_Fog.pdf',note:'Working concept deck. Diagnosis of digital fog and the leftover job. Illustrations are not measured client results or a live offer.',notes:{}},
 {title:'Proof Overview',count:3,file:'Proof_Overview.pdf',note:'Short overview of PROOF. Not a live offer or a measured client result.',notes:{}},
 {title:'AI Operational Architecture',count:13,file:'AI_Operational_Architecture.pdf',note:'Working architecture deck. Sequence and illustrations are source-deck descriptions, not measured client results or a live offer.',notes:{}},
 {title:'Architecting Digital Order',count:15,file:'Architecting_Digital_Order.pdf',note:'Working concept deck. Diagnosis of leftover work. Illustrations are not measured client results or a live offer.',notes:{}},
 {title:'The Forensic Instrument',count:12,file:'The_Forensic_Instrument.pdf',note:'PROOF concept deck. Illustrations are not a live diagnostic or measured client result.',notes:{}},
 {title:'Engineering Operational Flow',count:15,file:'Engineering_Operational_Flow.pdf',note:'Working architecture deck. Source-deck descriptions, not a connected client runtime.',notes:{}},
 {title:'The Operating Backbone',count:14,file:'The_Operating_Backbone.pdf',note:'Working architecture deck. Source-deck descriptions, not a live operating system.',notes:{}},
 {title:'The Enterprise Agentic OS',count:13,file:'The_Enterprise_Agentic_OS.pdf',note:'Working architecture deck. FLOW Agent AS with Vercel agentic infrastructure. Source-deck descriptions, not a connected client runtime.',notes:{}},
 {title:'Architecting Momentum',count:14,folder:14,file:'Architecting_Momentum.pdf',note:'Campaign deck. AI created a job nobody wanted. Source-deck descriptions, not a live offer or measured client result.',notes:{}}
];
let deck=0,page=0;
function background(){if(document.hidden||$$('dialog[open]').length||reduced)portrait.pause();else portrait.play().catch(()=>{});}
function show(id,source){trigger=source||document.activeElement;const d=$('#'+id);d.showModal();background();if(id==='manifesto'){chapter=0;readMode=false;$('#film-track').hidden=false;$('#film-prev').hidden=false;$('#film-next').hidden=false;$('#film-play').disabled=false;$('#transcript').hidden=true;$('#projection').hidden=false;$('#read-mode').textContent='Read instead';$('#read-mode').setAttribute('aria-pressed','false');renderScene();setPlaying(!reduced);}else d.querySelector('h2')?.focus({preventScroll:true});}
$$('[data-open]').forEach(b=>b.addEventListener('click',()=>show(b.dataset.open,b)));
$$('[data-close]').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));
$$('dialog').forEach(d=>d.addEventListener('close',()=>{if(d.id==='manifesto'){setPlaying(false);setSound(false);cardFilms().forEach(v=>{v.pause();v.removeAttribute('src');});cardWanted='';}if(d.id==='hang-film'){$('#hang-film-player')?.pause();}background();trigger?.focus({preventScroll:true});}));
const cardFilms=()=>[$('#card-a'),$('#card-b')].filter(Boolean);
function showCardFilm(name){
  const films=cardFilms();
  if(!films.length||!name)return;
  if(cardWanted===name){
    const live=films[cardSlot];
    live.muted=!soundOn;
    if(soundOn)live.volume=1;
    if(!reduced&&!document.hidden)live.play().catch(()=>{});
    return;
  }
  cardWanted=name;
  const old=films[cardSlot],next=films[1-cardSlot];
  old.muted=true;
  next.pause();
  next.src=media(name);
  next.muted=!soundOn;
  next.loop=true;
  if(soundOn)next.volume=1;
  const go=()=>{
    next.classList.add('visible');
    old.classList.remove('visible');
    old.muted=true;
    next.muted=!soundOn;
    cardSlot=1-cardSlot;
    if(!reduced&&!document.hidden)next.play().catch(()=>{});
    setTimeout(()=>{if(old!==films[cardSlot]){old.pause();old.muted=true;}},700);
  };
  next.addEventListener('loadeddata',go,{once:true});
  next.addEventListener('error',go,{once:true});
  next.load();
}
function setSound(on){
  soundOn=!!on;
  const b=$('#sound');
  b.setAttribute('aria-pressed',String(on));
  b.textContent=on?'Sound on':'Sound off';
  const live=cardFilms()[cardSlot];
  cardFilms().forEach(v=>{
    const isLive=v===live&&v.classList.contains('visible');
    v.muted=!(on&&isLive);
    if(on&&isLive)v.volume=1;
  });
  if(on&&live?.src)live.play().catch(()=>{});
}
function setPlaying(on){playing=on&&!readMode;clearTimeout(timer);$('#film-play').textContent=playing?'Pause':chapter===scenes.length-1?'Replay':'Play';if(playing){timer=setTimeout(()=>{if(chapter<scenes.length-1){chapter++;renderScene();setPlaying(true);}else{setPlaying(false);}},6500);}}
function renderScene(){const s=scenes[chapter];$('#scene-label').textContent=String(chapter+1).padStart(2,'0')+' / '+s.label;$('#scene-line').textContent=s.line;$('#scene-sub').textContent=s.sub;$('#film-prev').disabled=chapter===0;$('#film-next').disabled=chapter===scenes.length-1;$$('[data-chapter]').forEach(b=>b.setAttribute('aria-current',String(+b.dataset.chapter===chapter)));const projection=$('#projection');projection.classList.remove('arriving');void projection.offsetWidth;projection.classList.add('arriving');if(!readMode)showCardFilm(s.film);}
function seek(n){chapter=Math.max(0,Math.min(scenes.length-1,n));renderScene();setPlaying(playing);}
$('#film-track').innerHTML=scenes.map((s,i)=>`<button data-chapter="${i}" aria-label="Chapter ${i+1}: ${s.label}" aria-current="false"></button>`).join('');
$$('[data-chapter]').forEach(b=>b.onclick=()=>seek(+b.dataset.chapter));$('#film-prev').onclick=()=>seek(chapter-1);$('#film-next').onclick=()=>seek(chapter+1);$('#film-play').onclick=()=>{if(chapter===scenes.length-1&&!playing){chapter=0;renderScene();}setPlaying(!playing);};$('#sound').onclick=()=>setSound(!soundOn);
$('#transcript').insertAdjacentHTML('beforeend',scenes.map(s=>`<p><strong>${s.line}</strong> ${s.sub}</p>`).join(''));
$('#read-mode').onclick=()=>{readMode=!readMode;setPlaying(false);$('#projection').hidden=readMode;$('#transcript').hidden=!readMode;$('#film-track').hidden=readMode;$('#film-play').disabled=readMode;$('#film-prev').hidden=readMode;$('#film-next').hidden=readMode;$('#read-mode').textContent=readMode?'Back to film':'Read instead';$('#read-mode').setAttribute('aria-pressed',String(readMode));};
function renderPage(){const d=decks[deck];const im=$('#deck-page');$('#page-error').hidden=true;im.src=`assets/studio/${d.folder!=null?d.folder:deck}/page-${String(page+1).padStart(2,'0')}.jpg`;im.alt=`${d.title}, page ${page+1} of ${d.count}`;$('#page-select').value=String(page);$('#deck-prev').disabled=page===0;$('#deck-next').disabled=page===d.count-1;$('#deck-note').textContent=d.notes[page]||d.note;$('#reader-stage').scrollTo(0,0);}
$$('[data-deck]').forEach(b=>b.onclick=()=>{deck=+b.dataset.deck;page=0;const d=decks[deck];$('#reader-title').textContent=d.title;$('#page-select').innerHTML=Array.from({length:d.count},(_,i)=>`<option value="${i}">${i+1}</option>`).join('');$('#page-total').textContent='/ '+d.count;$('#deck-download').href='assets/studio/'+(d.folder!=null?d.folder+'/':'')+d.file;$('#reader-stage').classList.remove('zoomed');$('#zoom').setAttribute('aria-pressed','false');$('#zoom').textContent='Zoom in';renderPage();show('reader',b);});
$$('[data-film]').forEach(b=>b.onclick=()=>{const v=$('#hang-film-player');if(!v)return;$('#hang-film-title').textContent=b.querySelector('b')?.textContent||'The studio';v.pause();v.src=media(b.dataset.film);show('hang-film',b);v.play().catch(()=>{});});
const PIECES={fog:'hang-fog',shadow:'hang-shadow',momentum:'hang-momentum',architecture:'hang-architecture',governed:'hang-governed',operator:'hang-operator',conflict:'hang-conflict',logo:'hang-logo',handoff:'hang-handoff',code:'hang-code',created:'hang-created',desk:'hang-desk',spine:'hang-spine',repair:'hang-repair',bbai:'hang-bbai',kit:'hang-kit',explodes:'hang-explodes',satire:'hang-satire',overview:'hang-overview',forensic:'hang-forensic',order:'hang-order',ops:'hang-ops',flow:'hang-flow',backbone:'hang-backbone',agentic:'hang-agentic'};
function openHangPiece(){
  const q=new URLSearchParams(location.search).get('p');
  const fromPath=(location.pathname.match(/\/hang\/([^/]+)/)||[])[1];
  const fromHash=(location.hash.match(/^#hang-(.+)/)||[])[1];
  const slug=q||fromPath||fromHash;
  if(!slug)return;
  const el=$('#'+(PIECES[slug]||('hang-'+slug)));
  if(!el)return;
  $('#wall')?.scrollIntoView({block:'start'});
  el.click();
}
openHangPiece();
$('#deck-page').onerror=()=>{$('#page-error').hidden=false;};$('#deck-prev').onclick=()=>{if(page>0){page--;renderPage();}};$('#deck-next').onclick=()=>{if(page<decks[deck].count-1){page++;renderPage();}};$('#page-select').onchange=e=>{page=+e.target.value;renderPage();};$('#zoom').onclick=()=>{const zoomed=$('#reader-stage').classList.toggle('zoomed');$('#zoom').setAttribute('aria-pressed',String(zoomed));$('#zoom').textContent=zoomed?'Fit page':'Zoom in';};
document.addEventListener('keydown',e=>{if(e.target.matches('select,input,textarea'))return;if($('#reader').open){if(e.key==='ArrowRight')$('#deck-next').click();if(e.key==='ArrowLeft')$('#deck-prev').click();}else if($('#manifesto').open&&!readMode){if(e.key==='ArrowRight')seek(chapter+1);if(e.key==='ArrowLeft')seek(chapter-1);}});
document.addEventListener('visibilitychange',()=>{if(document.hidden){setPlaying(false);cardFilms().forEach(v=>v.pause());}background();});
if(!reduced){const wall=$('#wall');wall.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;const r=wall.getBoundingClientRect();wall.style.setProperty('--light-x',100*(e.clientX-r.left)/r.width+'%');wall.style.setProperty('--light-y',100*(e.clientY-r.top)/r.height+'%');});}
background();
// Expose only compact playback state for local verification; no personal session data.
window.STUDIO={state:()=>({chapter,playing,soundOn,deck,page,reduced})};
})();

document.addEventListener('click',e=>{
 const door=e.target.closest('[data-yt]');
 if(!door||door.dataset.ready)return;
 door.dataset.ready='1';
 const crop=document.createElement('div');
 crop.className='storm-film';
 const frame=document.createElement('iframe');
 frame.title='The Storm';
 frame.allow='autoplay; encrypted-media; picture-in-picture';
 frame.referrerPolicy='strict-origin-when-cross-origin';
 frame.src='https://www.youtube-nocookie.com/embed/'+door.dataset.yt+'?autoplay=1&modestbranding=1&rel=0&playsinline=1';
 crop.appendChild(frame);
 door.replaceWith(crop);
});

