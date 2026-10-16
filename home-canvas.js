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
  const scenes=[viewport,
    document.querySelector('#page-esthetique .dual-home'),
    document.querySelector('#page-coiffure .dual-home')
  ].filter(Boolean);

  // Chaque page possède une photographie indépendante, insérée derrière SON texte.
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
    for(const hero of scenes)hero.style.setProperty('--home-canvas-height',(designHeight*scale)+'px');
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


/* CH'ANGE — quatre cartes de navigation exclusives à la page Esthétique. */
(function(){
  'use strict';
  const page=document.getElementById('page-esthetique');
  const hero=page?.querySelector(':scope > .dual-home');
  if(!hero||page.querySelector('.esthetique-service-menu'))return;

  const icon=(kind)=>{
    const paths={
      lotus:'<path d="M12 21c-5-3-7-8-6-13 3 1 5 3 6 6 1-3 3-5 6-6 1 5-1 10-6 13Z"/><path d="M12 14C10 10 10 6 12 3c2 3 2 7 0 11ZM6 11c-2-1-4-1-5-1 0 5 4 9 11 11m6-10c2-1 4-1 5-1 0 5-4 9-11 11"/>',
      feather:'<path d="M20 3C11 3 5 8 5 16v5l5-5c8 0 13-5 10-13Z"/><path d="m5 21 12-12M9 17l-2-6m6 2 5 1"/>',
      nail:'<rect x="7" y="9" width="10" height="12" rx="2"/><path d="M10 9V6m4 3V6M9 3h6v3H9zM10 15v3"/>'
    };
    return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">'+(paths[kind]||paths.lotus)+'</svg>';
  };
  const cards=[
    {name:'Soins visage',detail:'Éclat · Hydratation · Anti-âge',photo:'soin-visage',href:'#soins?categorie=visage',icon:'lotus',label:'Découvrir les soins du visage'},
    {name:'Épilation',detail:'Douceur · Précision · Confort',photo:'rituel-spa',href:'#contact',icon:'feather',label:'Se renseigner sur les épilations'},
    {name:'Onglerie',detail:'Mains · Pieds · Beauté durable',photo:'ongles',href:'#contact',icon:'nail',label:'Se renseigner sur les soins des ongles'},
    {name:'Soins corps',detail:'Détente · Bien-être · Éclat',photo:'ambiance-spa',href:'#soins?categorie=corps',icon:'lotus',label:'Découvrir les soins du corps'}
  ];
  const section=document.createElement('section');
  section.className='esthetique-service-menu';
  section.setAttribute('aria-label','Nos prestations esthétique');
  section.innerHTML='<div class="esthetique-service-menu__panel">'+
    '<div class="esthetique-service-menu__kicker">NOS PRESTATIONS</div>'+
    '<h2 class="esthetique-service-menu__title">Des soins pour<br>chaque instant.</h2>'+
    '<p class="esthetique-service-menu__intro">Découvrez nos prestations et laissez-vous guider<br>vers un moment de bien-être sur mesure.</p>'+
    '<nav class="esthetique-service-menu__cards" aria-label="Choisir un univers de soins">'+
    cards.map(c=>'<a class="esthetique-service-card" href="'+c.href+'" aria-label="'+c.label+'">'+
      '<img data-esthetique-photo="'+c.photo+'" alt="" loading="lazy" decoding="async">'+
      '<span class="esthetique-service-card__icon">'+icon(c.icon)+'</span>'+
      '<span class="esthetique-service-card__content"><span class="esthetique-service-card__name">'+c.name+'</span>'+
      '<span class="esthetique-service-card__detail">'+c.detail+'</span></span>'+
      '<span class="esthetique-service-card__arrow" aria-hidden="true">→</span>'+
      '</a>').join('')+
    '</nav></div>';
  hero.insertAdjacentElement('afterend',section);

  // Réutilise les vraies photos déjà publiées sur le site, sans source externe.
  section.querySelectorAll('img[data-esthetique-photo]').forEach(img=>{
    const key=img.dataset.esthetiquePhoto;
    const photo=document.querySelector('[data-photo="'+key+'"]');
    const src=photo?.getAttribute('src');
    if(src)img.src=src;
  });
})();
