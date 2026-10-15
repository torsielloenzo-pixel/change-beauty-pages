/*
 * CH'ANGE — scène de référence intégralement visible.
 * Desktop : 1536 x 1024. Téléphone tactile : 430 x 1280.
 * L'image et les textes restent ancrés au MÊME canevas.
 * Le bureau privilégie la composition entière dans la hauteur ET la largeur
 * disponibles (contain), sans recadrer les bords du hero.
 */
(function(){
 'use strict';
 const viewport=document.querySelector('#page-accueil .dual-home');
 const canvas=viewport?.querySelector('.dual-home__grid');
 const stage=document.getElementById('change-landing-stage');
 if(!viewport||!canvas)return;
 // Les calques photo sont les premiers enfants de la grille de référence.
 if(stage&&stage.parentNode!==canvas)canvas.prepend(stage);
 const root=document.documentElement;
 let lastKey='',scheduled=false;
 function resize(){
   scheduled=false;
   // Un navigateur desktop rétréci conserve la composition desktop.
   // Le téléphone possède un canevas portrait indépendant.
   const mobile=window.matchMedia('(max-width:699px) and (pointer:coarse)').matches;
   document.body.classList.toggle('home-canvas-mobile',mobile);
   const mode=mobile?'mobile':'desktop';
   const designWidth=mobile?430:1536;
   const designHeight=mobile?1280:1024;
   const availableWidth=Math.max(1,viewport.clientWidth||root.clientWidth);
   // En format paysage, le hero doit être visible dans sa totalité :
   // aucun titre, bouton ou pied de scène n'est coupé sur les écrans peu hauts.
   const availableHeight=Math.max(1,window.innerHeight||designHeight);
   const key=[mode,availableWidth,availableHeight].join(':');
   if(key===lastKey)return;
   lastKey=key;
   // Sur téléphone, préserver une taille de lecture correcte : la composition
   // portrait reste proportionnelle en largeur et peut être parcourue verticalement.
   const scale=mobile
     ?availableWidth/designWidth
     :Math.min(availableWidth/designWidth,availableHeight/designHeight);
   const fittedWidth=designWidth*scale;
   const fittedHeight=designHeight*scale;
   const leftOffset=Math.max(0,(availableWidth-fittedWidth)/2);
   root.style.setProperty('--home-canvas-scale',String(scale));
   root.style.setProperty('--home-canvas-offset-x',leftOffset+'px');
   viewport.style.setProperty('--home-canvas-height',fittedHeight+'px');
   root.dataset.homeCanvas=mode;
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
   new ResizeObserver(schedule).observe(viewport);
 }
})();
