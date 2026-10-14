// Content on the public site is optional until the Ch'ange database is activated.
(async function(){
  'use strict';
  const conf=window.CHANGE_SUPABASE;
  if(!conf?.url||!conf?.publishableKey)return;
  const base=conf.url.replace(/\/$/,'');
  if(!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(base))return;
  const api=(table,params)=>fetch(`${base}/rest/v1/${table}?${params}`,{
    headers:{apikey:conf.publishableKey,accept:'application/json'},mode:'cors',cache:'no-store'
  }).then(async r=>{if(!r.ok)throw Error(String(r.status));return r.json()});
  const safeLink=v=>{try{const u=new URL(v,location.href);return ['https:','mailto:','tel:'].includes(u.protocol)?u.href:null}catch{return null}};
  const safeImage=v=>{try{const u=new URL(v);return u.protocol==='https:'?u.href:null}catch{return null}};
  try {
    const [pages,modules,services]=await Promise.all([
      api('site_pages','select=slug,title,description,visible,hero_image_url,hero_image_settings&visible=eq.true'),
      api('site_modules','select=page_slug,module_type,title,content,image_url,link_url,link_label,sort_order&published=eq.true&order=sort_order.asc'),
      api('services','select=name,category,duration_minutes,price_cents,description&is_active=eq.true&is_publicly_bookable=eq.true&order=name.asc')
    ]);
    const allowed=new Set(pages.map(p=>p.slug));
    document.querySelectorAll('[data-cms-page]').forEach(section=>{
      const slug=section.dataset.cmsPage;
      const page=pages.find(p=>p.slug===slug);
      if(!page){section.hidden=true;document.querySelectorAll(`[href="#${slug}"]`).forEach(a=>a.hidden=true);return}
      const title=section.querySelector('[data-cms-heading]');
      if(title&&page.title)title.textContent=page.title;
      const intro=section.querySelector('.hero-copy p,.inner-intro p,.gift-hero p');
      if(intro&&page.description)intro.textContent=page.description;
      // Image de fond plein écran de l'accueil, derrière Esthétique et Coiffure.
      if(slug==='accueil'){
        const home=section.querySelector('.dual-home');
        const frame=section.querySelector('.dual-home__center-media');
        const img=frame?.querySelector('img');
        const url=safeImage(page.hero_image_url);
        const cfg=page.hero_image_settings||{};
        const clamp=(v,lo,hi,def)=>Number.isFinite(Number(v))&&v!==null&&v!==''?Math.min(hi,Math.max(lo,Number(v))):def;
        if(home&&frame&&img&&url){
          const vars={
            '--hero-x':clamp(cfg.x,0,100,50)+'%',
            '--hero-y':clamp(cfg.y,0,100,50)+'%',
            '--hero-mobile-x':clamp(cfg.mobile_x,0,100,50)+'%',
            '--hero-mobile-y':clamp(cfg.mobile_y,0,100,50)+'%',
            '--hero-zoom':String(clamp(cfg.zoom,100,250,100)/100),
            '--hero-height':clamp(cfg.height,460,1100,700)+'px',
            '--hero-overlay':String(clamp(cfg.overlay,0,90,50)/100),
            '--hero-overlay-mid':String(clamp(cfg.overlay,0,90,50)*.84/100)
          };
          Object.entries(vars).forEach(([name,value])=>home.style.setProperty(name,value));
          img.addEventListener('load',()=>{
            frame.hidden=false;
            home.classList.add('dual-home--with-photo');
          },{once:true});
          img.addEventListener('error',()=>{
            frame.hidden=true;
            home.classList.remove('dual-home--with-photo');
          },{once:true});
          img.src=url;
        }
      }
      const picture=section.querySelector('.hero-visual img,.universe-grid img,.gift-hero img');
      const photo=safeImage(page.hero_image_url);
      if(picture&&photo){picture.src=photo;picture.removeAttribute('srcset');picture.alt=page.title||'Ch’ange'}
    });
    if (services.length && allowed.has('soins')) {
      const host=document.getElementById('care-cards');
      if(host){host.textContent='';
        for(const item of services){
          const cat=/visage|peau|facial/i.test(item.category)?'visage':/corps|massage|relax/i.test(item.category)?'corps':'specifique';
          const article=document.createElement('article');article.className='care-item care-item-dynamic';article.dataset.category=cat;
          const title=document.createElement('h3');title.textContent=item.name;
          const desc=document.createElement('p');desc.textContent=item.description||item.category||'';
          const meta=document.createElement('small');meta.textContent=(item.duration_minutes?item.duration_minutes+' min':'')+(item.price_cents==null?' · Tarif sur demande':' · '+Number(item.price_cents/100).toLocaleString('fr-FR',{style:'currency',currency:'EUR'}));
          const more=document.createElement('button');more.type='button';more.className='text-arrow care-more';more.textContent='Se renseigner ↗';more.setAttribute('aria-haspopup','dialog');more.dataset.careDetail='dynamic';more.dataset.serviceName=item.name;more.dataset.serviceDescription=item.description||'';more.dataset.serviceDuration=String(item.duration_minutes??'');more.dataset.servicePrice=String(item.price_cents??'');
          article.append(title,desc,meta,more);host.append(article);
        }
        document.querySelectorAll('[data-filter]').forEach(btn=>btn.addEventListener('click',()=>{
          const filter=btn.dataset.filter;
          host.querySelectorAll('[data-category]').forEach(c=>c.hidden=filter!=='tout'&&c.dataset.category!==filter);
        }));
      }
    }
    const grouped=modules.filter(x=>allowed.has(x.page_slug));
    grouped.forEach(m=>{
      const target=document.getElementById(`cms-modules-${m.page_slug}`);
      if(!target)return;
      const card=document.createElement('article');card.className='cms-module cms-module--'+(m.module_type==='photo'?'photo':m.module_type==='banniere'?'banner':'text');
      const url=safeImage(m.image_url);
      if(url){const img=document.createElement('img');img.src=url;img.loading='lazy';img.alt=m.title||'Ch’ange';card.append(img)}
      if(m.title){const h=document.createElement('h2');h.textContent=m.title;card.append(h)}
      if(m.content){const p=document.createElement('p');p.textContent=m.content;card.append(p)}
      const link=safeLink(m.link_url);
      if(link&&m.link_label){const a=document.createElement('a');a.href=link;a.textContent=m.link_label;card.append(a)}
      target.append(card);
    });
  } catch(err){console.warn('Ch\u2019ange : contenus en ligne indisponibles. La vitrine locale reste consultable.');}
})();
