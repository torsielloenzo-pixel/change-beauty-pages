/* Ch'ange • Visibilité & résultats • aucune donnée de démonstration */
(()=>{'use strict';
 const $=id=>document.getElementById(id);
 const metrics={
  sc_clicks:['Clics sur les résultats Google','Search Console'],
  sc_impressions:['Impressions dans Google','Search Console'],
  bp_website_clicks:['Clics vers le site depuis Google','Fiche établissement'],
  bp_call_clicks:['Clics sur Appeler','Fiche établissement'],
  bp_direction_requests:['Demandes d’itinéraire','Fiche établissement'],
  site_appointment_intent:['Clics Prendre rendez-vous','Site Ch’ange'],
  site_email_click:['Clics sur l’e-mail','Site Ch’ange'],
  site_phone_click:['Clics sur le téléphone','Site Ch’ange'],
  site_directions_click:['Clics sur l’itinéraire','Site Ch’ange'],
  appointments_created:['Rendez-vous enregistrés','Agenda Supabase']
 };
 let client=null, establishment=null, me=null, datasets=null;
 const fr=new Intl.NumberFormat('fr-FR');
 const monthKey=d=>d.slice(0,7);
 const monthNames=i=>new Date(Date.UTC(i.year,i.month-1,1)).toLocaleDateString('fr-FR',{month:'short',year:'2-digit'});
 const monthsBack=n=>{const now=new Date();return Array.from({length:n},(_,idx)=>{const dt=new Date(Date.UTC(now.getFullYear(),now.getMonth()-(n-1-idx),1));return {year:dt.getUTCFullYear(),month:dt.getUTCMonth()+1,key:dt.toISOString().slice(0,7)}})};
 const text=(tag,value,className)=>{const e=document.createElement(tag);if(className)e.className=className;e.textContent=value;return e};
 const formatCount=(v,exists)=>exists?fr.format(v):'—';
 const dateOf=d=>d.toISOString().slice(0,10);
 function seriesFor(key,months){
  const entries=datasets?.external||[],clicks=datasets?.site||[],appointments=datasets?.appointments||[];
  let data=[],sourceHasData=false;
  if(key==='appointments_created'){
   sourceHasData=true;
   data=months.map(m=>appointments.filter(x=>(x.created_at||'').slice(0,7)===m.key).length);
  }else if(key.startsWith('site_')){
   const kind=key.slice(5);sourceHasData=clicks.some(x=>x.event_kind===kind);
   data=months.map(m=>clicks.filter(x=>x.event_kind===kind&&monthKey(x.event_date)===m.key).reduce((a,x)=>a+Number(x.event_count||0),0));
  }else{
   const prefix=key.startsWith('sc_')?'search_console':'business_profile';
   const metric=key.slice(prefix==='search_console'?3:3);
   sourceHasData=entries.some(x=>x.source===prefix&&x.metric===metric);
   data=months.map(m=>entries.filter(x=>x.source===prefix&&x.metric===metric&&monthKey(x.metric_date)===m.key).reduce((a,x)=>a+Number(x.metric_value||0),0));
  }
  return {data,sourceHasData};
 }
 const svgNS='http://www.w3.org/2000/svg';
 function shape(tag,attrs={},content=null){
  const node=document.createElementNS(svgNS,tag);
  for(const [k,v] of Object.entries(attrs))node.setAttribute(k,String(v));
  if(content!==null)node.textContent=content;return node;
 }
 function drawChart(){
  if(!datasets)return;
  const key=$('an-metric').value;
  const months=monthsBack(Number($('an-period').value));
  const {data,sourceHasData}=seriesFor(key,months);
  $('an-chart-heading').textContent=metrics[key][0];
  $('an-chart-source').textContent=metrics[key][1];
  const area=$('an-chart-area');area.replaceChildren();
  if(!sourceHasData){
   area.append(text('p',key.startsWith('site_')?'Aucune interaction comptabilisée pour le moment. Le suivi débute maintenant.':'Aucun relevé pour cette source. Importez un export CSV pour afficher une évolution réelle.','an-empty'));
   $('an-chart-note').textContent='Aucune série fictive n’est affichée.';return;
  }
  const W=880,H=285,left=55,right=18,top=24,bottom=51;
  const graphW=W-left-right, graphH=H-top-bottom;
  const max=Math.max(1,...data),axisMax=max<=4?4:Math.ceil(max/4)*4;
  const x=i=>left+i*graphW/Math.max(1,data.length-1);
  const y=value=>top+graphH-(value/axisMax)*graphH;
  const svg=shape('svg',{viewBox:'0 0 880 285',role:'img','aria-label':'Évolution mensuelle : '+metrics[key][0]});
  const defs=shape('defs');const grad=shape('linearGradient',{id:'ch-analytics-fade',x1:0,y1:0,x2:0,y2:1});
  grad.append(shape('stop',{offset:'0%','stop-color':'#c39b8e','stop-opacity':'.24'}),shape('stop',{offset:'100%','stop-color':'#c39b8e','stop-opacity':'0'}));
  defs.append(grad);svg.append(defs);
  for(let i=0;i<=4;i++){
   const value=axisMax*i/4,pos=y(value);
   svg.append(shape('line',{x1:left,y1:pos,x2:W-right,y2:pos,stroke:'#e9ded7','stroke-width':1}));
   svg.append(shape('text',{x:left-11,y:pos+4,'text-anchor':'end',fill:'#947d71','font-family':'sans-serif','font-size':11},fr.format(Math.round(value))));
  }
  for(let i=0;i<months.length;i++){
   const show=months.length<=6||i%2===0||i===months.length-1;
   if(show)svg.append(shape('text',{x:x(i),y:H-22,'text-anchor':'middle',fill:'#937d73','font-family':'sans-serif','font-size':11},monthNames(months[i])));
  }
  const coords=data.map((v,i)=>[x(i),y(v)]);
  const points=coords.map(p=>p.join(',')).join(' ');
  const polygon=[[x(0),top+graphH],...coords,[x(data.length-1),top+graphH]].map(p=>p.join(',')).join(' ');
  svg.append(shape('polygon',{points:polygon,fill:'url(#ch-analytics-fade)'}));
  svg.append(shape('polyline',{points,fill:'none',stroke:'#ad8379','stroke-width':3,'stroke-linejoin':'round','stroke-linecap':'round'}));
  coords.forEach(([cx,cy],i)=>{
    const circle=shape('circle',{cx,cy,r:4.3,fill:'#ab786d',stroke:'#fffefa','stroke-width':2});
    circle.append(shape('title',{},monthNames(months[i])+' : '+fr.format(data[i])));
    svg.append(circle);
  });
  area.append(svg);
  $('an-chart-note').textContent=key.startsWith('sc_')||key.startsWith('bp_')?
    'Source : relevés importés. Pas de connexion Google automatique active.' :
    key==='appointments_created'?'Source : rendez-vous enregistrés dans la base Ch’ange, selon leur date de création.':
    'Source : clics enregistrés sur le site, sans identifiant visiteur. Ces clics ne sont pas des contacts aboutis.';
 }
 function renderStats(){
  const months=monthsBack(Number($('an-period').value)),from=months[0].key;
  const ex=datasets.external.filter(r=>monthKey(r.metric_date)>=from);
  const site=datasets.site.filter(r=>monthKey(r.event_date)>=from);
  const ap=datasets.appointments.filter(a=>(a.created_at||'').slice(0,7)>=from);
  const sc=ex.filter(x=>x.source==='search_console'),bp=ex.filter(x=>x.source==='business_profile');
  const metric=(r,m)=>r.filter(x=>x.metric===m).reduce((n,x)=>n+Number(x.metric_value||0),0);
  const interactions=site.reduce((n,x)=>n+Number(x.event_count||0),0);
  const sourceCards=[
   ['Clics depuis Google Search',formatCount(metric(sc,'clicks'),sc.length>0),sc.length?'Relevés importés':'Source non connectée'],
   ['Impressions Google',formatCount(metric(sc,'impressions'),sc.length>0),sc.length?'Relevés importés':'Source non connectée'],
   ['Interactions fiche Google',formatCount(bp.reduce((n,x)=>n+Number(x.metric_value||0),0),bp.length>0),bp.length?'Appeler + itinéraires + site':'Source non connectée'],
   ['Clics de contact sur le site',formatCount(interactions,site.length>0),site.length?'Clics, pas conversions':'Suivi sans donnée pour le moment'],
   ['Rendez-vous enregistrés',fr.format(ap.length),'Source : agenda professionnel'],
   ['Rendez-vous créés via le site',fr.format(ap.filter(a=>a.booking_source==='public').length),'Réservation publique non activée']
  ];
  $('an-stats').replaceChildren();
  sourceCards.forEach(([name,count,note])=>{const card=document.createElement('article');card.className='an-kpi';card.append(text('span',name),text('strong',count),text('small',note));$('an-stats').append(card)});
  $('an-sc-status').textContent=sc.length?'Relevés importés • '+new Set(sc.map(x=>x.metric_date)).size+' jours disponibles':'Non connecté • aucun relevé importé';
  $('an-bp-status').textContent=bp.length?'Relevés importés • '+new Set(bp.map(x=>x.metric_date)).size+' jours disponibles':'Non connecté • aucun relevé importé';
  $('an-site-status').textContent='Comptage de clics actif • '+fr.format(interactions)+' clics sur la période. '+fr.format(ap.length)+' rendez-vous enregistrés.';
  const list=$('an-queries');list.replaceChildren();
  const all=datasets.queries.filter(x=>monthKey(x.report_month)>=from);
  const map=new Map();
  all.forEach(q=>{const prev=map.get(q.query_text)||{clicks:0,impressions:0};prev.clicks+=Number(q.clicks);prev.impressions+=Number(q.impressions);map.set(q.query_text,prev)});
  const ranked=[...map.entries()].sort((a,b)=>b[1].clicks-a[1].clicks).slice(0,10);
  if(!ranked.length){list.append(text('p','Aucune requête importée. Le rapport des recherches Google s’affichera ici.','an-placeholder'));return}
  ranked.forEach(([name,v])=>{const line=document.createElement('div');line.className='an-query';const item=text('span',name);item.append(text('small','Recherche Google'));line.append(item,text('strong',fr.format(v.clicks)+' clics'),text('strong',fr.format(v.impressions)+' vues'));list.append(line)});
 }
 async function load(){
  if(!client||!establishment||!me||!['administrateur','gerant'].includes(me.role))throw Error('Accès professionnel non autorisé.');
  const start=monthsBack(12)[0].key+'-01';
  const results=await Promise.all([
    client.from('analytics_external_daily').select('metric_date,source,metric,metric_value').eq('establishment_id',establishment).gte('metric_date',start).order('metric_date').limit(2500),
    client.from('analytics_search_queries').select('report_month,query_text,clicks,impressions').eq('establishment_id',establishment).gte('report_month',start).limit(2000),
    client.from('analytics_site_daily').select('event_date,event_kind,event_count').eq('establishment_id',establishment).gte('event_date',start).limit(2500),
    client.from('appointments').select('created_at,booking_source').eq('establishment_id',establishment).gte('created_at',start+'T00:00:00Z').limit(2000)
  ]);
  for(const item of results)if(item.error)throw item.error;
  datasets={external:results[0].data||[],queries:results[1].data||[],site:results[2].data||[],appointments:results[3].data||[]};
  renderStats();drawChart();
 }
 async function render(sb,est,identity){
   if(!sb||!est||!identity||!['administrateur','gerant'].includes(identity.role))throw Error('Accès réservé à l’administration et à la gérance.');
   client=sb;establishment=est;me=identity;
   $('an-chart-area').replaceChildren(text('p','Chargement des données réelles…','an-empty'));
   await load();
 }
 function parseCSV(source){
  const normalized=source.replace(/^\uFEFF/,'');
  const header=normalized.split(/\r?\n/,1)[0]||'';
  const separator=[';',',','\t'].sort((a,b)=>header.split(b).length-header.split(a).length)[0];
  const records=[];let row=[],cell='',quoted=false;
  for(let i=0;i<normalized.length;i++){
    const c=normalized[i];
    if(c==='"'){if(quoted&&normalized[i+1]==='"'){cell+='"';i++}else quoted=!quoted}
    else if(c===separator&&!quoted){row.push(cell.trim());cell=''}
    else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&normalized[i+1]==='\n')i++;row.push(cell.trim());cell='';if(row.some(Boolean))records.push(row);row=[]}
    else cell+=c;
  }
  if(quoted)throw Error('CSV incorrect : guillemet non fermé.');
  row.push(cell.trim());if(row.some(Boolean))records.push(row);
  if(records.length<2)throw Error('Le CSV doit contenir un en-tête et au moins une ligne de données.');
  const headers=records.shift().map(v=>v.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,''));
  return records.map(row=>Object.fromEntries(headers.map((head,i)=>[head,row[i]||''])));
 }
 const column=(row,...alternatives)=>{for(const key of alternatives){if(row[key]!==undefined)return row[key]}return undefined};
 function isoDate(val){
  const v=String(val||'').trim();
  let year,month,day;
  if(/^\d{4}-\d{2}-\d{2}$/.test(v)){[year,month,day]=v.split('-').map(Number)}
  else if(/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(v)){[day,month,year]=v.split('/').map(Number)}
  else return null;
  const d=new Date(Date.UTC(year,month-1,day));
  if(d.getUTCFullYear()!==year||d.getUTCMonth()!==month-1||d.getUTCDate()!==day)return null;
  return dateOf(d);
 }
 function count(v){
  const s=String(v??'').trim().replace(/[\s\u202f\u00a0]/g,'');
  const n=Number(s.replace(/(?<=\d),(?=\d{3}(?:,|$))/g,''));
  if(!s||!Number.isSafeInteger(n)||n<0||n>1000000000)throw Error('Valeur de compteur invalide : '+String(v).slice(0,30));
  return n;
 }
 async function upsert(table,records,onConflict){
  for(let i=0;i<records.length;i+=150){
    const {error}=await client.from(table).upsert(records.slice(i,i+150),{onConflict});
    if(error)throw error;
  }
 }
 async function importFile(){
  if(!client||!establishment||!me||!['administrateur','gerant'].includes(me.role))throw Error('Accès refusé.');
  const file=$('an-import-file').files[0];if(!file)throw Error('Sélectionnez un fichier CSV.');
  if(file.size>1024*1024)throw Error('Fichier trop volumineux (maximum 1 Mo).');
  const type=$('an-import-type').value;
  const rows=parseCSV(await file.text());
  if(rows.length>1000)throw Error('Un import est limité à 1 000 lignes.');
  if(type==='queries'){
    const month=$('an-report-month').value;
    if(!/^\d{4}-\d{2}$/.test(month))throw Error('Choisissez d’abord le mois couvert par cet export.');
    const out=new Map();
    for(const r of rows){
      const query=column(r,'topqueries','query','queries','requetes','recherches');
      if(!query||!String(query).trim()||String(query).length>240)throw Error('Colonne requête absente ou incorrecte.');
      out.set(String(query).trim(),{establishment_id:establishment,report_month:month+'-01',query_text:String(query).trim(),clicks:count(column(r,'clicks','clics')),impressions:count(column(r,'impressions'))});
    }
    await upsert('analytics_search_queries',[...out.values()],'establishment_id,report_month,query_text');
    return 'Requêtes importées : '+out.size+' pour '+month+'.';
  }
  const accepted=type==='search_console'?
   [['clicks',['clicks','clics']],['impressions',['impressions']]]:
   [['call_clicks',['callclicks','calls','appels','clicsappeler']],
    ['direction_requests',['directionrequests','directions','itineraires','demandesditineraire']],
    ['website_clicks',['websiteclicks','clicssite','clicsverslesite','siteweb']]];
  const unique=new Map();
  for(const row of rows){
    const date=isoDate(column(row,'date','jour'));
    if(!date)throw Error('Date CSV incorrecte. Format attendu : AAAA-MM-JJ.');
    let validMetrics=0;
    for(const [metric,aliases] of accepted){
      const raw=column(row,...aliases);
      if(raw===undefined||String(raw).trim()==='')continue;
      validMetrics++;
      const value={establishment_id:establishment,metric_date:date,source:type,metric,metric_value:count(raw),imported_at:new Date().toISOString()};
      unique.set(date+'|'+metric,value);
    }
    if(!validMetrics)throw Error('Colonnes de mesures manquantes pour la source choisie. Consultez le modèle CSV.');
  }
  await upsert('analytics_external_daily',[...unique.values()],'establishment_id,metric_date,source,metric');
  return 'Mesures importées : '+unique.size+' points journaliers. Source : '+(type==='search_console'?'Search Console':'Fiche Google')+'.';
 }
 function template(){
  const type=$('an-import-type').value;
  const first=type==='search_console'?'Date,Clicks,Impressions\n':type==='business_profile'?'Date,Call clicks,Direction requests,Website clicks\n':'Top queries,Clicks,Impressions\n';
  const blob=new Blob(['\uFEFF'+first],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download='modele-'+type+'-change.csv';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
 }
 let initialized=false;
 function init(){
  if(initialized)return;initialized=true;
  $('an-period').addEventListener('change',()=>{if(datasets){renderStats();drawChart()}});
  $('an-metric').addEventListener('change',drawChart);
  $('an-refresh').addEventListener('click',async()=>{try{await load()}catch(e){$('an-chart-note').textContent=e.message}});
  $('an-import-type').addEventListener('change',()=>{$('an-report-month-wrap').hidden=$('an-import-type').value!=='queries'});
  $('an-template').addEventListener('click',template);
  $('an-report-month').value=new Date().toISOString().slice(0,7);
  $('an-import-form').addEventListener('submit',async e=>{
    e.preventDefault();const btn=$('an-import-submit');btn.disabled=true;
    $('an-import-status').textContent='Import en cours…';
    try{const message=await importFile();await load();$('an-import-status').textContent=message;$('an-import-file').value=''}
    catch(err){$('an-import-status').textContent='Import non effectué : '+err.message}
    finally{btn.disabled=false}
  });
 }
 init();
 window.CHANGE_ANALYTICS={render};
})();
