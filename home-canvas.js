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
  // Le script doit aussi fonctionner dans les tests du canevas à DOM simulé.
  if(typeof document.createElement!=='function')return;
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


/*
 * CH'ANGE / NAMAJE — catégories coiffure, placées à gauche sur la page Coiffure.
 * La photographie et le bloc NAMAJE à droite restent inchangés.
 * Les photographies sont des illustrations libres Unsplash (remplaçables ensuite).
 */
(function(){
  'use strict';
  // Le runner des tests unitaires du canevas simule seulement les APIs de géométrie.
  if(typeof document.createElement!=='function')return;
  const page=document.getElementById('page-coiffure');
  const hero=page?.querySelector(':scope > .dual-home');
  if(!hero||page.querySelector('.coiffure-service-menu'))return;

  const mediaBase='https://images.unsplash.com/';
  const icon=(kind)=>{
    const paths={
      scissors:'<circle cx="5.5" cy="6" r="2.5"/><circle cx="5.5" cy="18" r="2.5"/><path d="M7.5 8l11 12M7.5 16l11-12M14.5 8L20 3M14.5 16L20 21"/>',
      color:'<path d="M20 3C11 3 5 8 5 16v5l5-5c8 0 13-5 10-13Z"/><path d="m5 21 12-12M9 17l-2-6m6 2 5 1"/>',
      dryer:'<path d="M4 8a4 4 0 0 1 4-4h7a5 5 0 0 1 0 10H8a4 4 0 0 1-4-4Z"/><path d="M7 14v6h4l2-6M19 6l3-2m-3 6h4"/>',
      drop:'<path d="M12 2C9.3 6.3 5 10.4 5 14.4a7 7 0 0 0 14 0c0-4-4.3-8.1-7-12.4Z"/><path d="M9 16.5c.5 1.3 1.4 2 3 2"/>'
    };
    return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">'+paths[kind]+'</svg>';
  };
  const cards=[
    {
      name:'Coupe & Brushing', detail:'Femme · Homme · Enfant', icon:'scissors',
      image:mediaBase+'photo-1673465766620-1f336d434bff?auto=format&fit=crop&w=720&q=80',
      description:'Découvrez l’univers des coupes et du brushing. Pour choisir une prestation et connaître les tarifs ou disponibilités, contactez NAMAJE.'
    },
    {
      name:'Coloration', detail:'Balayage · Mèches · Gloss', icon:'color',
      image:mediaBase+'photo-1785456411888-c2e842552820?auto=format&fit=crop&w=720&q=80',
      description:'Coloration, balayage, mèches ou gloss : renseignez-vous auprès de NAMAJE pour connaître les possibilités, les tarifs et les disponibilités.'
    },
    {
      name:'Coiffage', detail:'Brushing · Attaches · Événements', icon:'dryer',
      image:mediaBase+'photo-1734111719430-fe4a3973f8af?auto=format&fit=crop&w=720&q=80',
      description:'Pour un brushing, une attache ou un événement, contactez NAMAJE afin de discuter du résultat souhaité et des modalités de rendez-vous.'
    },
    {
      name:'Soins capillaires', detail:'Réparation · Nutrition · Éclat', icon:'drop',
      image:mediaBase+'photo-1605980625982-b128a7e7fde2?auto=format&fit=crop&w=720&q=80',
      description:'Découvrez les soins pour vos cheveux. Les prestations, leurs tarifs et leurs disponibilités sont à confirmer directement auprès de NAMAJE.'
    }
  ];
  const menu=document.createElement('section');
  menu.className='coiffure-service-menu';
  menu.setAttribute('aria-label','Nos prestations coiffure NAMAJE');
  menu.innerHTML='<div class="coiffure-service-menu__panel">'+
    '<div class="coiffure-service-menu__kicker">NOS PRESTATIONS</div>'+
    '<h2 class="coiffure-service-menu__title">Une expertise<br>pour tous vos styles.</h2>'+
    '<p class="coiffure-service-menu__intro">Coupe, couleur, soins et coiffage sur mesure<br>pour sublimer votre chevelure.</p>'+
    '<div class="coiffure-service-menu__cards" role="group" aria-label="Explorer les prestations de coiffure">'+
    cards.map((c,i)=>'<button type="button" class="coiffure-service-card" data-coiffure-service="'+i+'" aria-haspopup="dialog" aria-label="Découvrir : '+c.name+'">'+
      '<img src="'+c.image+'" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer">'+
      '<span class="coiffure-service-card__icon">'+icon(c.icon)+'</span>'+
      '<span class="coiffure-service-card__content"><span class="coiffure-service-card__name">'+c.name+'</span>'+
      '<span class="coiffure-service-card__detail">'+c.detail+'</span></span>'+
      '<span class="coiffure-service-card__arrow" aria-hidden="true">→</span>'+
      '</button>').join('')+
    '</div>'+
    '<a href="#contact" class="coiffure-service-menu__cta">DEMANDER LES TARIFS <span aria-hidden="true">→</span></a>'+
    '</div>'+
    '<dialog class="coiffure-service-menu__dialog" aria-labelledby="coiffure-service-dialog-title">'+
      '<div class="coiffure-service-menu__dialog-body">'+
        '<button type="button" class="coiffure-service-menu__close" aria-label="Fermer les informations sur cette prestation">×</button>'+
        '<div class="coiffure-service-menu__dialog-kicker">NAMAJE · COIFFURE</div>'+
        '<h2 id="coiffure-service-dialog-title"></h2>'+
        '<p class="coiffure-service-menu__dialog-text"></p>'+
        '<p class="coiffure-service-menu__dialog-note">Tarifs et disponibilités : sur demande.</p>'+
        '<a href="#contact" class="coiffure-service-menu__dialog-contact">Se renseigner <span aria-hidden="true">↗</span></a>'+
      '</div>'+
    '</dialog>';
  hero.insertAdjacentElement('afterend',menu);

  // Une carte ouvre une information spécifique ; elle ne pointe pas vers les tarifs esthétique.
  const dialog=menu.querySelector('.coiffure-service-menu__dialog');
  let previousFocus=null;
  menu.querySelectorAll('[data-coiffure-service]').forEach(button=>{
    button.addEventListener('click',()=>{
      const item=cards[Number(button.dataset.coiffureService)];
      if(!item)return;
      if(typeof dialog.showModal!=='function'){location.hash='contact';return;}
      previousFocus=button;
      menu.querySelector('#coiffure-service-dialog-title').textContent=item.name;
      menu.querySelector('.coiffure-service-menu__dialog-text').textContent=item.description;
      dialog.showModal();
    });
  });
  const close=()=>{if(dialog.open)dialog.close();};
  menu.querySelector('.coiffure-service-menu__close').addEventListener('click',close);
  dialog.addEventListener('click',e=>{if(e.target===dialog)close();});
  dialog.addEventListener('close',()=>{if(previousFocus?.isConnected)previousFocus.focus();});
  dialog.querySelector('.coiffure-service-menu__dialog-contact').addEventListener('click',close);
})();
