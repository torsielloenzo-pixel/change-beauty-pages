/* CH'ANGE x NAMAJE : two public universes, one shared design system.
   Entirely restricted to the public site. The Pro editor/gestion files are untouched. */
(function(){
  'use strict';
  if (window.self !== window.top || document.body.classList.contains('change-editor-preview')) return;

  const ROOT = document.documentElement;
  const STORE = 'change:universe:v1';
  const DEFAULTS = {
    gate: 'https://xhahganhwgygmwuckrak.supabase.co/storage/v1/object/public/change-public-media/pages/accueil/0ac88996-3784-4615-83a5-44379a5ed568.webp',
    change: 'https://xhahganhwgygmwuckrak.supabase.co/storage/v1/object/public/change-public-media/pages/esthetique/d30f78ee-e091-4d9f-a609-e3822205b334.webp',
    namaje: 'https://xhahganhwgygmwuckrak.supabase.co/storage/v1/object/public/change-public-media/pages/coiffure/43d502ea-7cbb-42a5-b445-34284529500f.webp'
  };
  const safeStored = () => {try{return sessionStorage.getItem(STORE)}catch{return null}};
  const save = value => {try{sessionStorage.setItem(STORE,value)}catch{}};
  const valid = value => value === 'change' || value === 'namaje';
  const hashPage = () => (location.hash.slice(1).split('?')[0] || 'accueil').toLowerCase();
  const userParams = new URLSearchParams(location.search);
  let universe = null, shown = false, inChoice = false, previouslyFocused = null;
  const originals = new Map();
  const baseFooter = {};
  let activeRefresh = 0;

  const gate = document.createElement('section');
  gate.className = 'universe-gate';
  gate.id = 'universe-gate';
  gate.hidden = true;
  gate.setAttribute('role','dialog');
  gate.setAttribute('aria-modal','true');
  gate.setAttribute('aria-label','Choisir un univers de beauté');
  gate.innerHTML =
    '<div class="universe-gate__photography" aria-hidden="true"></div>'+
    '<div class="universe-gate__shade" aria-hidden="true"></div>'+
    '<div class="universe-gate__frame" aria-hidden="true"></div>'+
    '<div class="universe-gate__eyebrow">L’ART DE RÉVÉLER VOTRE BEAUTÉ</div>'+
    '<div class="universe-gate__intro">'+
      '<p>DEUX UNIVERS · UNE MÊME VISION</p>'+
      '<h1><span>CH’ANGE</span><i>×</i><span>NAMAJE</span></h1>'+
      '<div class="universe-gate__rule" aria-hidden="true"></div>'+
      '<strong>La beauté, sous toutes ses expressions.</strong>'+
      '<button class="universe-gate__discover" type="button">DÉCOUVRIR <span aria-hidden="true">→</span></button>'+
    '</div>'+
    '<div class="universe-gate__choice" inert>'+
      '<div class="universe-gate__question"><h2>Quel univers vous inspire ?</h2><p>CHOISISSEZ VOTRE EXPÉRIENCE</p></div>'+
      '<div class="universe-gate__options">'+
        '<button class="universe-gate__option" type="button" data-universe-choice="change" aria-label="Entrer dans l’univers CH’ANGE esthétique">'+
          '<span class="universe-gate__option-kicker">L’UNIVERS CH’ANGE</span><strong>Esthétique</strong><span class="universe-gate__option-action">EXPLORER <span aria-hidden="true">↗</span></span>'+
        '</button>'+
        '<button class="universe-gate__option" type="button" data-universe-choice="namaje" aria-label="Entrer dans l’univers NAMAJE coiffure">'+
          '<span class="universe-gate__option-kicker">L’UNIVERS NAMAJE</span><strong>Coiffure</strong><span class="universe-gate__option-action">EXPLORER <span aria-hidden="true">↗</span></span>'+
        '</button>'+
      '</div>'+
    '</div>'+
    '<button class="universe-gate__back" type="button" hidden>← RETOUR</button>'+
    '<p class="universe-gate__foot">CH’ANGE & NAMAJE · DEUX SIGNATURES, UNE EXPÉRIENCE</p>';
  document.body.append(gate);

  const photo = gate.querySelector('.universe-gate__photography');
  photo.style.backgroundImage = 'url("' + DEFAULTS.gate + '")';
  const choice = gate.querySelector('.universe-gate__choice');
  const intro = gate.querySelector('.universe-gate__intro');
  const back = gate.querySelector('.universe-gate__back');
  const opts = Array.from(gate.querySelectorAll('[data-universe-choice]'));
  const navTitles = {
    change: [['accueil','Accueil'],['esthetique','Esthétique'],['univers','À propos'],['tarifs','Tarifs'],['contact','Contact']],
    namaje: [['accueil','Accueil'],['coiffure','Coiffure'],['univers','À propos'],['tarifs','Tarifs'],['contact','Contact']]
  };
  const header = document.querySelector('.site-header');
  const actions = header && header.querySelector('.header-actions');
  const desktopNav = document.createElement('nav');
  desktopNav.className = 'universe-public-nav';
  desktopNav.setAttribute('aria-label','Navigation de l’univers sélectionné');
  if(actions) header.insertBefore(desktopNav,actions);
  const newBrand = document.createElement('a');
  newBrand.className = 'universe-namaje-brand';
  newBrand.href = '#accueil';
  newBrand.innerHTML = '<span>NAMAJE</span><small>INSTITUT DE COIFFURE</small>';
  newBrand.setAttribute('aria-label','NAMAJE, retour à l’accueil coiffure');
  if(header) header.insertBefore(newBrand,header.querySelector('.wordmark')?.nextSibling || header.firstChild);
  const switcher = document.createElement('button');
  switcher.className = 'universe-switch';
  switcher.type = 'button';
  switcher.textContent = 'CHANGER D’UNIVERS';
  if(actions) actions.insertBefore(switcher,actions.firstChild);

  const home = document.createElement('div');
  home.className = 'universe-home';
  home.innerHTML =
    '<div class="universe-home__hero">'+
      '<div class="universe-home__copy">'+
        '<p class="universe-home__kicker"></p>'+
        '<h1 class="universe-home__name"></h1>'+
        '<p class="universe-home__subtitle"></p>'+
        '<p class="universe-home__description"></p>'+
        '<div class="universe-home__actions">'+
          '<a class="universe-home__primary" href="#esthetique"><span>Explorer les prestations</span><span aria-hidden="true">↗</span></a>'+
          '<a class="universe-home__secondary" href="#tarifs">DÉCOUVRIR LES TARIFS <span aria-hidden="true">→</span></a>'+
        '</div>'+
        '<div class="universe-home__edition">UN SAVOIR-FAIRE · UNE SIGNATURE</div>'+
      '</div>'+
      '<div class="universe-home__visual" role="img"><span class="universe-home__visual-tag"></span></div>'+
    '</div>'+
    '<section class="universe-home__services">'+
      '<div class="universe-home__services-heading"><p>NOTRE SAVOIR-FAIRE</p><h2>Une beauté qui vous ressemble.</h2></div>'+
      '<div class="universe-home__service-grid"></div>'+
    '</section>'+
    '<section class="universe-home__closing"><div><p>LE THOR · VAUCLUSE</p><h2>Une parenthèse rien qu’à vous.</h2></div><a href="#contact">NOUS CONTACTER <span aria-hidden="true">↗</span></a></section>';
  const accueil = document.getElementById('page-accueil');
  if(accueil) accueil.prepend(home);

  const prices = document.createElement('section');
  prices.className = 'universe-namaje-pricing container';
  prices.innerHTML =
    '<div class="universe-namaje-pricing__kicker">NAMAJE · COIFFURE</div>'+
    '<h2>Des prestations pensées pour vos cheveux.</h2>'+
    '<p>La grille tarifaire NAMAJE n’est pas encore publiée sur ce site. Contactez l’équipe pour connaître les tarifs et les prestations disponibles.</p>'+
    '<div><a href="tel:+33615604001">NOUS APPELER <span aria-hidden="true">↗</span></a>'+
    '<a href="#contact">NOUS CONTACTER <span aria-hidden="true">→</span></a></div>';
  document.getElementById('page-tarifs')?.append(prices);

  function remember(selector) {
    const el = document.querySelector(selector);
    if(el && !originals.has(selector)) originals.set(selector,el.innerHTML);
    return el;
  }
  const edits = {
    '#page-univers .inner-intro .overline': 'L’UNIVERS NAMAJE',
    '#page-univers .inner-intro h1': 'Le style se révèle <i>naturellement.</i>',
    '#page-univers .inner-intro p': 'NAMAJE vous invite à découvrir son univers de coiffure : coupes, couleurs, mouvement et conseils adaptés à vos envies.',
    '#page-univers .universe-grid .overline': 'L’ART DE LA COIFFURE',
    '#page-univers .universe-grid h2': 'Votre style, <i>votre signature.</i>',
    '#page-univers .universe-grid p:first-of-type': 'Chez NAMAJE, chaque coiffure se pense dans le respect du mouvement, de la texture et de la personnalité de vos cheveux.',
    '#page-univers .universe-grid p:nth-of-type(2)': 'Notre univers réunit le sens du détail, l’écoute et le soin apporté à chaque prestation. Retrouvez-nous au 27 cours Gambetta, 84250 Le Thor.',
    '#page-tarifs .price-heading .overline': 'NAMAJE · INSTITUT DE COIFFURE',
    '#page-tarifs .price-heading h1': 'Les tarifs <i>coiffure.</i>',
    '#page-tarifs .price-heading p': 'Retrouvez les informations concernant les prestations coiffure de NAMAJE.',
    '#page-contact .inner-intro .overline': 'CONTACT · NAMAJE',
    '#page-contact .inner-intro h1': 'À bientôt <i>chez NAMAJE.</i>',
    '#page-contact .inner-intro p': 'Une question sur la coiffure, les prestations ou votre prochaine visite ? Contactez notre équipe.',
    '#page-contact .contact-card .overline': 'CONTACTER L’ÉQUIPE',
    '#page-contact .contact-card h2': 'NAMAJE, <i>Le Thor.</i>'
  };

  const footer = document.querySelector('.footer');
  const footerBrand = footer?.querySelector('.footer-brand .wordmark');
  const footerCopy = footer?.querySelector('.footer-brand p');
  const footerExplore = footer?.querySelector('.footer-top > div:nth-child(2)');
  const footerCopyright = footer?.querySelector('.footer-bottom > span:first-child');
  const footerContact = footer?.querySelector('.footer-top > div:nth-child(3) a[href^="mailto:"]');
  const aboutImage = document.querySelector('#page-univers .universe-grid img');
  const originalAboutImage = aboutImage?.getAttribute('src') || '';
  if(footerBrand) baseFooter.brand = footerBrand.innerHTML;
  if(footerCopy) baseFooter.copy = footerCopy.textContent;
  if(footerExplore) baseFooter.explore = footerExplore.innerHTML;
  if(footerCopyright) baseFooter.copyright = footerCopyright.innerHTML;

  function updateNav(){
    if(!universe)return;
    const links = navTitles[universe];
    desktopNav.replaceChildren();
    const mobile = document.getElementById('mobile-menu');
    if(mobile) mobile.replaceChildren();
    for(const pair of links){
      const a = document.createElement('a');
      a.href = '#' + pair[0];
      a.textContent = pair[1];
      a.dataset.universeNav = pair[0];
      desktopNav.append(a);
      if(mobile) mobile.append(a.cloneNode(true));
    }
    if(footerExplore) {
      footerExplore.replaceChildren();
      const label = document.createElement('strong');
      label.textContent = 'Explorer';
      footerExplore.append(label);
      for(const pair of links){
        const a = document.createElement('a');
        a.href='#'+pair[0];
        a.textContent=pair[1];
        footerExplore.append(a);
      }
    }
    const current=hashPage();
    document.querySelectorAll('[data-universe-nav]').forEach(a=>{
      const selected=a.dataset.universeNav===current;
      a.classList.toggle('active',selected);
      if(selected)a.setAttribute('aria-current','page');
      else a.removeAttribute('aria-current');
    });
  }
  function pictureFor(slug){
    const img = document.querySelector('#page-'+slug+' .change-stage-photo');
    const src=img?.getAttribute('src');
    return src && /^https:\/\//i.test(src) ? src : DEFAULTS[slug==='coiffure'?'namaje':'change'];
  }
  const homeData = {
    change:{
      kicker:'CH’ANGE · INSTITUT DE BEAUTÉ',
      title:'CH’ANGE',
      subtitle:'L’esthétique comme une attention à soi.',
      description:'Des soins sur mesure pour révéler votre beauté naturelle, dans un univers de douceur et de bien-être.',
      page:'esthetique', action:'DÉCOUVRIR L’ESTHÉTIQUE',
      photo:'esthetique',tag:'ESTHÉTIQUE · CH’ANGE',
      services:[['01','SOINS DU VISAGE','Une parenthèse pour votre peau.'],['02','SOINS DU CORPS','Prendre le temps de se retrouver.'],['03','BEAUTÉ & BIEN-ÊTRE','L’attention portée à chaque détail.']],
      section:'Des soins pensés pour vous.',closing:'Le plaisir de prendre soin de soi.'
    },
    namaje:{
      kicker:'NAMAJE · INSTITUT DE COIFFURE',
      title:'NAMAJE',
      subtitle:'Des cheveux sublimés, une signature unique.',
      description:'Coupes, couleurs, mouvement et matière : exprimez votre personnalité dans un univers chaleureux et contemporain.',
      page:'coiffure',action:'DÉCOUVRIR LA COIFFURE',
      photo:'coiffure',tag:'COIFFURE · NAMAJE',
      services:[['01','COUPES & COIFFAGE','Une coupe qui suit votre mouvement.'],['02','COLORATION','Des nuances qui vous ressemblent.'],['03','SOINS CAPILLAIRES','Mettre en valeur la matière.']],
      section:'Votre style, notre inspiration.',closing:'Votre prochaine signature capillaire.'
    }
  };
  function updateHome(){
    if(!universe)return;
    const data=homeData[universe];
    home.querySelector('.universe-home__kicker').textContent=data.kicker;
    home.querySelector('.universe-home__name').textContent=data.title;
    home.querySelector('.universe-home__subtitle').textContent=data.subtitle;
    home.querySelector('.universe-home__description').textContent=data.description;
    const a=home.querySelector('.universe-home__primary');
    a.href='#'+data.page;
    a.querySelector('span').textContent=data.action;
    home.querySelector('.universe-home__visual').style.backgroundImage='url("'+pictureFor(data.photo)+'")';
    home.querySelector('.universe-home__visual').setAttribute('aria-label','Image de l’univers '+data.tag);
    home.querySelector('.universe-home__visual-tag').textContent=data.tag;
    home.querySelector('.universe-home__services-heading h2').textContent=data.section;
    home.querySelector('.universe-home__closing h2').textContent=data.closing;
    const services=home.querySelector('.universe-home__service-grid');
    services.replaceChildren();
    for(const item of data.services){
      const card=document.createElement('a');
      card.className='universe-home__service';
      card.href='#'+data.page;
      const num=document.createElement('span');num.textContent=item[0];
      const heading=document.createElement('strong');heading.textContent=item[1];
      const desc=document.createElement('p');desc.textContent=item[2];
      const arrow=document.createElement('b');arrow.textContent='↗';arrow.setAttribute('aria-hidden','true');
      card.append(num,heading,desc,arrow);
      services.append(card);
    }
  }
  function updateBrandContent(){
    for(const selector of Object.keys(edits)){
      const el=remember(selector);
      if(!el)continue;
      if(universe==='namaje')el.innerHTML=edits[selector];
      else if(originals.has(selector))el.innerHTML=originals.get(selector);
    }
    if(footerBrand)footerBrand.innerHTML=universe==='namaje'?'NAMAJE <small>INSTITUT DE COIFFURE</small>':baseFooter.brand;
    if(footerCopy)footerCopy.textContent=universe==='namaje'?'Votre style, notre attention.':baseFooter.copy;
    if(footerContact)footerContact.textContent=universe==='namaje'?'Écrire à NAMAJE':'Écrire à Ch’ange';
    if(aboutImage){
      if(universe==='namaje')aboutImage.src=pictureFor('coiffure');
      else if(originalAboutImage)aboutImage.src=originalAboutImage;
    }
    if(footerCopyright)footerCopyright.innerHTML=universe==='namaje'? '© <span id="year-public-namaje"></span> NAMAJE · Institut de coiffure' : baseFooter.copyright;
    const footerYear=document.getElementById('year-public-namaje');
    if(footerYear)footerYear.textContent=String(new Date().getFullYear());
    const mainYear=document.getElementById('year');if(mainYear)mainYear.textContent=String(new Date().getFullYear());
    document.title=(universe==='namaje'?'NAMAJE · Institut de coiffure':'CH’ANGE · Institut de beauté')+' — '+({
      accueil:'Accueil',esthetique:'Esthétique',coiffure:'Coiffure',univers:'À propos',tarifs:'Tarifs',contact:'Contact'
    }[hashPage()] || 'Accueil')+' · Le Thor';
  }
  function inertSite(value){
    [document.querySelector('main'),header,footer].forEach(el=>{if(el)el.inert=!!value;});
  }
  function activateChoice(){
    inChoice=true;
    gate.classList.add('is-choosing');
    intro.setAttribute('aria-hidden','true');
    choice.inert=false;
    back.hidden=false;
    // On entry neither choice is highlighted; only pointer hover changes its appearance.
    back.focus({preventScroll:true});
  }
  function openGate(skipIntro){
    previouslyFocused = document.activeElement;
    shown=true;
    gate.hidden=false;
    gate.classList.remove('is-choosing');
    inChoice=false;
    intro.removeAttribute('aria-hidden');
    choice.inert=true;
    back.hidden=true;
    document.body.classList.add('universe-gate-open');
    inertSite(true);
    if(skipIntro)activateChoice();
    else gate.querySelector('.universe-gate__discover').focus({preventScroll:true});
  }
  function closeGate(){
    shown=false;
    gate.hidden=true;
    document.body.classList.remove('universe-gate-open');
    inertSite(false);
    previouslyFocused?.focus?.({preventScroll:true});
  }
  function routeWithinUniverse(){
    if(!universe)return;
    const page=hashPage();
    if(universe==='namaje' && (page==='esthetique'||page==='soins'||page==='cadeaux'||page==='galerie')){
      location.hash='#coiffure';return;
    }
    if(universe==='change' && page==='coiffure'){
      location.hash='#esthetique';return;
    }
    updateNav();
    updateBrandContent();
  }
  function selectUniverse(selected){
    if(!valid(selected))return;
    universe=selected;
    ROOT.dataset.universe=selected;
    document.body.dataset.universe=selected;
    save(selected);
    const url=new URL(location.href);
    url.searchParams.set('univers',selected);
    url.hash='#accueil';
    history.replaceState(history.state,'',url.toString());
    updateNav();
    updateHome();
    updateBrandContent();
    closeGate();
    window.dispatchEvent(new Event('hashchange'));
    clearTimeout(activeRefresh);
    activeRefresh=setTimeout(updateHome,1200);
    setTimeout(updateHome,3100);
  }

  gate.querySelector('.universe-gate__discover').addEventListener('click',activateChoice);
  back.addEventListener('click',()=>{
    if(!inChoice)return;
    gate.classList.remove('is-choosing');
    inChoice=false;choice.inert=true;back.hidden=true;
    intro.removeAttribute('aria-hidden');
    gate.querySelector('.universe-gate__discover').focus();
  });
  for(const btn of opts){
    // Touch: select by tap; desktop: visual feedback comes only from CSS :hover.
    btn.addEventListener('click',()=>selectUniverse(btn.dataset.universeChoice));
  }
  switcher.addEventListener('click',()=>openGate(true));
  document.addEventListener('keydown',e=>{
    if(!shown)return;
    if(e.key==='Escape' && universe){e.preventDefault();closeGate();}
    if(e.key==='Tab'){
      const focusable=Array.from(gate.querySelectorAll('button:not([hidden])')).filter(x=>x.offsetParent!==null&&getComputedStyle(x).visibility!=='hidden'&&!x.closest('[inert]'));
      if(!focusable.length)return;
      const first=focusable[0],last=focusable[focusable.length-1];
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
      if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
    }
  });
  window.addEventListener('hashchange',routeWithinUniverse);
  const explicit=userParams.get('univers');
  const deepLink=hashPage();
  if(valid(explicit)) {
    universe=explicit;
  }else if(deepLink==='esthetique'){
    universe='change';
  }else if(deepLink==='coiffure'){
    universe='namaje';
  }else if(valid(safeStored())) {
    universe=safeStored();
  }
  if(universe){
    ROOT.dataset.universe=universe;
    document.body.dataset.universe=universe;
    save(universe);
    updateNav();updateHome();updateBrandContent();
    setTimeout(()=>{updateHome();updateBrandContent();},1400);
    setTimeout(()=>{updateHome();updateBrandContent();},3500);
    routeWithinUniverse();
  } else {
    openGate(false);
  }
})();