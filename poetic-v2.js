/* Poétique V2 · individual 3D pétales with seeded wind, three depths and salon highlights.
   Additive script: original CH’ANGE × NAMAJE navigation remains untouched. */
(()=>{
 'use strict';
 function init(){
  const gate=document.querySelector('#universe-gate.universe-gate');
  if(!gate||gate.querySelector('.pv2-world'))return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile=matchMedia('(max-width: 720px)').matches;
  const world=document.createElement('div');world.className='pv2-world';
  world.setAttribute('aria-hidden','true');
  const haze=document.createElement('div');haze.className='pv2-haze';
  const silk=document.createElement('div');silk.className='pv2-silk';
  silk.innerHTML='<svg viewBox="0 0 950 1040" preserveAspectRatio="none"><defs>'+
   '<linearGradient id="pv2-fabric" x1="0" y1="1" x2="1" y2="0">'+
   '<stop offset="0" stop-color="#ffbdcc" stop-opacity=".1"/><stop offset=".32" stop-color="#fff8ef" stop-opacity=".5"/>'+
   '<stop offset="1" stop-color="#e8b6c9" stop-opacity="0"/></linearGradient></defs>'+
   '<path d="M-100 510 C108 360 130 812 335 697 C519 585 421 516 690 397 C820 338 916 405 985 329 L985 481 C754 511 709 623 527 724 C360 830 299 881 120 912 C-15 924 -117 742 -100 510Z" fill="url(#pv2-fabric)"/>'+
   '<path d="M-50 670 Q170 503 323 758 T960 476" stroke="#fff7f1" stroke-opacity=".28" stroke-width="2.5" fill="none"/></svg>';
  const halo=document.createElement('div');halo.className='pv2-hair-halo';
  const hair=document.createElement('div');hair.className='pv2-hair';
  hair.innerHTML='<svg viewBox="0 0 900 1050" preserveAspectRatio="none"><defs>'+
    '<linearGradient id="pv2-gold" x1="1" y1="0" x2="0" y2="1">'+
     '<stop offset="0" stop-color="#b68764" stop-opacity="0"/><stop offset=".24" stop-color="#ffe4bd" stop-opacity=".75"/>'+
     '<stop offset=".65" stop-color="#e3ae86" stop-opacity=".55"/><stop offset="1" stop-color="#98674e" stop-opacity="0"/></linearGradient>'+
    '<linearGradient id="pv2-copper" x1="1" y1="0" x2="0" y2="1">'+
     '<stop offset="0" stop-color="#e5b697" stop-opacity="0"/><stop offset=".5" stop-color="#e4af8a" stop-opacity=".61"/>'+
     '<stop offset="1" stop-color="#9d6549" stop-opacity="0"/></linearGradient>'+
    '<linearGradient id="pv2-shine" x1="1" y1="0" x2="0" y2="1">'+
     '<stop offset="0" stop-color="#fff6e9" stop-opacity="0"/><stop offset=".37" stop-color="#fff9ee" stop-opacity=".98"/>'+
     '<stop offset=".69" stop-color="#f9d8ad" stop-opacity=".87"/><stop offset="1" stop-color="#f7c59a" stop-opacity="0"/></linearGradient></defs>'+
    '<g class="pv2-hair-depth">'+
     '<path d="M950 11 C774 48 750 140 621 204 C517 261 474 316 323 330 C184 345 107 448 -95 535"/>'+
     '<path d="M957 102 C801 149 718 265 597 320 C483 389 402 410 284 462 C155 518 81 541 -95 622"/>'+
     '<path d="M948 410 C770 461 702 529 576 569 C448 621 377 658 289 732 C164 840 96 887 -95 1025"/></g>'+
    '<g class="pv2-hair-base">'+
     '<path d="M950 30 C754 68 745 169 614 223 C499 291 470 312 300 348 C164 384 113 430 -92 511"/>'+
     '<path d="M946 112 C817 181 717 268 570 338 C451 398 410 410 300 478 C162 541 80 551 -93 611"/>'+
     '<path d="M943 416 C778 468 696 527 562 583 C439 635 381 688 297 763 C168 848 81 923 -93 1030"/></g>'+
    '<g>'+
     '<path class="pv2-hair-shine" d="M950 30 C754 68 745 169 614 223 C499 291 470 312 300 348 C164 384 113 430 -92 511"/>'+
     '<path class="pv2-hair-shine" d="M946 112 C817 181 717 268 570 338 C451 398 410 410 300 478 C162 541 80 551 -93 611"/>'+
     '<path class="pv2-hair-shine" d="M943 416 C778 468 696 527 562 583 C439 635 381 688 297 763 C168 848 81 923 -93 1030"/></g></svg>';
  const stage=document.createElement('div');stage.className='pv2-petals';
  const dust=document.createElement('div');dust.className='pv2-dust';
  world.append(haze,silk,halo,hair,stage,dust);
  const shade=gate.querySelector('.universe-gate__shade');
  if(shade)shade.after(world);else gate.prepend(world);

  // Stable pseudo-random source: varied petals but same choreography on refresh.
  let seed=20261020;
  const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
  const range=(a,b)=>a+(b-a)*rand();
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const smooth=(a,b,v)=>{let t=clamp((v-a)/(b-a),0,1);return t*t*(3-2*t)};
  let vw=innerWidth,vh=innerHeight;
  const density=mobile?{far:8,mid:10,near:4}:{far:12,mid:16,near:7};
  const petalMarkup=i=>'<svg viewBox="0 0 140 155" aria-hidden="true"><defs>'+
   '<radialGradient id="pv2-leaf-'+i+'" cx="30%" cy="25%" r="82%">'+
   '<stop offset="0" stop-color="#fffaf6" stop-opacity=".95"/>'+
   '<stop offset=".38" stop-color="#ffdee3" stop-opacity=".92"/>'+
   '<stop offset=".78" stop-color="#e7a4b9" stop-opacity=".8"/>'+
   '<stop offset="1" stop-color="#bc8294" stop-opacity=".6"/></radialGradient></defs>'+
   '<path d="M70 6 C104 8 130 38 129 68 C128 103 106 145 78 149 C42 152 8 120 9 85 C10 47 39 14 70 6Z" fill="url(#pv2-leaf-'+i+')" stroke="#fff3f0" stroke-opacity=".35" stroke-width="1.3"/>'+
   '<path d="M70 13 Q57 66 77 137" fill="none" stroke="#fff8f3" stroke-opacity=".36" stroke-width="1.4"/>'+
   '<path d="M65 57 Q46 50 29 59 M73 84 Q93 73 114 82" fill="none" stroke="#fff8f3" stroke-opacity=".16" stroke-width="1"/></svg>';
  function configure(p,initial){
   p.size=p.depth==='far'?range(16,28):p.depth==='mid'?range(28,51):range(69,119);
   if(mobile)p.size*=p.depth==='near'?.73:.85;
   p.x0=vw*(mobile?range(-.18,.34):range(-.09,.40));
   p.travelX=vw*(mobile?range(.17,.49):range(.12,.32))*(rand()<.13?-1:1);
   p.duration=p.depth==='far'?range(19,31):p.depth==='mid'?range(14,24):range(12,21);
   p.opacity=p.depth==='far'?range(.37,.59):p.depth==='mid'?range(.67,.87):range(.46,.66);
   p.sway=p.depth==='far'?range(15,31):p.depth==='mid'?range(24,56):range(49,92);
   p.phase=range(0,Math.PI*2);
   p.rot=range(-115,115);p.spin=range(.75,1.8);
   p.t=initial?range(.09,.83):0;
   p.el.style.setProperty('--petal-size',p.size.toFixed(1)+'px');
   p.el.style.setProperty('--petal-blur',p.depth==='far'?'1.25px':p.depth==='mid'?'0.35px':'3.2px');
  }
  const petals=[];
  Object.keys(density).forEach(depth=>{
   for(let i=0;i<density[depth];i++){
    const el=document.createElement('span');
    el.className='pv2-petal pv2-petal--'+depth;
    el.innerHTML=petalMarkup(petals.length);
    stage.append(el);
    const p={el,depth};configure(p,true);petals.push(p);
   }
  });
  for(let i=0;i<(mobile?4:7);i++){
   const el=document.createElement('span');
   for(const [name,val] of Object.entries({
    '--x':range(58,93).toFixed(1)+'%','--y':range(14,76).toFixed(1)+'%',
    '--s':range(1.5,3.6).toFixed(1)+'px','--blur':range(.35,1.5).toFixed(1)+'px',
    '--time':range(5,11).toFixed(1)+'s','--delay':-range(0,10).toFixed(1)+'s'
   }))el.style.setProperty(name,val);
   dust.append(el);
  }

  let mode='naturel',paused=false,clock=0,last=null,frame=0,wind=1,windTarget=1;
  const modes={doux:{speed:.74,gust:.55},naturel:{speed:1,gust:1},vivant:{speed:1.19,gust:1.42}};
  function tick(timestamp){
   frame=0;if(paused||document.hidden)return;
   if(last===null)last=timestamp;
   const dt=clamp((timestamp-last)/1000,0,.062);last=timestamp;clock+=dt;
   const setting=modes[mode];wind+=(windTarget*setting.gust-wind)*Math.min(1,dt*2.1);
   // Layered winds. Each petal additionally follows two unique oscillations.
   const gust=.58*Math.sin(clock*.53)+.27*Math.sin(clock*1.23+.7)+.15*Math.sin(clock*2.1+1.1);
   for(const p of petals){
    p.t+=dt*setting.speed/p.duration;
    if(p.t>=1)configure(p,false);
    const t=p.t,windEffect=wind*(.8+gust*.29);
    const lateral=Math.sin(t*Math.PI*2.65+p.phase)*p.sway*.34+
      Math.sin(t*Math.PI*5.25+p.phase*.8)*p.sway*.2;
    const x=p.x0+p.travelX*t+(lateral+gust*p.sway*.72)*windEffect;
    const y=-p.size*1.8+t*(vh+p.size*3.5)+Math.sin(clock*p.spin+p.phase)*p.sway*.1;
    const rotation=p.rot+245*t+34*Math.sin(clock*p.spin*.75+p.phase);
    const flip=55*Math.sin(clock*p.spin*1.1+p.phase);
    const scale=.78+.2*Math.cos(clock*p.spin*1.4+p.phase);
    const fade=smooth(0,.08,t)*(1-smooth(.87,1,t));
    p.el.style.opacity=String(clamp(p.opacity*fade,0,1));
    p.el.style.transform='translate3d('+x.toFixed(1)+'px,'+y.toFixed(1)+'px,0) rotate('+rotation.toFixed(1)+'deg) rotateY('+flip.toFixed(1)+'deg) scaleX('+scale.toFixed(2)+')';
   }
   frame=requestAnimationFrame(tick);
  }
  function start(){if(!frame&&!paused&&!document.hidden&&!reduced){last=null;frame=requestAnimationFrame(tick)}}
  function stop(){if(frame){cancelAnimationFrame(frame);frame=0}last=null}
  function setMode(value){
   if(!modes[value])return;
   mode=value;
   document.querySelectorAll('[data-pv2-mode]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.pv2Mode===mode)));
  }
  function setPaused(value){
   if(reduced)return;
   paused=!!value;
   gate.classList.toggle('pv2-paused',paused);
   const button=document.querySelector('[data-pv2-pause]');
   if(button){button.textContent=paused?'REPRENDRE':'PAUSE';button.setAttribute('aria-pressed',String(paused))}
   paused?stop():start();
  }
  const inDemo=location.pathname.replace(/\/+$/,'')==='/demo-poetique-v2';
  if(inDemo){
   const bar=document.createElement('div');
   bar.className='pv2-controls';bar.setAttribute('role','group');
   bar.setAttribute('aria-label','Réglages de la démonstration poétique');
   bar.innerHTML='<span>POÉTIQUE V2</span>'+
    '<button type="button" data-pv2-mode="doux" aria-pressed="false">DOUX</button>'+
    '<button type="button" data-pv2-mode="naturel" aria-pressed="true">NATUREL</button>'+
    '<button type="button" data-pv2-mode="vivant" aria-pressed="false">VENT +</button>'+
    '<button type="button" data-pv2-pause aria-pressed="false">PAUSE</button>';
   document.body.append(bar);
   bar.querySelectorAll('[data-pv2-mode]').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.pv2Mode)));
   bar.querySelector('[data-pv2-pause]').addEventListener('click',()=>setPaused(!paused));
   const hint=document.createElement('p');hint.className='pv2-hint';
   hint.textContent='Pétales photographiques en mouvement · cheveux illuminés';
   document.body.append(hint);
  }
  gate.addEventListener('pointerover',e=>{
   if(e.pointerType==='touch')return;
   const button=e.target.closest('[data-universe-choice]');
   if(button){
    gate.dataset.pv2Focus=button.dataset.universeChoice;
    windTarget=button.dataset.universeChoice==='change'?1.42:.8;
   }else{gate.dataset.pv2Focus='';windTarget=1}
  });
  gate.addEventListener('pointerleave',()=>{gate.dataset.pv2Focus='';windTarget=1});
  gate.addEventListener('focusin',e=>{
   const button=e.target.closest('[data-universe-choice]');
   if(button){gate.dataset.pv2Focus=button.dataset.universeChoice;windTarget=button.dataset.universeChoice==='change'?1.42:.8}
  });
  gate.addEventListener('focusout',e=>{
   if(!e.relatedTarget||!gate.contains(e.relatedTarget)){gate.dataset.pv2Focus='';windTarget=1}
  });
  let timer=0;
  addEventListener('resize',()=>{
   clearTimeout(timer);
   timer=setTimeout(()=>{vw=innerWidth;vh=innerHeight},125);
  },{passive:true});
  document.addEventListener('visibilitychange',()=>document.hidden?stop():start());
  if(reduced){
   // For users requesting reduced motion, show a small fixed decorative hint.
   petals.forEach((p,i)=>{
    p.el.style.opacity=i<5?'.27':'0';
    p.el.style.transform='translate3d('+(vw*(.04+i*.065)).toFixed(0)+'px,'+(vh*(.17+i*.13)).toFixed(0)+'px,0) rotate('+(i*33)+'deg)';
   });
   gate.classList.add('pv2-paused');
  }else start();
  window.PoeticV2=Object.freeze({
   setMode,pause:()=>setPaused(true),resume:()=>setPaused(false),
   reset:()=>petals.forEach(p=>configure(p,true)),
   status:()=>({mode,paused:paused||reduced,petals:petals.length,reducedMotion:reduced})
  });
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
 else init();
})();