/* CH’ANGE — moteur public du Mode éditeur. Les données publiées proviennent de Supabase RLS. */
(function(){
 'use strict';
 const stage=document.createElement('div');
 stage.id='change-landing-stage';
 stage.hidden=true;
 stage.setAttribute('aria-hidden','true');
 stage.innerHTML='<img class="change-stage-photo" alt=""><div class="change-stage-veil"></div><div class="change-stage-layers"></div>';
 document.body.prepend(stage);
 const pages=new Map(), original=new WeakMap();
 const root=document.documentElement;
 const number=(v,min,max,d)=>{const n=Number(v);return v!==''&&v!==null&&v!==undefined&&Number.isFinite(n)?Math.max(min,Math.min(max,n)):d};
 const imageUrl=(value,preview=false)=>{
   if(typeof value!=='string'||value.length>8*1024*1024)return '';
   try{const u=new URL(value,location.href);
     if(u.protocol==='https:')return u.href;
     if(preview&&/^data:image\/(png|jpeg|webp);base64,[a-z0-9+/=]+$/i.test(value))return value;
   }catch{}
   return '';
 };
 const typefaces={'Italiana':"'Italiana',Georgia,serif",'DM Sans':"'DM Sans',Arial,sans-serif",'Georgia':'Georgia,serif','Arial':'Arial,sans-serif'};
 const selectors={
   beauty_label:'.dual-home__panel--beauty .dual-home__label',
   beauty_title:'.dual-home__panel--beauty h1',
   beauty_sub:'.dual-home__panel--beauty .dual-home__sub',
   beauty_description:'.dual-home__panel--beauty .dual-home__copy > p:not(.dual-home__sub)',
   beauty_button:'.dual-home__panel--beauty .btn',
   hair_label:'.dual-home__panel--hair .dual-home__label',
   hair_title:'.dual-home__panel--hair h2',
   hair_sub:'.dual-home__panel--hair .dual-home__sub',
   hair_description:'.dual-home__panel--hair .dual-home__copy > p:not(.dual-home__sub)',
   hair_button:'.dual-home__panel--hair .btn',
   center_title:'.dual-home__center h2',
   center_description:'.dual-home__center p',
   scroll_hint:'.dual-home__scroll',
   hero_service_1:'.dual-home__services li:nth-child(1)',
   hero_service_2:'.dual-home__services li:nth-child(2)',
   hero_service_3:'.dual-home__services li:nth-child(3)',
   hero_service_4:'.dual-home__services li:nth-child(4)',
   intro_kicker:'.intro-bands .section-kicker',
   intro_title:'.intro-bands h2',
   intro_description:'.intro-bands > p:last-child',
   page_title:'[data-cms-heading]',
   page_description:'.inner-intro p,.gift-hero p'
 };
 function updateText(slug,design){
   const page=document.querySelector('[data-cms-page="'+slug+'"]');
   if(!page)return;
   for(const [key,selector] of Object.entries(selectors)){
     const el=page.querySelector(selector);
     if(!el)continue;
     if(!original.has(el))original.set(el,el.innerHTML);
     el.innerHTML=original.get(el);
     el.removeAttribute('style');
     const item=design?.texts?.[key];
     if(!item||typeof item!=='object')continue;
     if(typeof item.text==='string'&&item.text.trim()){
       // Aucun HTML administrateur n'est injecté : seul le texte est éditable.
       if(key.endsWith('_button')){
         const label=document.createTextNode(item.text+' ');
         el.replaceChildren(label);
         const arrow=document.createElement('span');arrow.setAttribute('aria-hidden','true');arrow.textContent='→';el.append(arrow);
       }else el.textContent=item.text;
       el.style.whiteSpace='pre-line';
     }
     if(typefaces[item.font])el.style.fontFamily=typefaces[item.font];
     if(item.size!==undefined){
       const fontSize=number(item.size,9,110,22)+'px';
       el.style.fontSize=fontSize;
       // Le canevas applique cette variable avant sa transformation :
       // une taille éditée est proportionnelle à l'image, même au redimensionnement.
       el.style.setProperty('--home-editor-font-size',fontSize);
     }
     if(/^#[0-9a-f]{6}$/i.test(item.color||''))el.style.color=item.color;
     if(item.opacity!==undefined)el.style.opacity=String(number(item.opacity,0,100,100)/100);
     if(item.weight!==undefined)el.style.fontWeight=String(number(item.weight,300,800,400));
     if(item.spacing!==undefined)el.style.letterSpacing=number(item.spacing,-3,12,0)+'px';
     if(['left','right','center'].includes(item.align))el.style.textAlign=item.align;
   }
 }
 function renderLayers(host,items,preview=false){
   host.replaceChildren();
   for(const [index,item] of (Array.isArray(items)?items.slice(0,4):[]).entries()){
     const src=imageUrl(item?.url,preview);
     if(!src)continue;
     const img=document.createElement('img');
     img.src=src;img.alt='';img.className='change-editor-layer';img.decoding='async';img.dataset.changeLayerIndex=String(index);
     img.style.setProperty('--layer-x',number(item.x,0,100,50)+'%');
     img.style.setProperty('--layer-y',number(item.y,0,100,50)+'%');
     img.style.setProperty('--layer-width',number(item.width,1,200,40)+'%');
     img.style.setProperty('--layer-mobile-width',number(item.mobile_width,1,200,60)+'%');
     img.style.setProperty('--layer-rotate',number(item.rotate,-180,180,0)+'deg');
     img.style.setProperty('--layer-opacity',String(number(item.opacity,0,100,100)/100));
     host.append(img);
   }
 }
 function measure(){
   // Le fond s'arrête au bas du hero : la section d'introduction est séparée.
   const home=document.querySelector('#page-accueil .dual-home');
   const active=document.body.classList.contains('change-home-layout');
   if(home&&active&&!stage.hidden){
     const end=home.getBoundingClientRect().bottom+window.scrollY;
     stage.style.height=Math.max(0,Math.round(end))+'px';
   }
   document.body.classList.toggle('change-stage-scrolled',active&&window.scrollY>42);
 }
 function activate(){
   const raw=(location.hash||'#accueil').slice(1).split('?')[0];
   const slug=pages.has(raw)?raw:'accueil';
   const page=pages.get(slug);
   if(!page)return;
   const cfg=page.hero_image_settings||{},d=cfg.design||{};
   const onHome=slug==='accueil';
   const customHeader=!onHome&&(Object.prototype.hasOwnProperty.call(d,'header_opacity')||Object.prototype.hasOwnProperty.call(d,'topbar_opacity'));
   document.body.classList.toggle('change-page-header-active',customHeader);
   root.style.setProperty('--topbar-opacity',number(d.topbar_opacity,0,100,60)/100);
   root.style.setProperty('--header-opacity',number(d.header_opacity,0,100,8)/100);
   root.style.setProperty('--intro-opacity',number(d.intro_opacity,0,100,0)/100);
   const primary=imageUrl(page.hero_image_url,!!page.__preview);
   const show=onHome&&(d.stage_enabled!==false)&&(!!primary||(Array.isArray(d.layers)&&d.layers.some(x=>imageUrl(x?.url,!!page.__preview))));
   stage.hidden=!show;
   document.body.classList.toggle('change-stage-active',show);
   document.body.classList.remove('change-stage-scrolled');
   if(!show)stage.style.height='0px';
   if(show){
     const img=stage.querySelector('.change-stage-photo');
     img.hidden=!primary;
     if(primary)img.src=primary;else img.removeAttribute('src');
     stage.style.setProperty('--stage-x',number(d.image_x??cfg.x,0,100,50)+'%');
     stage.style.setProperty('--stage-y',number(d.image_y??cfg.y,0,100,50)+'%');
     stage.style.setProperty('--stage-mobile-x',number(d.image_mobile_x??cfg.mobile_x,0,100,50)+'%');
     stage.style.setProperty('--stage-mobile-y',number(d.image_mobile_y??cfg.mobile_y,0,100,50)+'%');
     stage.style.setProperty('--stage-zoom',number(d.image_scale,30,250,100)/100);
     stage.style.setProperty('--stage-opacity',number(d.image_opacity,0,100,100)/100);
     stage.style.setProperty('--stage-veil',number(d.veil??cfg.overlay,0,100,25)/100);
     img.style.objectFit=d.image_fit==='contain'?'contain':'cover';
     renderLayers(stage.querySelector('.change-stage-layers'),d.layers,!!page.__preview);
     measure();
   }
 }
 function apply(page){
   if(!page||typeof page.slug!=='string')return;
   // Un rafraîchissement des données publiées ne doit pas écraser un brouillon reçu en iframe.
   const previous=pages.get(page.slug);
   if(isPreview&&previous?.__preview&&!page.__preview)page=previous;
   pages.set(page.slug,page);
   const design=page.hero_image_settings?.design||{};
   updateText(page.slug,design);
   const region=document.querySelector('[data-cms-page="'+page.slug+'"]');
   if(region&&page.slug!=='accueil'){
     if(page.__preview){
       const photo=imageUrl(page.hero_image_url,true);
       const picture=region.querySelector('.hero-visual img,.universe-grid img,.gift-hero img');
       if(photo&&picture){picture.src=photo;picture.removeAttribute('srcset');}
     }
     let canvas=region.querySelector('.change-page-design-canvas');
     if(!canvas){canvas=document.createElement('div');canvas.className='change-page-design-canvas';region.prepend(canvas);}
     region.classList.toggle('change-page-with-layers',Array.isArray(design.layers)&&design.layers.length>0);
     canvas.hidden=!Array.isArray(design.layers)||!design.layers.length;
     renderLayers(canvas,design.layers,!!page.__preview);
     canvas.style.opacity=String(number(design.page_opacity,0,100,100)/100);
   }
   activate();
 }
 const isPreview=new URLSearchParams(location.search).get('change_preview')==='1';
 if(isPreview){
   window.addEventListener('message',event=>{
     if(event.origin!=='https://pro.institut-change.fr'||event.source!==window.parent)return;
     const payload=event.data;
     if(!payload||payload.type!=='change-editor-preview'||!['accueil','soins','tarifs','univers','galerie','cadeaux','contact'].includes(payload.slug))return;
     const prev=pages.get(payload.slug)||{slug:payload.slug,hero_image_url:''};
     if(!payload.design||typeof payload.design!=='object')return;
     const settings={...(prev.hero_image_settings||{}),...payload.legacy,design:payload.design};
     const next={...prev,hero_image_settings:settings,hero_image_url:payload.image_url||prev.hero_image_url,__preview:true};
     apply(next);
     if(payload.slug==='accueil'&&location.hash!=='#accueil')location.hash='#accueil';
   });
   document.body.classList.add('change-editor-preview');
   let drag=null;
   document.addEventListener('pointerdown',event=>{
     const layer=event.target.closest('.change-editor-layer');
     if(!layer||event.button!==0)return;
     const host=layer.closest('#change-landing-stage,.change-page-design-canvas');
     if(!host)return;
     event.preventDefault();
     drag={layer,host,index:Number(layer.dataset.changeLayerIndex),pointerId:event.pointerId};
     try{layer.setPointerCapture(event.pointerId);}catch{}
   },true);
   document.addEventListener('pointermove',event=>{
     if(!drag||drag.pointerId!==event.pointerId)return;
     const box=drag.host.getBoundingClientRect();
     drag.x=Math.max(0,Math.min(100,(event.clientX-box.left)/box.width*100));
     drag.y=Math.max(0,Math.min(100,(event.clientY-box.top)/box.height*100));
     drag.layer.style.setProperty('--layer-x',drag.x.toFixed(1)+'%');
     drag.layer.style.setProperty('--layer-y',drag.y.toFixed(1)+'%');
   },true);
   document.addEventListener('pointerup',event=>{
     if(!drag||drag.pointerId!==event.pointerId)return;
     if(Number.isFinite(drag.x)&&Number.isFinite(drag.y))window.parent.postMessage({
       type:'change-editor-layer-move',index:drag.index,x:Math.round(drag.x),y:Math.round(drag.y)
     },'https://pro.institut-change.fr');
     drag=null;
   },true);
   document.addEventListener('click',event=>{
     if(event.target.closest('.change-editor-layer'))return;
     const section=event.target.closest('[data-cms-page]');
     if(!section)return;
     for(const [key,selector] of Object.entries(selectors)){
       if(event.target.closest(selector)){
         event.preventDefault();
         window.parent.postMessage({type:'change-editor-select-text',key},'https://pro.institut-change.fr');
         break;
       }
     }
   },true);
   window.parent.postMessage({type:'change-editor-ready'},'https://pro.institut-change.fr');
 }
 addEventListener('hashchange',()=>requestAnimationFrame(activate));
 addEventListener('scroll',measure,{passive:true});
 addEventListener('resize',measure,{passive:true});
 if('ResizeObserver'in window){addEventListener('DOMContentLoaded',()=>{const intro=document.querySelector('#page-accueil .intro-bands');if(intro)new ResizeObserver(measure).observe(intro);});}
 window.CHANGE_DESIGN_PUBLIC={apply};
})();