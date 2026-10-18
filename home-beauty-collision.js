/*
 * CH’ANGE — prévention des collisions dans le héros de l'accueil.
 * Seul le bloc ESTHÉTIQUE peut être relevé. Le menu des quatre prestations,
 * la photo, COIFFURE et les pages dédiées ne sont jamais déplacés.
 */
(function(){
  'use strict';
  const home=document.getElementById('page-accueil');
  const hero=home?.querySelector('.dual-home');
  const panel=hero?.querySelector('.dual-home__panel--beauty');
  const categories=hero?.querySelector('.dual-home__services');
  const header=document.querySelector('.site-header');
  if(!home||!hero||!panel||!categories)return;

  const liftName='--change-home-beauty-safe-lift';
  const heightName='--change-home-beauty-safe-max-height';
  const overflowName='--change-home-beauty-safe-overflow';
  let previousLift=0,scheduled=false;

  function reset(){
    if(previousLift!==0){
      previousLift=0;
      panel.style.setProperty(liftName,'0px');
    }
    panel.style.removeProperty(heightName);
    panel.style.removeProperty(overflowName);
  }
  function visible(element){
    if(!element||typeof element.getBoundingClientRect!=='function')return false;
    const box=element.getBoundingClientRect();
    return box.width>0&&box.height>0;
  }
  function fit(){
    scheduled=false;
    // Sur téléphone la rangée est masquée : conserver la disposition mobile.
    if(home.hidden||!document.body.classList.contains('change-home-layout')||!visible(categories)||!visible(panel)){
      reset();return;
    }
    const row=categories.getBoundingClientRect();
    const scene=hero.getBoundingClientRect();
    const bar=header?.getBoundingClientRect();
    const gap=Math.max(16,Math.min(24,window.innerHeight*.025));
    // Mesurer dans le même repère que la photo : la marge reste valable
    // même si un redimensionnement survient après un défilement de la page.
    const upperLimit=scene.top+(bar&&bar.height>0?bar.height:0)+gap;
    // Hauteur disponible strictement entre le bas de la navigation et les catégories.
    // En fenêtre inhabituellement basse, le bloc peut défiler sur lui-même plutôt
    // que déborder sur les prestations.
    const room=Math.max(48,row.top-upperLimit-gap);
    const heightValue=Math.floor(room)+'px';
    if(panel.style.getPropertyValue(heightName)!==heightValue){
      panel.style.setProperty(heightName,heightValue);
    }
    // Ne mettre de défilement interne qu'en dernier recours : le contenu
    // garde autrement son ombre, ses boutons et son style d'origine.
    const overflowing=panel.scrollHeight>panel.clientHeight+2;
    const overflow=overflowing?'auto':'visible';
    if(panel.style.getPropertyValue(overflowName)!==overflow){
      panel.style.setProperty(overflowName,overflow);
    }
    const box=panel.getBoundingClientRect();
    // Retrouver la position de départ même si un déplacement précédent est actif.
    // Il n'y a ainsi aucun cumul au redimensionnement ou après édition CMS.
    const baseTop=box.top+previousLift;
    const baseBottom=box.bottom+previousLift;
    const needed=Math.max(0,baseBottom-(row.top-gap));
    const limit=Math.max(0,baseTop-upperLimit);
    const lift=Math.min(needed,limit);
    if(Math.abs(lift-previousLift)>.5){
      previousLift=lift;
      panel.style.setProperty(liftName,lift.toFixed(2)+'px');
    }
  }
  function schedule(){
    if(scheduled)return;
    scheduled=true;
    window.requestAnimationFrame(fit);
  }
  fit();
  window.addEventListener('resize',schedule,{passive:true});
  window.addEventListener('orientationchange',schedule,{passive:true});
  window.addEventListener('hashchange',schedule);
  window.addEventListener('pageshow',schedule);
  window.addEventListener('change-home-canvas-resized',schedule);
  if('ResizeObserver'in window){
    const observer=new ResizeObserver(schedule);
    [hero,panel,categories,header].filter(Boolean).forEach(el=>observer.observe(el));
  }
  if('MutationObserver'in window){
    new MutationObserver(schedule).observe(panel,{
      subtree:true,childList:true,characterData:true
    });
    new MutationObserver(schedule).observe(home,{attributes:true,attributeFilter:['hidden']});
  }
  if(document.fonts){
    document.fonts.ready?.then(schedule).catch(()=>{});
    document.fonts.addEventListener?.('loadingdone',schedule);
  }
})();
