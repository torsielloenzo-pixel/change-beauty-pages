(async()=>{'use strict';
const host=document.getElementById('price-catalog'),status=document.getElementById('price-status'),filters=document.getElementById('price-filter');if(!host)return;
const conf=window.CHANGE_SUPABASE;
const cats=['Drainage lymphatique','Regard & sourcils','Soins du visage','Beauté des pieds','Gommages corps'];
let records=[],selected='Tout';
const el=(type,className,value)=>{const x=document.createElement(type);if(className)x.className=className;if(value!==undefined)x.textContent=value;return x};
const euro=n=>(n/100).toLocaleString('fr-FR',{style:'currency',currency:'EUR'});
function draw(){
 host.replaceChildren();
 for(const cat of cats){if(selected!=='Tout'&&selected!==cat)continue;
 const data=records.filter(p=>p.category===cat);if(!data.length)continue;
 const sect=el('section','price-section');const top=el('div','price-section-head');
 top.append(el('h2','',cat),el('small','',data.length+' tarifs'));sect.append(top);
 for(const type of ['Séance','Cure']){const entries=data.filter(x=>x.offer_type===type);if(!entries.length)continue;
 if(cat==='Drainage lymphatique')sect.append(el('h3','price-subtitle',type==='Cure'?'Cures · 5 séances':'Séances individuelles'));
 for(const p of entries){
 const row=el('article','price-row'),title=el('div','price-info');
 title.append(el('strong','',p.title));
 if(p.description)title.append(el('p','',p.description));
 row.append(title,el('span','price-duration',p.duration_label||''),el('span','price-amount',euro(p.price_cents)));sect.append(row);
 }
 }
 host.append(sect);
 }status.textContent=host.children.length?'':'Aucun tarif publié dans cette catégorie.';
}
function drawFilters(){filters.replaceChildren();
 for(const c of ['Tout',...cats.filter(k=>records.some(p=>p.category===k))]){const b=el('button','price-chip',c);b.type='button';b.setAttribute('aria-pressed',String(c===selected));b.addEventListener('click',()=>{selected=c;drawFilters();draw()});filters.append(b)}
}
try{
 if(!conf?.url||!conf.publishableKey)throw Error('non configuré');
 const root=conf.url.replace(/\/$/,'');if(!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(root))throw Error('URL non reconnue');
 const res=await fetch(root+'/rest/v1/price_catalog?select=category,title,description,duration_label,price_cents,offer_type,display_order&is_published=eq.true&order=display_order.asc',{headers:{apikey:conf.publishableKey,Accept:'application/json'},cache:'no-store'});
 if(!res.ok)throw Error('HTTP '+res.status);
 const data=await res.json();if(!Array.isArray(data))throw Error('Réponse inattendue');
 records=data.filter(x=>cats.includes(x.category)&&['Séance','Cure'].includes(x.offer_type)&&Number.isInteger(x.price_cents)&&x.price_cents>=0);
 document.getElementById('price-total').textContent=records.length+' prestations et formules';
 if(!records.length){status.textContent='Notre carte des tarifs sera bientôt disponible.';return}
 drawFilters();draw();
}catch(e){status.textContent='La carte des tarifs est momentanément indisponible. Contactez directement l’institut.';console.warn('Ch’ange tarifs :',e.message)}
})();
