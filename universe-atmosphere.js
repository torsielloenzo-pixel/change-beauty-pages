/* CH’ANGE × NAMAJE — non-invasive particle overlay.
   Append after universe-gateway.css. No changes to existing navigation.
   Use window.ChangeAtmosphere.setMode('subtil'|'equilibre'|'cinematique'|'off').
*/
(()=>{
 'use strict';
 const init=()=>{
  const gate=document.querySelector('.universe-gate');
  if(!gate||gate.querySelector('.universe-atmosphere'))return;
  const overlay=document.createElement('div');
  overlay.className='universe-atmosphere';
  overlay.setAttribute('aria-hidden','true');
  const petals=document.createElement('div');
  petals.className='universe-atmosphere__field universe-atmosphere__field--petals';
  const hair=document.createElement('div');
  hair.className='universe-atmosphere__field universe-atmosphere__field--hair';
  overlay.append(petals,hair);
  const shade=gate.querySelector('.universe-gate__shade');
  if(shade)shade.after(overlay);else gate.prepend(overlay);
  // Deterministic seeded values avoid visual jumps on reload.
  let seed=274811;
  const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const create=(parent,kind,count)=>{
   for(let i=0;i<count;i++){
    const el=document.createElement('span');
    el.className='universe-atmosphere__piece universe-atmosphere__piece--'+kind;
    const large=kind==='strand';
    const size=large?42+rand()*86:kind==='petal'?12+rand()*27:1.4+rand()*2.7;
    el.style.setProperty('--size',size.toFixed(1)+'px');
    el.style.setProperty('--x',(4+rand()*90).toFixed(1)+'%');
    el.style.setProperty('--drift',((rand()-.5)*(large?140:185)).toFixed(1)+'px');
    el.style.setProperty('--time',(large?14+rand()*12:kind==='petal'?12+rand()*12:3+rand()*7).toFixed(2)+'s');
    el.style.setProperty('--delay',(-rand()*24).toFixed(2)+'s');
    el.style.setProperty('--peak',(kind==='petal'?.39+rand()*.48:kind==='strand'?.25+rand()*.34:.4+rand()*.4).toFixed(2));
    if(kind==='petal')el.style.setProperty('--blur',(rand()>.7?rand()*1.4:0).toFixed(1)+'px');
    if(large){
     const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
     svg.setAttribute('viewBox','0 0 100 155');svg.setAttribute('aria-hidden','true');
     const path=document.createElementNS('http://www.w3.org/2000/svg','path');
     path.setAttribute('d',i%3===0?'M16 5 C92 36 10 76 84 145':'M68 2 C-16 38 95 86 26 150');
     svg.append(path);el.append(svg);
    }
    parent.append(el);
   }
  };
  create(petals,'petal',18);
  create(petals,'glimmer',9);
  create(hair,'strand',15);
  create(hair,'glimmer',13);
  const modes=new Set(['subtil','equilibre','cinematique','off']);
  const setMode=(mode)=>{
   if(!modes.has(mode))return;
   gate.dataset.atmosphere=mode;
   document.querySelectorAll('[data-atmosphere-mode]').forEach(b=>{
    b.setAttribute('aria-pressed',String(b.dataset.atmosphereMode===mode));
   });
  };
  window.ChangeAtmosphere=Object.freeze({setMode});
  setMode('equilibre');
  document.querySelectorAll('[data-atmosphere-mode]').forEach(button=>{
   button.addEventListener('click',()=>setMode(button.dataset.atmosphereMode));
  });
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
