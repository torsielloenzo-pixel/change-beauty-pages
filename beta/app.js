'use strict';
/*
 * Portrait-only reconstruction.
 * In untouched state, image assets/original-750x496.png is displayed without filters,
 * redrawn typography, or reinterpreted shapes. Editing overlays are intentionally
 * approximate because separate photographic and decorative source layers do not exist.
 */
const defaultConfig={
  brand:"CH'ANGE",leftTitle:"CH'ANGE",leftSub:"ESTHÉTIQUE",
  leftDescription:"Des soins sur mesure pour révéler votre beauté naturelle.",
  centerTitle:"Deux univers\nUne même vision",centerSub:"Beauté · Bien-être · Confiance",
  rightTitle:"NAMAJE",rightSub:"COIFFURE",rightDescription:"Des cheveux sublimés, une signature unique.",
  booking:"PRENDRE RENDEZ-VOUS",leftButton:"DÉCOUVRIR L'ESTHÉTIQUE",rightButton:"DÉCOUVRIR LA COIFFURE",
  links:{brand:'https://institut-change.fr/',booking:'#rendez-vous',leftButton:'#esthetique',rightButton:'#coiffure'},
  nav:[{label:'Accueil',url:'#accueil'},{label:'Esthétique',url:'#esthetique'},{label:'Coiffure',url:'#coiffure'},
       {label:'À propos',url:'#apropos'},{label:'Tarifs',url:'#tarifs'},{label:'Contact',url:'#contact'}],
  photos:{left:{data:null,filename:null,zoom:100,x:50,y:50},right:{data:null,filename:null,zoom:100,x:50,y:50}}
};
const clone = obj=>JSON.parse(JSON.stringify(obj));
// Configuration fournie pour la page Bêta.
const betaPreset={"brand":"CH'ANGE","leftTitle":"CH'ANGE","leftSub":"ESTHÉTIQUE","leftDescription":"Des soins sur mesure pour révéler votre beauté naturelle.","centerTitle":"Deux univers\nUne même vision","centerSub":"Beauté · Bien-être · Confiance","rightTitle":"NAMAJE","rightSub":"COIFFURE","rightDescription":"Des cheveux sublimés, une signature unique.","booking":"PRENDRE RENDEZ-VOUS","leftButton":"DÉCOUVRIR L'ESTHÉTIQUE","rightButton":"DÉCOUVRIR LA COIFFURE","links":{"brand":"https://institut-change.fr/","booking":"#rendez-vous","leftButton":"#esthetique","rightButton":"#coiffure"},"nav":[{"label":"Accueil","url":"#accueil"},{"label":"Esthétique","url":"#esthetique"},{"label":"Coiffure","url":"#coiffure"},{"label":"À propos","url":"#apropos"},{"label":"Tarifs","url":"#tarifs"},{"label":"Contact","url":"#contact"}],"photos":{"left":{"filename":"6c8a0acc-c49d-4ae1-b97e-1d93ab04e8e5.png"}}};
defaultConfig.photos.left.data='assets/photo-esthetique-config.png';
defaultConfig.photos.left.filename=betaPreset.photos.left.filename || 'Photo esthétique personnalisée';
for(const key of Object.keys(betaPreset)){
 if(key==='photos')continue;
 if(Object.hasOwn(defaultConfig,key))defaultConfig[key]=betaPreset[key];
}
let data=clone(defaultConfig);
const $=id=>document.getElementById(id);
const fields=[
 ['brand','Marque CH\'ANGE',29,11,148,46,'brand'],
 ['leftTitle','Titre esthétique',39,218,171,42,'serif'],
 ['leftSub','Sous-titre esthétique',40,263,166,19,'eyebrow'],
 ['leftDescription','Description esthétique',40,288,148,47,'text-block'],
 ['centerTitle','Titre central',302,255,169,57,'centerHeading'],
 ['centerSub','Sous-titre central',304,316,179,19,'centerSub'],
 ['rightTitle','Titre coiffure',550,217,171,44,'serif rightHeading'],
 ['rightSub','Sous-titre coiffure',558,260,160,21,'eyebrow light'],
 ['rightDescription','Description coiffure',574,286,151,46,'text-block light'],
 ['leftButton','Bouton esthétique',40,349,174,34,'pill leftButton'],
 ['rightButton','Bouton coiffure',537,350,171,33,'pill rightButton'],
 ['booking','Bouton rendez-vous',598,17,127,29,'pill booking']
];
const navRects=[[212,23,44,15],[261,23,51,15],[315,23,62,15],[378,23,55,15],[442,23,43,15],[494,23,58,15]];
const liveNodes=new Map();
const textSettings=$('textSettings');const navSettings=$('navSettings');
function createField(label,value,onChange,multiline=false){
 const element=document.createElement('label');element.className='field';
 const title=document.createElement('span');title.textContent=label;
 const input=document.createElement(multiline?'textarea':'input');
 if(multiline)input.rows=2;else input.type='text';
 input.value=value;input.addEventListener('input',()=>onChange(input.value));
 element.append(title,input);return {element,input};
}
function createLabel(id,rect,type){
 const node=document.createElement('span');node.className='live-label '+type;node.id='live-'+id;
 let [x,y,w,h]=rect;Object.assign(node.style,{left:x+'px',top:y+'px',width:w+'px',height:h+'px','--left':x+'px','--top':y+'px'});
 $('textOverlay').appendChild(node);liveNodes.set(id,node);
}
for(const [key,label,x,y,w,h,cls] of fields){
 createLabel(key,[x,y,w,h],cls);
 const {element,input}=createField(label,data[key],v=>{data[key]=v;syncOverlays() },key.endsWith('Description')||key==='centerTitle');
 input.dataset.key=key;if(['brand','leftTitle','rightTitle','centerTitle'].includes(key))element.dataset.font='italiana';textSettings.appendChild(element);
}
for(let i=0;i<6;i++){
 createLabel('nav'+i,navRects[i],'nav');
 const container=document.createElement('div');container.className='paired';
 const label=createField('Menu '+(i+1)+' · Texte',data.nav[i].label,v=>{data.nav[i].label=v;syncOverlays()});
 const link=createField('URL',data.nav[i].url,v=>{data.nav[i].url=v;syncLinks()});
 label.input.dataset.nav=i;label.input.dataset.prop='label';link.input.dataset.nav=i;link.input.dataset.prop='url';
 container.append(label.element,link.element);navSettings.appendChild(container);
}
for(const [key,label] of [['brand','Logo / Accueil'],['booking','Prendre rendez-vous'],['leftButton','Découvrir l’esthétique'],['rightButton','Découvrir la coiffure']]){
 const {element,input}=createField('Destination · '+label,data.links[key],v=>{data.links[key]=v;syncLinks()});
 input.dataset.link=key;navSettings.appendChild(element);
}
function fitText(id,node,value){
  node.style.fontSize='';
  node.style.whiteSpace='';
  if(!node.classList.contains('edited'))return;
  if(!['brand','leftTitle','rightTitle','centerTitle'].includes(id))return;
  const isBrand=id==='brand',center=id==='centerTitle';
  const target=isBrand?33:(center?24:42);
  const maxW=node.clientWidth-(center?8:2);
  const font=getComputedStyle(node).fontFamily;
  const lines=String(value).split('\n');
  const canvas=fitText.canvas||(fitText.canvas=document.createElement('canvas'));
  const ctx=canvas.getContext('2d');
  ctx.font=`${target}px ${font}`;
  const measured=Math.max(...lines.map(line=>ctx.measureText(line).width),1);
  const resulting=Math.max(12,Math.min(target,target*maxW/measured));
  node.style.fontSize=resulting.toFixed(2)+'px';
  node.style.whiteSpace=center?'pre-line':'nowrap';
}
function isChanged(id){if(id.startsWith('nav')){let i=Number(id.slice(3));return data.nav[i].label!==defaultConfig.nav[i].label;}return data[id]!==defaultConfig[id];}
function syncOverlays(){
 for(const [id,node] of liveNodes){
   let v=id.startsWith('nav')?data.nav[Number(id.slice(3))].label:data[id];
   let active=isChanged(id);
   // The coiffure photo replaces the full photographic surface, including the raster
   // title from the old image. Re-render the same text on a transparent foreground.
   if(data.photos.right.data && ['rightTitle','rightSub','rightDescription','rightButton'].includes(id))active=true;
   node.classList.toggle('edited',active);
   node.classList.toggle('over-new-photo', !!data.photos.right.data && ['rightTitle','rightSub','rightDescription','rightButton'].includes(id));
   if(id==='brand' && active){node.replaceChildren(document.createTextNode(v));const sub=document.createElement('small');sub.textContent='INSTITUT DE BEAUTÉ';node.appendChild(sub);}
   else node.textContent=v;
   fitText(id,node,v);
 }
 const edits=[...liveNodes.keys()].filter(isChanged).length;
 const photographs=(data.photos.left.data?1:0)+(data.photos.right.data?1:0);
 $('viewChip').textContent=(edits||photographs)?'Composition personnalisée':'Référence originale';
 $('modeStatus').textContent=(edits||photographs)?`${photographs} photo(s) remplacée(s) · ${edits} texte(s) modifié(s)`:'Affichage original, pixels inchangés';
}
function safeUrl(url){const v=String(url||'').trim();if(v.startsWith('#')||v.startsWith('/')&&!v.startsWith('//'))return v;if(/^https?:\/\//i.test(v))return v;return '#';}
function syncLinks(){
 $('interactiveAreas').querySelectorAll('[data-link]').forEach(node=>{
 const key=node.dataset.link;
 const i=key.startsWith('nav')?Number(key.slice(3)):-1;
 const url=i>=0?data.nav[i].url:data.links[key];
 node.href=safeUrl(url);
 if(i>=0){node.setAttribute('aria-label',data.nav[i].label);node.title=data.nav[i].label;}
 else node.title=key;
 });
}
function syncPhotos(){
 for(const side of ['left','right']){
   const p=data.photos[side],layer=$(side==='left'?'photoLeft':'photoRight');
   const image=$(side==='left'?'leftImg':'rightImg');
   layer.classList.toggle('active',!!p.data);
   if(p.data){
     if(image.getAttribute('src')!==p.data)image.src=p.data;
     image.style.objectPosition=`${p.x}% ${p.y}%`;
     image.style.transform=`scale(${p.zoom/100})`;
   } else {image.removeAttribute('src');}
   const status=$(side+'PhotoAck');
   if(status){status.classList.toggle('uploaded',!!p.data);status.textContent=p.data?`✓ Remplacement actif : ${p.filename||'image importée'}`:'Photo d’origine conservée';}
   for(const [prop,label] of [['Zoom','zoom'],['X','x'],['Y','y']]){
     const input=$(side+prop);input.value=p[label];$(side+prop+'Val').textContent=p[label]+' %';
   }
 }
 syncOverlays();
}
for(const side of ['left','right']){
 $(side+'Zoom').addEventListener('input',e=>{data.photos[side].zoom=+e.target.value;syncPhotos()});
 $(side+'X').addEventListener('input',e=>{data.photos[side].x=+e.target.value;syncPhotos()});
 $(side+'Y').addEventListener('input',e=>{data.photos[side].y=+e.target.value;syncPhotos()});
 $('photoUpload'+(side==='left'?'Left':'Right')).addEventListener('change',e=>{
   const file=e.target.files?.[0];if(!file)return;
   if(!file.type.startsWith('image/')){alert('Sélectionne une image valide.');return;}
   const reader=new FileReader();reader.onload=()=>{
     const test=new Image();test.onload=()=>{data.photos[side].data=String(reader.result);data.photos[side].filename=file.name;syncPhotos();};
     test.onerror=()=>alert('Cette image ne peut pas être lue.');test.src=String(reader.result);
   };reader.readAsDataURL(file);
 });
}
document.querySelectorAll('[data-remove]').forEach(button=>button.addEventListener('click',()=>{
 const side=button.dataset.remove;data.photos[side]=clone(defaultConfig.photos[side]);
 $('photoUpload'+(side==='left'?'Left':'Right')).value='';syncPhotos();
}));
function syncInputs(){
 for(const el of document.querySelectorAll('[data-key]'))el.value=data[el.dataset.key];
 for(const el of document.querySelectorAll('[data-nav]'))el.value=data.nav[Number(el.dataset.nav)][el.dataset.prop];
 for(const el of document.querySelectorAll('[data-link]')){if(el.tagName==='INPUT')el.value=data.links[el.dataset.link];}
}
function refresh(){syncInputs();syncPhotos();syncLinks()}
function reset(){data=clone(defaultConfig);for(const el of [$('photoUploadLeft'),$('photoUploadRight')])el.value='';refresh();}
$('resetBtn').addEventListener('click',()=>{if(confirm('Restaurer tous les réglages de la version originale ?'))reset();});
const workspace=document.querySelector('.workspace');
function togglePanel(visible){workspace.classList.toggle('panel-hidden',!visible);$('controlsBtn').setAttribute('aria-expanded',String(visible));$('controlsBtn').textContent=visible?'Réglages ⚙':'Afficher les réglages ⚙';requestAnimationFrame(fitStage)}
$('controlsBtn').addEventListener('click',()=>togglePanel(workspace.classList.contains('panel-hidden')));
$('hidePanel').addEventListener('click',()=>togglePanel(false));
$('showGuides').addEventListener('click',()=>{const n=$('guides');n.classList.toggle('visible');$('showGuides').textContent=n.classList.contains('visible')?'Masquer les guides':'Afficher les guides';});
$('compareBtn').addEventListener('click',()=>{
 const panel=$('comparePanel');panel.hidden=!panel.hidden;
 $('referenceOverlay').classList.toggle('visible',!panel.hidden);
 $('referenceOverlay').style.opacity=panel.hidden?'0':String(+$('compareRange').value/100);
 $('compareBtn').textContent=panel.hidden?'Comparer':'Fermer la comparaison';
});
$('compareRange').addEventListener('input',e=>{
 const pct=+e.target.value;
 $('referenceOverlay').style.opacity=String(pct/100);
 $('comparePct').textContent=pct+' %';
});
$('exportBtn').addEventListener('click',()=>{
 const blob=new Blob([JSON.stringify({format:'change-namaje-reference-v2',reference:{width:750,height:496},config:data},null,2)],{type:'application/json'});
 const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download='change-namaje-test-configuration.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),3000);
});
$('importInput').addEventListener('change',async e=>{
 try{
   const file=e.target.files?.[0];if(!file)return;
   const obj=JSON.parse(await file.text());
   const c=obj.config??obj;if(!c||typeof c!=='object'||!Array.isArray(c.nav)||c.nav.length!==6||!c.photos)throw new Error('Structure JSON invalide');
   const t=clone(defaultConfig);
   for(const k of fields.map(f=>f[0]))if(typeof c[k]==='string')t[k]=c[k].slice(0,1200);
   if(c.links&&typeof c.links==='object')for(const k of Object.keys(t.links))if(typeof c.links[k]==='string')t.links[k]=c.links[k];
   for(let i=0;i<6;i++)for(const p of ['label','url'])if(typeof c.nav[i]?.[p]==='string')t.nav[i][p]=c.nav[i][p].slice(0,400);
   for(const side of ['left','right']){
     let pp=c.photos?.[side]||{};
     if(typeof pp.data==='string' && /^data:image\/(?:png|jpeg|webp|avif);base64,/.test(pp.data))t.photos[side].data=pp.data;
     for(const p of ['zoom','x','y'])if(Number.isFinite(+pp[p]))t.photos[side][p]=Math.max(p==='zoom'?90:0,Math.min(p==='zoom'?220:100,+pp[p]));
     if(typeof pp.filename==='string')t.photos[side].filename=pp.filename;
   }
   data=t;refresh();
 }catch(err){alert('Import impossible : '+err.message)}finally{e.target.value='';}
});
function fitStage(){
 const wrap=$('stageWrap');const avail=Math.min(750,wrap.parentElement.clientWidth);
 const scale=avail/750;
 wrap.style.width=avail+'px';wrap.style.height=496*scale+'px';
 $('stage').style.transform=`scale(${scale})`;
}
window.addEventListener('resize',fitStage);
if('ResizeObserver' in window)new ResizeObserver(fitStage).observe(document.querySelector('.canvas-surround'));
refresh();fitStage();
if(document.fonts?.ready)document.fonts.ready.then(syncOverlays).catch(()=>{});
