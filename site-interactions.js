/* Ch’ange: événements de contact anonymes, sans cookies ni identifiant de visiteur. */
(()=>{'use strict';
const conf=window.CHANGE_SUPABASE||{};
if(!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(conf.url||'')||!conf.publishableKey)return;
const url=conf.url.replace(/\/$/,'')+'/rest/v1/rpc/change_record_site_interaction';
let lastKind='',lastAt=0;
document.addEventListener('click',event=>{
const a=event.target.closest('a[href]');if(!a)return;
const href=a.getAttribute('href')||'';let kind='';
if(a.classList.contains('nav-reserve'))kind='appointment_intent';
else if(/^mailto:/i.test(href))kind='email_click';
else if(/^tel:/i.test(href))kind='phone_click';
else if(/^https:\/\/www\.google\.com\/maps\//i.test(href))kind='directions_click';
if(!kind)return;
const now=Date.now();if(kind===lastKind&&now-lastAt<650)return;
lastKind=kind;lastAt=now;
fetch(url,{method:'POST',mode:'cors',keepalive:true,headers:{apikey:conf.publishableKey,'Content-Type':'application/json'},body:JSON.stringify({p_kind:kind})}).catch(()=>{});
},{capture:true});
})();
