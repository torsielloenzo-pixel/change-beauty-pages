/*
 * CH'ANGE — ratio-lock de l'accueil.
 * Une seule échelle pour le fond, les calques et tous les éléments.
 * Coordonnées constantes dans 1536x1024 (bureau/tablette) ou 430x1280 (mobile).
 */
(function(){
  'use strict';
  const viewport=document.querySelector('#page-accueil .dual-home');
  const canvas=viewport?.querySelector('.dual-home__grid');
  const stage=document.getElementById('change-landing-stage');
  if(!viewport||!canvas)return;

  // L'image et les calques doivent être dans le MÊME repère transformé que les textes.
  // Ne pas dupliquer la photo et ne pas l'ancrer au body.
  if(stage&&stage.parentNode!==canvas)canvas.prepend(stage);

  const root=document.documentElement;
  let lastWidth=0,lastMode='',scheduled=false;
  function resize(){
    scheduled=false;
    // Les fenêtres desktop gardent STRICTEMENT le même cadrage, même réduites.
    // Seul un vrai périphérique tactile étroit utilise le canevas portrait dédié.
    const mobile=window.matchMedia('(max-width:699px) and (pointer:coarse)').matches;
    document.body.classList.toggle('home-canvas-mobile',mobile);
    const mode=mobile?'mobile':'desktop';
    const designWidth=mobile?430:1536;
    const designHeight=mobile?1280:1024;
    const available=Math.max(1,root.clientWidth);
    if(available===lastWidth&&mode===lastMode)return;
    lastWidth=available;lastMode=mode;
    const scale=available/designWidth;
    root.style.setProperty('--home-canvas-scale',String(scale));
    viewport.style.setProperty('--home-canvas-height',(designHeight*scale)+'px');
    root.dataset.homeCanvas=mode;

    // Moteur de fond/éditeur : la mesure se fait après ajustement de la scène.
    window.dispatchEvent(new Event('change-home-canvas-resized'));
  }
  function schedule(){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(resize);
  }
  resize();
  window.addEventListener('resize',schedule,{passive:true});
  window.addEventListener('orientationchange',schedule,{passive:true});
  if('ResizeObserver'in window){
    new ResizeObserver(schedule).observe(root);
  }
})();
