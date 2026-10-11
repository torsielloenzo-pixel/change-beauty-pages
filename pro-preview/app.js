(() => {
'use strict';
const root='/change-beauty-pages/pro-preview/';

// Préférence portrait réservée à l'application installée, pas à Safari ni au site vitrine.
// iOS peut ignorer screen.orientation.lock : ne pas simuler une rotation ou masquer l'UI.
function requestInstalledPortrait() {
  const installed=window.matchMedia?.('(display-mode: standalone)').matches ||
    window.navigator.standalone===true;
  if (!installed || typeof screen.orientation?.lock!=='function') return;
  try {
    const result=screen.orientation.lock('portrait-primary');
    if (result && typeof result.catch==='function') result.catch(()=>{});
  } catch (_) { /* Orientation non modifiable dans ce navigateur. */ }
}
requestInstalledPortrait();
window.addEventListener('pageshow',requestInstalledPortrait);
document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState==='visible')requestInstalledPortrait();
});

const $=id=>document.getElementById(id);
const tabs=[['home','⌂','Accueil'],['agenda','▦','Agenda'],['clients','♡','Clientes'],['services','✳','Soins'],['profile','◯','Profil']];
const titles={home:"Vue d'ensemble",agenda:"Agenda",clients:"Clientèle",services:"Prestations",profile:"Mon profil"};
const statusLabel={confirmed:'Confirmé',pending:'En attente',in_progress:'En cours',completed:'Terminé',cancelled:'Annulé',no_show:'Absent'};
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const plainName=c=>c?[c.first_name,c.last_name].filter(Boolean).join(' '):'Cliente';
const formatTime=s=>new Date(s).toLocaleTimeString('fr-FR',{timeZone:'Europe/Paris',hour:'2-digit',minute:'2-digit'});
const formatDate=s=>{const[y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d,12).toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'})};
const formatDateTime=s=>new Date(s).toLocaleString('fr-FR',{timeZone:'Europe/Paris',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
const dateLocal=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')};
const moveDate=(value,n)=>{const [y,m,d]=value.split('-').map(Number),next=new Date(y,m-1,d+n,12);return [next.getFullYear(),String(next.getMonth()+1).padStart(2,'0'),String(next.getDate()).padStart(2,'0')].join('-')};
const dateISO=x=>{const [y,m,d]=x.split('-').map(Number);return new Date(y,m-1,d).toISOString()};
const blank=msg=>'<div class="empty">'+esc(msg)+'</div>';
const state={demo:false,member:null,tab:'home',date:dateLocal(),clientQuery:'',customers:[],services:[],staff:[],appointments:[],upcoming:[],countCustomers:0,countServices:0};
const demoSamples={customers:[{id:'d1',first_name:'Camille',last_name:'(exemple)',phone:'',email:''},{id:'d2',first_name:'Julie',last_name:'(exemple)',phone:'',email:''},{id:'d3',first_name:'Sarah',last_name:'(exemple)',phone:'',email:''}],services:[{id:'s1',category:'Visage',name:'Soin du visage (exemple)',duration_minutes:60,price_cents:0,is_active:true},{id:'s2',category:'Corps',name:'Soin relaxant (exemple)',duration_minutes:45,price_cents:0,is_active:true},{id:'s3',category:'Regard',name:'Beauté du regard (exemple)',duration_minutes:30,price_cents:0,is_active:true}]};
let sb=null;
function makeDemoData(){
 const now=new Date(),start=new Date(now);start.setHours(10,0,0,0);
 const list=[
 {id:'a1',starts_at:start.toISOString(),ends_at:new Date(start.getTime()+3600000).toISOString(),customer_id:'d1',staff_id:'m1',status:'confirmed',service_name_snapshot:'Soin du visage (exemple)'},
 {id:'a2',starts_at:new Date(start.getTime()+10800000).toISOString(),ends_at:new Date(start.getTime()+13500000).toISOString(),customer_id:'d2',staff_id:'m1',status:'pending',service_name_snapshot:'Soin relaxant (exemple)'},
 ];
 state.customers=demoSamples.customers;
 state.services=demoSamples.services;
 state.staff=[{id:'m1',display_name:'Professionnelle (exemple)'}];
 state.appointments=state.date===dateLocal()?list:[];
 state.upcoming=list;
 state.countCustomers=3;state.countServices=3;
}
function showError(msg){const el=$('status');el.hidden=!msg;el.textContent=msg||''}
function showAuth(){ $('workspace').hidden=true;$('auth-page').hidden=false;state.member=null;state.demo=false;document.title='Ch’ange Pro · Connexion' }
function showApp(){
 $('auth-page').hidden=true;$('workspace').hidden=false;
 const name=state.demo?'Ch’ange Pro':state.member.displayName;
 $('avatar-initial').textContent=name.charAt(0).toUpperCase();
 $('preview-banner').hidden=!state.demo;
 $('profile-avatar').textContent=name.charAt(0).toUpperCase();
 $('profile-name').textContent=name;
 $('profile-role').textContent=state.demo?'Aperçu visuel':state.member.role==='owner'?'Administrateur':'Gérant';
 $('profile-email').textContent=state.demo?'Aucune donnée réelle':state.member.email;
 $('exit-button').textContent=state.demo?"Quitter l'aperçu":'Se déconnecter';
 $('hello-text').textContent=state.demo?"Votre organisation quotidienne, en un regard.":'Bienvenue dans votre espace professionnel.';
 updateNav();
 void load();
}
function updateNav(){
 for(const key of ['desktop-tabs','mobile-tabs']){
  $(key).innerHTML=tabs.map(([id,icon,label])=>'<button class="nav-item '+(state.tab===id?'active':'')+'" data-tab="'+id+'" type="button" aria-label="'+esc(label)+'" aria-current="'+(state.tab===id?'page':'false')+'"><span class="ico">'+icon+'</span><span class="lab">'+label+'</span></button>').join('');
 }
 for(const [id] of tabs) $('view-'+id).hidden=id!==state.tab;
 $('header-section').textContent=titles[state.tab];
 document.title=titles[state.tab]+' · Ch’ange Pro';
}
function metric(label,value){return '<div class="metric"><small>'+esc(label)+'</small><strong>'+esc(value)+'</strong></div>'}
function renderAppointment(item,withDate=false){
 const customer=state.customers.find(c=>c.id===item.customer_id);
 const staff=state.staff.find(s=>s.id===item.staff_id);
 const detail=esc(plainName(customer))+(staff?' · '+esc(staff.display_name):'');
 return '<div class="card"><div class="card-time">'+esc(withDate?formatDateTime(item.starts_at):formatTime(item.starts_at))+'</div><div class="card-main"><strong>'+esc(item.service_name_snapshot)+'</strong><small>'+detail+'</small></div><span class="pill">'+esc(statusLabel[item.status]||item.status)+'</span></div>'
}
function draw(){
 $('selected-date').textContent=formatDate(state.date);
 const active=state.appointments.filter(a=>a.status!=='cancelled');
 $('metrics').innerHTML=metric('Rendez-vous du jour',state.tab==='home'?active.length:state.appointments.length)+metric('Fiches clientes',state.countCustomers)+metric('Prestations',state.countServices);
 $('upcoming').innerHTML=state.upcoming.length?state.upcoming.map(a=>renderAppointment(a,true)).join(''):blank('Aucun rendez-vous à venir.');
 $('appointment-count').textContent=state.appointments.length+' rendez-vous';
 $('appointments').innerHTML=state.appointments.length?state.appointments.map(a=>renderAppointment(a)).join(''):blank('Aucun rendez-vous pour cette journée.');
 $('client-caption').textContent=state.countCustomers+' fiches clientes · '+state.customers.length+' chargées';
 const q=state.clientQuery.toLocaleLowerCase('fr-FR');
 const list=state.customers.filter(c=>[c.first_name,c.last_name,c.phone,c.email].some(v=>String(v||'').toLocaleLowerCase('fr-FR').includes(q)));
 $('client-list').innerHTML=list.length?list.map(c=>'<div class="card"><div class="card-main"><strong>'+esc(plainName(c))+'</strong><small>'+esc(c.phone||'')+'</small><small>'+esc(c.email||'')+'</small></div><span class="pill">Fiche cliente</span></div>').join(''):blank('Aucune cliente trouvée.');
 $('service-list').innerHTML=state.services.length?state.services.map(s=>'<div class="card"><div class="card-main"><span class="eyebrow">'+esc(s.category)+'</span><strong>'+esc(s.name)+'</strong><small>'+esc(s.duration_minutes)+' minutes'+(state.demo?'':' · '+Number(s.price_cents/100).toLocaleString('fr-FR',{style:'currency',currency:'EUR'}))+'</small></div><span class="pill">'+(s.is_active?'Actif':'Inactif')+'</span></div>').join(''):blank('Aucune prestation trouvée.');
}
async function memberAccess(){
 if(!sb)throw Error('Service de connexion temporairement indisponible.');
 const {data:{user},error:e}=await sb.auth.getUser();
 if(e||!user)throw Error('Veuillez vous connecter.');
 const {data:role,error:re}=await sb.from('user_roles').select('establishment_id,staff_id,role,is_enabled').eq('user_id',user.id).eq('is_enabled',true).maybeSingle();
 if(re||!role||!['owner','manager'].includes(role.role)||!role.staff_id)throw Error('Compte professionnel non autorisé ou désactivé.');
 const {data:staff,error:se}=await sb.from('staff').select('display_name,is_active,establishment_id').eq('id',role.staff_id).eq('establishment_id',role.establishment_id).single();
 if(se||!staff?.is_active)throw Error('Compte professionnel désactivé.');
 return {id:user.id,email:user.email||'',role:role.role,establishmentId:role.establishment_id,displayName:staff.display_name};
}
async function load(){
 showError('');
 if(state.demo){makeDemoData();draw();return}
 if(!state.member)return;
 try{
  const m=await memberAccess();
  if(m.id!==state.member.id)throw Error('Session modifiée.');
  const e=m.establishmentId;
  const q=[
   sb.from('appointments').select('id,starts_at,ends_at,customer_id,staff_id,status,service_name_snapshot').eq('establishment_id',e).gte('starts_at',dateISO(state.date)).lt('starts_at',dateISO(moveDate(state.date,1))).order('starts_at').limit(150),
   sb.from('customers').select('id,first_name,last_name,phone,email').eq('establishment_id',e).order('last_name').limit(500),
   sb.from('services').select('id,category,name,duration_minutes,price_cents,is_active').eq('establishment_id',e).order('name').limit(500),
   sb.from('staff').select('id,display_name').eq('establishment_id',e).eq('is_active',true).limit(100),
   sb.from('appointments').select('id,starts_at,ends_at,customer_id,staff_id,status,service_name_snapshot').eq('establishment_id',e).gte('starts_at',new Date().toISOString()).neq('status','cancelled').order('starts_at').limit(8),
   sb.from('customers').select('id',{head:true,count:'exact'}).eq('establishment_id',e),
   sb.from('services').select('id',{head:true,count:'exact'}).eq('establishment_id',e)
  ];
  const res=await Promise.all(q);
  for(const r of res)if(r.error)throw r.error;
  [state.appointments,state.customers,state.services,state.staff,state.upcoming]=res.slice(0,5).map(r=>r.data||[]);
  state.countCustomers=res[5].count||0;state.countServices=res[6].count||0;
  draw();
 }catch(e){showError(e.message||'Chargement impossible.');if(/non autorisé|désactivé|session|connecter/i.test(e.message||'')){state.customers=[];state.appointments=[];state.upcoming=[];state.services=[];draw();showAuth();$('login-message').textContent=e.message||'Accès refusé';}}
}
function selectTab(tab){if(!tabs.some(([id])=>id===tab))return;state.tab=tab;updateNav();if(tab==='home')state.date=dateLocal();void load()}
document.addEventListener('click',e=>{
 const tab=e.target.closest('[data-tab]');
 if(tab){selectTab(tab.dataset.tab);return}
});
$('demo-btn').addEventListener('click',()=>{state.demo=true;state.member=null;state.tab='home';state.date=dateLocal();showApp()});
$('client-filter').addEventListener('input',e=>{state.clientQuery=e.target.value;draw()});
$('previous-day').addEventListener('click',()=>{state.date=moveDate(state.date,-1);void load()});
$('next-day').addEventListener('click',()=>{state.date=moveDate(state.date,1);void load()});
$('current-day').addEventListener('click',()=>{state.date=dateLocal();void load()});
$('exit-button').addEventListener('click',async()=>{if(!state.demo&&sb)await sb.auth.signOut();showAuth()});
$('signin-form').addEventListener('submit',async e=>{
 e.preventDefault();
 const btn=$('signin'),message=$('login-message');
 btn.disabled=true;message.textContent='';
 try{
  if(!sb)throw Error('Service de connexion indisponible. Réessayez plus tard.');
  const {error}=await sb.auth.signInWithPassword({email:$('email').value.trim(),password:$('password').value});
  if(error)throw error;
  $('password').value='';
  state.member=await memberAccess();state.demo=false;state.tab='home';state.date=dateLocal();showApp();
 }catch(err){message.textContent=err.message||'Connexion impossible.'}
 finally{btn.disabled=false}
});
(async()=>{
 const c=window.CHANGE_SUPABASE||{};
 try{if(window.supabase&&c.url&&c.publishableKey)sb=window.supabase.createClient(c.url,c.publishableKey,{auth:{autoRefreshToken:true,persistSession:true,detectSessionInUrl:false}})}catch{}
 if(sb)try{const {data:{session}}=await sb.auth.getSession();if(session){state.member=await memberAccess();state.demo=false;showApp();return}}catch{}
 showAuth();
})();
if('serviceWorker' in navigator && location.protocol==='https:'){
 window.addEventListener('load',()=>navigator.serviceWorker.register(root+'sw.js',{scope:root}).catch(()=>{}));
}
})();