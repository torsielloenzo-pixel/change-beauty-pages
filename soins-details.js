/* Ch’ange – renseignements sur les soins sur place, prix publiés synchronisés avec Supabase. */
(()=>{
'use strict';
const dialog=document.getElementById('care-detail-dialog');
const zone=document.getElementById('care-cards');
if(!dialog||!zone)return;
const title=document.getElementById('care-dialog-title');
const intro=document.getElementById('care-dialog-description');
const status=document.getElementById('care-dialog-status');
const content=document.getElementById('care-dialog-list');
const contact=document.getElementById('care-dialog-contact');
const conf=window.CHANGE_SUPABASE||{};
const make=(tag,cls,txt)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(txt!==undefined)x.textContent=txt;return x};
const euro=value=>(Number(value)/100).toLocaleString('fr-FR',{style:'currency',currency:'EUR'});
const order=(a,b)=>a.price_cents-b.price_cents||(a.display_order??0)-(b.display_order??0)||(a.title||'').localeCompare(b.title||'','fr');
const valid=record=>record&&typeof record.title==='string'&&Number.isInteger(record.price_cents)&&record.price_cents>=0;
let request=null,seq=0;
function getPublishedTariffs(){
 if(request)return request;
 if(!conf.url||!conf.publishableKey||!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(conf.url))return Promise.reject(Error('Configuration indisponible'));
 const endpoint=conf.url.replace(/\/$/,'')+'/rest/v1/price_catalog?select=title,category,description,duration_label,price_cents,offer_type,display_order&is_published=eq.true';
 request=fetch(endpoint,{headers:{apikey:conf.publishableKey,Accept:'application/json'},cache:'no-store'})
  .then(r=>{if(!r.ok)throw Error('Catalogue indisponible');return r.json()})
  .then(rows=>{if(!Array.isArray(rows))throw Error('Format de données invalide');return rows.filter(valid)})
  .catch(error=>{request=null;throw error});
 return request;
}
const staticSpecs={
 visage:{title:'Soin du visage',description:'Découvrez les soins du visage, leurs durées et leurs tarifs. Choisissez la formule qui correspond à vos envies.',choose:p=>p.category==='Soins du visage',note:null},
 massage:{title:'Massage & modelage',description:'Retrouvez les formules publiées qui comprennent un modelage du corps.',choose:p=>/massage|modelage/i.test(p.title),note:'La grille actuelle ne précise pas de tarif distinct pour un massage seul. Pour une séance de massage, demandez directement les possibilités à l’institut.'},
 corps:{title:'Rituels du corps',description:'Découvrez les rituels corporels disponibles, dont les gommages et les drainages.',choose:p=>p.category==='Gommages corps'||(p.category==='Drainage lymphatique'&&(!/visage/i.test(p.title)||/corps/i.test(p.title))),note:null},
 lifting:{title:'Lifting colombien',description:'Pour connaître le déroulement de cette prestation, ses modalités et les précautions éventuelles, contactez directement l’institut.',choose:p=>/lifting colombien/i.test(p.title),note:'Aucun tarif actuellement publié pour cette prestation dans la carte Ch’ange. Nous ne présentons pas de prix non confirmé.'}
};
function priceRow(p){
 const row=make('article','care-dialog-row'),name=make('div','');
 name.append(make('strong','',p.title));
 if(p.description)name.append(make('p','',p.description));
 row.append(name,make('span','care-duration',p.duration_label||'Durée à préciser'),make('span','care-price',euro(p.price_cents)));
 return row;
}
function draw(records,groupLabels){
 content.replaceChildren();
 if(!records.length){status.textContent='Tarif non communiqué pour ce soin. Contactez l’institut pour obtenir des renseignements et un devis précis.';return}
 status.textContent='';
 const groupNames=groupLabels?['Gommages corps','Drainage lymphatique']:['Prestations et tarifs'];
 for(const groupName of groupNames){
  const groupRows=(groupLabels?records.filter(p=>p.category===groupName):records).sort(order);
  if(!groupRows.length)continue;
  const g=make('section','care-dialog-group');
  g.append(make('h3','',groupName));
  if(groupName==='Drainage lymphatique')g.append(make('small','', 'Séances et cures'));
  for(const row of groupRows)g.append(priceRow(row));
  content.append(g);
 }
}
function showNote(text){if(text)content.append(make('p','care-dialog-note',text))}
async function openInfo(btn){
 const token=++seq;
 const key=btn.dataset.careDetail;
 const spec=staticSpecs[key];
 const isDynamic=key==='dynamic';
 if(!spec&&!isDynamic)return;
 const heading=isDynamic?btn.dataset.serviceName||'Prestation':spec.title;
 title.textContent=heading;
 intro.textContent=isDynamic?(btn.dataset.serviceDescription||'Informations sur cette prestation.'):spec.description;
 contact.href='mailto:change.institut@outlook.com?subject='+encodeURIComponent('Renseignements et rendez-vous – '+heading);
 content.replaceChildren();
 status.textContent='Recherche des informations et des tarifs…';
 if(!dialog.open)dialog.showModal();
 if(isDynamic){
  const cents=Number(btn.dataset.servicePrice);
  if(btn.dataset.servicePrice!==''&&Number.isInteger(cents)&&cents>=0){
   draw([{title:heading,description:btn.dataset.serviceDescription||'',duration_label:btn.dataset.serviceDuration?btn.dataset.serviceDuration+' min':'',price_cents:cents}].map(x=>({...x,offer_type:'Séance'})),false);
  } else {status.textContent='Tarif sur demande pour cette prestation.'}
  return;
 }
 try{
  const prices=await getPublishedTariffs();
  if(token!==seq||!dialog.open)return;
  const selected=prices.filter(spec.choose);
  draw(selected,key==='corps');
  showNote(spec.note);
 }catch(error){
  if(token!==seq||!dialog.open)return;
  content.replaceChildren();
  status.textContent='Impossible de charger les tarifs pour le moment. Vous pouvez contacter directement Ch’ange pour obtenir les informations.';
 }
}
zone.addEventListener('click',event=>{
 const button=event.target.closest('button[data-care-detail]');
 if(!button||!zone.contains(button))return;
 openInfo(button);
});
const close=()=>{seq++;dialog.close()};
document.getElementById('care-dialog-close').addEventListener('click',close);
document.getElementById('care-dialog-done').addEventListener('click',close);
dialog.addEventListener('close',()=>{seq++});
dialog.addEventListener('click',e=>{if(e.target===dialog)close()});
})();
