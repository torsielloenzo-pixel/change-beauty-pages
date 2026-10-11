/* Ch'ange - Professionnel. Interface ONLY; access control enforced by Supabase RLS.
   No mock accounts, no localStorage appointment database and no service_role key. */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const conf=window.CHANGE_SUPABASE||{};
const allowedViews=['dashboard','appointments','clients','services','site','modules','accounts','database'];
const adminViews=new Set(['site','modules','accounts','database']);
const labels={dashboard:'Vue d’ensemble',appointments:'Rendez-vous',clients:'Clientèle',services:'Prestations',site:'Site et pages',modules:'Modules & médias',accounts:'Comptes et accès',database:'Base de données'};
const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmtTime=s=>s?new Date(s).toLocaleString('fr-FR',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}):'—';
const fmtDate=s=>s?new Date(s).toLocaleDateString('fr-FR'):'—';
const dateLocal=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')};
const dateInput=s=>{if(!s)return '';const d=new Date(s),p=x=>String(x).padStart(2,'0');return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`};
const iconPill=(v)=>{const names={confirmed:'Confirmé',pending:'En attente',in_progress:'En cours',completed:'Terminé',cancelled:'Annulé',no_show:'Absent'};return `<span class="pill ${v==='confirmed'?'green':v==='cancelled'?'red':'grey'}">${safe(names[v]||v)}</span>`};
const configured=/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(conf.url||'') && /^(sb_publishable_|eyJ)/.test(conf.publishableKey||'');
let sb=null, user=null, profile=null, estId=null, currentView='dashboard', modalHandler=null;
let state={clients:[],services:[],appointments:[],profiles:[],pages:[],modules:[],staff:[],skills:[]};
const authStatus=m=>{$('login-status').textContent=m||''};
const notify=(m,isError=false)=>{const v=$('app-alert');v.hidden=false;v.textContent=m;v.style.background=isError?'#fff0e9':'#e8f3e8';v.style.borderColor=isError?'#e2c0b4':'#c1dec2'};
function showLogin(){user=null;profile=null;$('auth-view').hidden=false;$('app-view').hidden=true;$('login-form').hidden=false;$('password-form').hidden=true;}
function showPassword(){ $('auth-view').hidden=false;$('app-view').hidden=true;$('login-form').hidden=true;$('password-form').hidden=false;authStatus('Choisissez un nouveau mot de passe pour votre compte.');}
function requireAdmin(){if(profile?.role!=='administrateur')throw Error('Opération réservée aux administrateurs');}
const done=({error,data})=>{if(error)throw error;return data};
async function currentIdentity(){
  const {data:{user:u},error}=await sb.auth.getUser();
  if(error||!u)throw Error('Votre session a expiré. Connectez-vous à nouveau.');
  const {data:r,error:re}=await sb.from('user_roles').select('establishment_id,staff_id,role,is_enabled').eq('user_id',u.id).eq('is_enabled',true).maybeSingle();
  if(re||!r||!['owner','manager'].includes(r.role)||!r.staff_id)throw Error('Compte non autorisé ou désactivé.');
  const {data:s,error:se}=await sb.from('staff').select('display_name,is_active,establishment_id').eq('id',r.staff_id).eq('establishment_id',r.establishment_id).single();
  if(se||!s?.is_active)throw Error('Fiche professionnelle inactive ou introuvable.');
  const p={id:u.id,display_name:s.display_name,role:r.role==='owner'?'administrateur':'gerant',active:true,establishment_id:r.establishment_id};
  return {u,p};
}
async function boot(){
  if(!sb)return;
  try{
    const {u,p}=await currentIdentity();user=u;profile=p;
    const {data:e,error:ee}=await sb.from('establishments').select('id').eq('slug','change-beauty-dev').single();
    if(ee||!e)throw Error('Établissement Ch’ange introuvable.');estId=e.id;
    $('auth-view').hidden=true;$('app-view').hidden=false;
    document.querySelectorAll('.admin-only').forEach(el=>{el.hidden=p.role!=='administrateur'});
    $('account-chip').textContent=(p.display_name||u.email||'Compte')+' · '+(p.role==='administrateur'?'Administrateur':'Gérant');
    await navigate(currentView);
  }catch(e){showLogin();authStatus(e.message||'Connexion nécessaire.');}
}
async function navigate(view){
  if(!allowedViews.includes(view))view='dashboard';
  if(adminViews.has(view)&&profile?.role!=='administrateur')return notify('Page réservée aux administrateurs.',true);
  currentView=view;
  document.querySelectorAll('[data-panel]').forEach(el=>{el.hidden=el.dataset.panel!==view});
  document.querySelectorAll('[data-view].nav-item').forEach(el=>el.classList.toggle('is-active',el.dataset.view===view));
  $('view-breadcrumb').textContent=labels[view];$('app-alert').hidden=true;
  try{
    const id=await currentIdentity();user=id.u;profile=id.p;
    if(adminViews.has(view))requireAdmin();
    await ({dashboard:renderDashboard,appointments:renderAppointments,clients:renderClients,services:renderServices,site:renderSite,modules:renderModules,accounts:renderAccounts,database:renderDatabase}[view])();
  }catch(e){if(String(e.message||'').includes('autorisé')||String(e.message||'').includes('session')){showLogin();authStatus(e.message)}else notify(e.message||'Chargement impossible',true)}
}
async function fetchClients(){
 const data=done(await sb.from('customers').select('*').order('last_name').limit(1000));
 state.clients=data.map(c=>({...c,full_name:[c.first_name,c.last_name].filter(Boolean).join(' ')}));return state.clients;
}
async function fetchServices(){
 const data=done(await sb.from('services').select('*').order('name').limit(500));
 state.services=data.map(v=>({...v,duration_min:v.duration_minutes,price_eur:v.price_cents/100,published:v.is_publicly_bookable}));return state.services;
}
async function fetchStaff(){
 const [people,skills]=await Promise.all([sb.from('staff').select('id,display_name,is_active').eq('establishment_id',estId).order('display_name'),sb.from('staff_skills').select('staff_id,service_id')]);
 state.staff=done(people).filter(x=>x.is_active);state.skills=done(skills);return state.staff;
}
async function fetchAppointments(){
 const date=$('appointment-filter').value||dateLocal();const after=new Date(date+'T00:00:00');
 let query=sb.from('appointments').select('*').gte('starts_at',after.toISOString()).order('starts_at').limit(300);
 const status=$('appointment-status-filter').value;if(status)query=query.eq('status',status);
 const data=done(await query);
 state.appointments=data.map(a=>({...a,start_at:a.starts_at,end_at:a.ends_at,client_id:a.customer_id,service_label:a.service_name_snapshot,notes:a.internal_notes}));
 return state.appointments;
}
async function renderDashboard(){
 const now=new Date(),start=new Date(now.getFullYear(),now.getMonth(),now.getDate()),end=new Date(start);end.setDate(end.getDate()+1);
 const [day,future,clients,services]=await Promise.all([
  sb.from('appointments').select('id',{count:'exact',head:true}).gte('starts_at',start.toISOString()).lt('starts_at',end.toISOString()).neq('status','cancelled'),
  sb.from('appointments').select('starts_at,service_name_snapshot,status,customer_id').gte('starts_at',now.toISOString()).neq('status','cancelled').order('starts_at').limit(8),
  sb.from('customers').select('id',{count:'exact',head:true}),
  sb.from('services').select('id',{count:'exact',head:true})
 ]);for(const r of [day,future,clients,services])if(r.error)throw r.error;
 $('stats').innerHTML=[['Rendez-vous aujourd’hui',day.count],['Rendez-vous à venir',future.data?.length+' affichés'],['Fiches clients',clients.count],['Prestations',services.count]].map(([n,v])=>`<div class="metric"><small>${safe(n)}</small><strong>${safe(v??0)}</strong></div>`).join('');
 await fetchClients();const byId=new Map(state.clients.map(x=>[x.id,x.full_name]));
 $('upcoming-appointments').innerHTML=future.data?.length?future.data.map(a=>`<div class="appointment-line"><time>${safe(fmtTime(a.starts_at))}</time><div><strong>${safe(a.service_name_snapshot)}</strong><small>${safe(byId.get(a.customer_id)||'Client')}</small></div></div>`).join(''):'<p class="empty">Aucun rendez-vous à venir.</p>';
}
async function renderAppointments(){
 await Promise.all([fetchAppointments(),fetchClients(),fetchServices(),fetchStaff()]);
 const byId=new Map(state.clients.map(x=>[x.id,x.full_name]));const byStaff=new Map(state.staff.map(x=>[x.id,x.display_name]));
 $('appointments-table').innerHTML=state.appointments.length?state.appointments.map(a=>`<tr><td>${safe(fmtTime(a.start_at))}</td><td><strong>${safe(byId.get(a.client_id)||'Client')}</strong></td><td>${safe(a.service_label)}</td><td>${safe(byStaff.get(a.staff_id)||'Non attribué')}</td><td>${iconPill(a.status)}</td><td><button class="small-button" data-edit-appointment="${safe(a.id)}">Modifier</button></td></tr>`).join(''):'<tr><td colspan="6" class="empty">Aucun rendez-vous pour ces filtres.</td></tr>';
}
async function renderClients(){await fetchClients();filterClientList()}
function filterClientList(){
  const q=$('client-search').value.trim().toLocaleLowerCase('fr');
  const clients=state.clients.filter(x=>[x.full_name,x.phone,x.email].some(v=>String(v||'').toLocaleLowerCase('fr').includes(q)));
  $('clients-table').innerHTML=clients.length?clients.map(c=>`<tr><td><strong>${safe(c.full_name)}</strong></td><td>${safe(c.phone)}</td><td>${safe(c.email)}</td><td>${safe(fmtDate(c.created_at))}</td><td><button class="small-button" data-edit-client="${safe(c.id)}">Modifier</button></td></tr>`).join(''):'<tr><td class="empty" colspan="5">Aucun client trouvé.</td></tr>';
}
async function renderServices(){await fetchServices();$('services-table').innerHTML=state.services.length?state.services.map(s=>`<tr><td><strong>${safe(s.name)}</strong></td><td>${safe(s.category)}</td><td>${safe(s.duration_min)} min</td><td>${safe(Number(s.price_eur).toFixed(2)+' €')}</td><td>${s.published?'<span class="pill green">Publié</span>':'<span class="pill grey">Brouillon</span>'}</td><td><button class="small-button" data-edit-service="${safe(s.id)}">Modifier</button> <button class="small-button" data-skill-service="${safe(s.id)}">Qualifications</button></td></tr>`).join(''):'<tr><td class="empty" colspan="6">Aucune prestation enregistrée.</td></tr>'}
async function fetchPages(){requireAdmin();state.pages=done(await sb.from('site_pages').select('*').order('slug'));return state.pages}
async function renderSite(){await fetchPages();
  $('site-pages-list').innerHTML='<h2>Pages du site</h2>'+state.pages.map(p=>`<button class="page-choice" data-page-choice="${safe(p.slug)}"><strong>${safe(p.name)}</strong><small>${p.visible?'Publiée':'Masquée'}</small></button>`).join('');
  $('page-slug').innerHTML=state.pages.map(p=>`<option value="${safe(p.slug)}">${safe(p.name)}</option>`).join('');
  fillPageForm(state.pages[0]?.slug);
}
function fillPageForm(slug){const p=state.pages.find(x=>x.slug===slug);if(!p)return;const form=$('page-form');
  form.elements.slug.value=slug;form.elements.title.value=p.title;form.elements.description.value=p.description||'';form.elements.hero_image_url.value=p.hero_image_url||'';form.elements.visible.checked=p.visible;
  document.querySelectorAll('[data-page-choice]').forEach(x=>x.classList.toggle('selected',x.dataset.pageChoice===slug));
  $('page-preview').src='./index.html#'+encodeURIComponent(slug);
}
async function renderModules(){requireAdmin();await Promise.all([fetchPages(),fetchModules()]);
  $('module-page-filter').innerHTML='<option value="">Toutes les pages</option>'+state.pages.map(p=>`<option value="${safe(p.slug)}">${safe(p.name)}</option>`).join('');
  filterModules();
}
async function fetchModules(){state.modules=done(await sb.from('site_modules').select('*').order('page_slug').order('sort_order').limit(500));return state.modules}
function filterModules(){const slug=$('module-page-filter').value;const arr=state.modules.filter(x=>!slug||x.page_slug===slug);
  $('modules-list').innerHTML=arr.length?arr.map(m=>`<div class="module-line"><div><strong>${safe(m.title||'Section sans titre')}</strong><small>${safe(m.page_slug)} · ${safe(m.module_type)} · position ${safe(m.sort_order)} · ${m.published?'Publié':'Brouillon'}</small></div><button class="small-button" data-edit-module="${safe(m.id)}">Éditer</button></div>`).join(''):'<p class="empty">Aucun module enregistré pour cette page.</p>';
}
async function renderAccounts(){requireAdmin();const roles=done(await sb.from('user_roles').select('user_id,staff_id,role,is_enabled,created_at').eq('establishment_id',estId).order('created_at'));
  const staff=done(await sb.from('staff').select('id,display_name,is_active').eq('establishment_id',estId));
  const byId=new Map(staff.map(x=>[x.id,x]));
  state.profiles=roles.map(r=>{const s=byId.get(r.staff_id);return {id:r.user_id,display_name:s?.display_name||'Compte',role:r.role==='owner'?'administrateur':r.role==='manager'?'gerant':'inconnu',active:Boolean(r.is_enabled&&s?.is_active),created_at:r.created_at}});
  $('accounts-table').innerHTML=state.profiles.length?state.profiles.map(p=>`<tr><td><strong>${safe(p.display_name||'Compte')}</strong>${p.id===user.id?' <span class="pill">Vous</span>':''}</td><td>${safe(p.role==='administrateur'?'Administrateur':p.role==='gerant'?'Gérant':'En attente')}</td><td>${p.active?'<span class="pill green">Actif</span>':'<span class="pill red">Désactivé</span>'}</td><td><button class="small-button" data-edit-account="${safe(p.id)}">Modifier</button></td></tr>`).join(''):'<tr><td colspan="4">Aucun compte enregistré.</td></tr>';
}
async function renderDatabase(){requireAdmin();
  const tables=['appointments','customers','services','staff','user_roles','site_pages','site_modules'];
  const counts=await Promise.all(tables.map(table=>sb.from(table).select('*',{count:'exact',head:true})));
  counts.forEach((x,i)=>{if(x.error)throw Error(tables[i]+': '+x.error.message)});
  $('db-stats').innerHTML=counts.map((x,i)=>`<div class="metric"><small>${safe(tables[i])}</small><strong>${safe(x.count??0)}</strong></div>`).join('');
  const rows=done(await sb.from('audit_events').select('created_at,operation,table_name,record_id').order('created_at',{ascending:false}).limit(60));
  $('audit-table').innerHTML=rows.length?rows.map(r=>`<tr><td>${safe(fmtTime(r.created_at))}</td><td>${safe(r.operation)}</td><td>${safe(r.table_name)}</td><td>${safe(r.record_id)}</td></tr>`).join(''):'<tr><td colspan="4" class="empty">Aucune modification enregistrée.</td></tr>';
}
// Modal field definitions are fully trusted static metadata; data values are HTML-escaped.
function fieldHtml(f){let a=`name="${safe(f.name)}" id="f-${safe(f.name)}" ${f.required?'required':''}`;let value=f.value??'';
 if(f.type==='select')return `<label>${safe(f.label)}<select ${a}>${(f.options||[]).map(x=>`<option value="${safe(x[0])}" ${String(x[0])===String(value)?'selected':''}>${safe(x[1])}</option>`).join('')}</select></label>`;
 if(f.type==='textarea')return `<label>${safe(f.label)}<textarea ${a} rows="3">${safe(value)}</textarea></label>`;
 if(f.type==='checkbox')return `<label class="toggle-label"><input ${a} type="checkbox" ${value?'checked':''}> ${safe(f.label)}</label>`;
 if(f.type==='file')return `<label>${safe(f.label)}<input ${a} type="file" accept="image/jpeg,image/png,image/webp"></label>`;
 return `<label>${safe(f.label)}<input ${a} type="${safe(f.type||'text')}" value="${safe(value)}" ${f.min?'min="'+safe(f.min)+'"':''} ${f.max?'max="'+safe(f.max)+'"':''} ${f.step?'step="'+safe(f.step)+'"':''} ${f.placeholder?'placeholder="'+safe(f.placeholder)+'"':''}></label>`;
}
function modal(title,fields,onSubmit){$('dialog-title').textContent=title;$('dialog-fields').innerHTML=fields.map(fieldHtml).join('');$('dialog-error').textContent='';modalHandler=onSubmit;$('edit-dialog').showModal();}
const val=(f,name)=>f.elements.namedItem(name)?.value?.trim()||'';
const checked=(f,name)=>Boolean(f.elements.namedItem(name)?.checked);
const requireConfigured=()=>{if(!sb)throw Error('Base Supabase non configurée');};
async function formSave(table,data,id){requireConfigured();await currentIdentity();let q=id?sb.from(table).update(data).eq('id',id).select():sb.from(table).insert(data).select();return done(await q)}
function editClient(item){modal(item?'Modifier une fiche client':'Nouvelle fiche client',[
 {name:'first_name',label:'Prénom',required:true,value:item?.first_name},{name:'last_name',label:'Nom',value:item?.last_name},
 {name:'phone',label:'Téléphone',type:'tel',value:item?.phone},{name:'email',label:'E-mail',type:'email',value:item?.email}
],async f=>{
 const phone=val(f,'phone'),email=val(f,'email');if(!phone&&!email)throw Error('Téléphone ou e-mail nécessaire pour la fiche client.');
 await formSave('customers',{establishment_id:estId,first_name:val(f,'first_name'),last_name:val(f,'last_name')||null,phone:phone||null,email:email||null},item?.id);await renderClients();
});}
function editService(item){modal(item?'Modifier une prestation':'Nouvelle prestation',[
 {name:'name',label:'Nom de la prestation',required:true,value:item?.name},
 {name:'category',label:'Catégorie',required:true,value:item?.category||'Visage'},
 {name:'duration_min',label:'Durée (minutes)',type:'number',required:true,value:item?.duration_min||60,min:5,max:720},
 {name:'price_eur',label:'Tarif en euros (obligatoire)',type:'number',required:true,step:'0.01',min:0,value:item?.price_eur??''},
 {name:'description',label:'Description',type:'textarea',value:item?.description},
 {name:'published',label:'Afficher cette prestation sur le site',type:'checkbox',value:item?.published||false}
],async f=>{
 const cents=Math.round(Number(val(f,'price_eur'))*100);
 if(!Number.isFinite(cents)||cents<0||val(f,'price_eur')==='')throw Error('Indiquez le tarif réel validé de la prestation.');
 await formSave('services',{establishment_id:estId,name:val(f,'name'),category:val(f,'category'),duration_minutes:Number(val(f,'duration_min')),price_cents:cents,description:val(f,'description'),is_active:true,is_publicly_bookable:checked(f,'published')},item?.id);await renderServices();
});}
async function editSkill(item){
 if(state.staff.length===0)await fetchStaff();
 if(state.services.length===0)await fetchServices();
 if(!state.staff.length)return notify('Ajoutez d’abord un compte professionnel actif.',true);
 modal('Habiliter un membre à réaliser ce soin',[
 {name:'service_id',label:'Prestation',type:'select',value:item?.id||'',options:state.services.map(x=>[x.id,x.name])},
 {name:'staff_id',label:'Professionnel',type:'select',options:state.staff.map(x=>[x.id,x.display_name])}
 ],async f=>{
 const {error}=await sb.from('staff_skills').insert({establishment_id:estId,service_id:val(f,'service_id'),staff_id:val(f,'staff_id')});
 if(error)throw Error(error.code==='23505'?'Ce professionnel est déjà habilité pour ce soin.':error.message);await fetchStaff();
 });
}
function editAppointment(item){
 if(!state.clients.length)return notify('Ajoutez d’abord un client.',true);
 if(!state.services.length)return notify('Ajoutez d’abord une prestation.',true);
 const initial=item?.start_at?dateInput(item.start_at):dateInput(new Date(Date.now()+3600000));
 const available=state.staff.filter(s=>state.skills.some(k=>k.staff_id===s.id&&k.service_id===(item?.service_id||state.services[0].id)));
 modal(item?'Modifier un rendez-vous':'Nouveau rendez-vous',[
  {name:'client_id',label:'Client',type:'select',required:true,value:item?.client_id,options:state.clients.map(x=>[x.id,x.full_name])},
  {name:'service_id',label:'Prestation',type:'select',required:true,value:item?.service_id||state.services[0].id,options:state.services.map(x=>[x.id,x.name])},
  {name:'staff_id',label:'Professionnel habilité',type:'select',required:true,value:item?.staff_id||'',options:available.map(s=>[s.id,s.display_name])},
  {name:'start_at',label:'Date et heure',type:'datetime-local',required:true,value:initial},
  {name:'status',label:'Statut',type:'select',value:item?.status||'confirmed',options:[['pending','En attente'],['confirmed','Confirmé'],['in_progress','En cours'],['completed','Terminé'],['cancelled','Annulé'],['no_show','Absent']]},
  {name:'notes',label:'Notes internes protégées',type:'textarea',value:item?.notes||''}
 ],async f=>{
  const start=new Date(val(f,'start_at'));const selected=state.services.find(x=>x.id===val(f,'service_id'));
  const sid=val(f,'staff_id');if(!selected||!sid||!state.skills.some(x=>x.staff_id===sid&&x.service_id===selected.id))
   throw Error('Le professionnel doit être habilité à cette prestation (bouton Qualifications).');
  if(!Number.isFinite(start.getTime()))throw Error('Date du rendez-vous invalide.');
  const before=selected.preparation_minutes||0,after=selected.cleanup_minutes||0;
  const duration=selected.duration_minutes,end=new Date(start.getTime()+duration*60000);
  const data={establishment_id:estId,customer_id:val(f,'client_id'),service_id:selected.id,staff_id:sid,
   starts_at:start.toISOString(),ends_at:end.toISOString(),occupied_from:new Date(start.getTime()-before*60000).toISOString(),
   occupied_until:new Date(end.getTime()+after*60000).toISOString(),
   service_name_snapshot:selected.name,service_price_cents_snapshot:selected.price_cents,
   service_duration_minutes_snapshot:duration,status:val(f,'status'),internal_notes:val(f,'notes')};
  if(!item){data.created_by=user.id;data.booking_source='professional';}
  await formSave('appointments',data,item?.id);await renderAppointments();
 });
 const serviceInput=$('f-service_id');serviceInput.addEventListener('change',()=>{
  const availableStaff=state.staff.filter(s=>state.skills.some(k=>k.staff_id===s.id&&k.service_id===serviceInput.value));
  $('f-staff_id').innerHTML=availableStaff.map(x=>`<option value="${safe(x.id)}">${safe(x.display_name)}</option>`).join('');
 });
}
async function editModule(item){requireAdmin();if(state.pages.length===0)await fetchPages();
 modal(item?'Modifier un module':'Nouveau module',[
 {name:'page_slug',label:'Page cible',type:'select',value:item?.page_slug||$('module-page-filter').value||'accueil',options:state.pages.map(x=>[x.slug,x.name])},
 {name:'module_type',label:'Type de module',type:'select',value:item?.module_type||'texte',options:[['texte','Section texte'],['banniere','Bannière'],['photo','Photographie + texte']]},
 {name:'title',label:'Titre',value:item?.title},{name:'content',label:'Description',type:'textarea',value:item?.content},
 {name:'image_url',label:'URL image sécurisée (HTTPS)',type:'url',value:item?.image_url},{name:'media',label:'Ou importer une photo (JPG, PNG, WebP · 5 Mo max)',type:'file'},
 {name:'link_label',label:'Texte du lien',value:item?.link_label},{name:'link_url',label:'Adresse du lien',value:item?.link_url},
 {name:'sort_order',label:'Ordre',type:'number',value:item?.sort_order||0},{name:'published',label:'Publier le module',type:'checkbox',value:item?.published||false}
 ],async f=>{
  requireAdmin();let img=val(f,'image_url');const file=f.elements.namedItem('media')?.files?.[0];
  if(file){
    if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5242880)throw Error('Photo JPG, PNG ou WebP de 5 Mo maximum.');
    const ext=({'image/jpeg':'jpg','image/png':'png','image/webp':'webp'})[file.type];
    const path=`modules/${crypto.randomUUID()}.${ext}`;
    const {error}=await sb.storage.from('change-public-media').upload(path,file,{upsert:false,contentType:file.type,cacheControl:'3600'});
    if(error)throw error;
    img=sb.storage.from('change-public-media').getPublicUrl(path).data.publicUrl;
  }
  if(img&&!/^https:\/\//i.test(img))throw Error('L’image doit avoir une adresse HTTPS');
  const link=val(f,'link_url');if(link&&!/^(https:\/\/|mailto:|tel:)/i.test(link))throw Error('Le lien doit être HTTPS, mailto: ou tel:');
  await formSave('site_modules',{page_slug:val(f,'page_slug'),module_type:val(f,'module_type'),title:val(f,'title'),content:val(f,'content'),image_url:img,link_label:val(f,'link_label'),link_url:link,sort_order:Number(val(f,'sort_order')||0),published:checked(f,'published')},item?.id);
  await renderModules();
 });
}
function editAccount(item){requireAdmin();if(!item?.role)return notify('Ce compte attend son activation initiale.',true);
 modal('Modifier les accès',[
 {name:'role',label:'Rôle',type:'select',value:item.role,options:[['administrateur','Administrateur'],['gerant','Gérant']]},
 {name:'active',label:'Compte actif',type:'checkbox',value:item.active}
 ],async f=>{
  await staffRequest({action:'update',id:item.id,role:val(f,'role'),active:checked(f,'active')});await renderAccounts();
 });
}
function invite(){requireAdmin();modal('Inviter un membre',[
 {name:'display_name',label:'Nom d’affichage',required:true},
 {name:'email',label:'Adresse e-mail personnelle de connexion',type:'email',required:true},
 {name:'role',label:'Rôle attribué',type:'select',value:'gerant',options:[['gerant','Gérant'],['administrateur','Administrateur']]}
 ],async f=>{
  const response=await staffRequest({action:'invite',display_name:val(f,'display_name'),email:val(f,'email'),role:val(f,'role')});await renderAccounts();notify(response.message||'Invitation envoyée');
 });}
async function staffRequest(body){requireAdmin();await currentIdentity();const {data,error}=await sb.functions.invoke('manage-staff',{body});
 if(error)throw new Error(data?.message||error.message||'Opération impossible');return data||{};
}
async function submitModal(event){event.preventDefault();if(!modalHandler)return;const f=event.currentTarget;const btn=$('dialog-save');btn.disabled=true;$('dialog-error').textContent='';try{await modalHandler(f);$('edit-dialog').close();notify('Enregistrement effectué.')}catch(e){$('dialog-error').textContent=e.message||'Enregistrement impossible'}finally{btn.disabled=false}}
async function savePage(event){event.preventDefault();requireAdmin();await currentIdentity();const f=event.currentTarget;const slug=val(f,'slug');const image=val(f,'hero_image_url');if(image&&!/^https:\/\//i.test(image))return notify('L’image doit utiliser HTTPS.',true);
 try{done(await sb.from('site_pages').update({title:val(f,'title'),description:val(f,'description'),hero_image_url:image,visible:checked(f,'visible')}).eq('slug',slug).select());await renderSite();fillPageForm(slug);notify('Page enregistrée et publiée selon son état de visibilité.');}catch(e){notify(e.message||'Échec de mise à jour',true)}
}
function wire(){
 document.querySelectorAll('button[data-view]').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.view)));
 $('login-form').addEventListener('submit',async e=>{e.preventDefault();if(!sb)return authStatus('Base Ch’ange non configurée.');const b=$('login-button');b.disabled=true;authStatus('Vérification de vos accès…');try{
  const f=e.currentTarget;const {error}=await sb.auth.signInWithPassword({email:val(f,'email'),password:val(f,'password')});if(error)throw error;await boot();
 }catch(err){authStatus('Connexion impossible. Vérifiez vos identifiants et vos autorisations.')}finally{b.disabled=false}});
 $('forgot-button').addEventListener('click',async()=>{if(!sb)return;const email=val($('login-form'),'email');if(!email)return authStatus('Saisissez votre e-mail avant de demander un lien.');
  const {error}=await sb.auth.resetPasswordForEmail(email,{redirectTo:new URL('./gestion.html',location.href).href});
  authStatus(error?'Impossible d’envoyer le lien.':'Si cette adresse est autorisée, un e-mail de réinitialisation sera envoyé.');
 });
 $('password-form').addEventListener('submit',async e=>{e.preventDefault();const f=e.currentTarget,p=val(f,'new_password');if(p.length<12||p!==val(f,'confirm_password'))return authStatus('Les mots de passe doivent correspondre et contenir au moins 12 caractères.');
  const {error}=await sb.auth.updateUser({password:p});if(error)return authStatus(error.message);authStatus('Mot de passe modifié.');await boot();
 });
 $('logout').addEventListener('click',async()=>{if(sb)await sb.auth.signOut({scope:'global'});showLogin();authStatus('Vous êtes déconnecté.');});
 $('new-client').addEventListener('click',()=>editClient(null));$('new-service').addEventListener('click',()=>editService(null));
 $('new-appointment').addEventListener('click',()=>editAppointment(null));
 $('new-module').addEventListener('click',()=>editModule(null));
 $('new-invite').addEventListener('click',invite);
 $('appointment-filter').value=dateLocal();$('appointment-filter').addEventListener('change',renderAppointments);$('appointment-status-filter').addEventListener('change',renderAppointments);$('reload-appointments').addEventListener('click',renderAppointments);
 $('client-search').addEventListener('input',filterClientList);
 $('page-form').addEventListener('submit',savePage);$('page-slug').addEventListener('change',e=>fillPageForm(e.target.value));
 $('module-page-filter').addEventListener('change',filterModules);$('reload-modules').addEventListener('click',renderModules);$('reload-database').addEventListener('click',renderDatabase);
 $('edit-form').addEventListener('submit',submitModal);$('dialog-close').addEventListener('click',()=>$('edit-dialog').close());$('dialog-cancel').addEventListener('click',()=>$('edit-dialog').close());
 document.addEventListener('click',e=>{
  const btn=e.target.closest('button');if(!btn)return;
  if(btn.dataset.editClient)editClient(state.clients.find(x=>x.id===btn.dataset.editClient));
  if(btn.dataset.editService)editService(state.services.find(x=>x.id===btn.dataset.editService));
  if(btn.dataset.editAppointment)editAppointment(state.appointments.find(x=>x.id===btn.dataset.editAppointment));
  if(btn.dataset.editModule)editModule(state.modules.find(x=>x.id===btn.dataset.editModule));
  if(btn.dataset.editAccount)editAccount(state.profiles.find(x=>x.id===btn.dataset.editAccount));
  if(btn.dataset.skillService)editSkill(state.services.find(x=>x.id===btn.dataset.skillService));
  if(btn.dataset.pageChoice)fillPageForm(btn.dataset.pageChoice);
 });
 // Recheck active account on focus and before each sensitive action; RLS is always decisive.
 window.addEventListener('focus',async()=>{if(!profile||!sb)return;try{const {p}=await currentIdentity();profile=p;if(adminViews.has(currentView)&&p.role!=='administrateur')await navigate('dashboard')}catch{showLogin();authStatus('Votre accès professionnel doit être revérifié.');}});
}
wire();
if(!configured||!window.supabase?.createClient){$('setup-message').hidden=false;$('login-form').hidden=true;authStatus('Connexion professionnelle indisponible avant configuration de la base Ch’ange.');return}
sb=window.supabase.createClient(conf.url.replace(/\/$/,''),conf.publishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:'implicit'}});
sb.auth.onAuthStateChange((event)=>{if(event==='PASSWORD_RECOVERY'){queueMicrotask(showPassword)}else if(event==='SIGNED_OUT'){queueMicrotask(showLogin)}else if(event==='SIGNED_IN'&&user==null){queueMicrotask(boot)}});
sb.auth.getSession().then(({data})=>{if(data?.session)boot();else showLogin()}).catch(()=>showLogin());
})();
