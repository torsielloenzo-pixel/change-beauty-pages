'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const gateway=fs.readFileSync(path.join(root,'universe-gateway.js'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');

test('Les horaires NAMAJE Contact couvrent les sept jours',()=>{
 const expected=['Fermé',...Array(5).fill('10h00 — 18h00'),'Fermé'];
 for(let i=1;i<=7;i++){
   const key="'#page-contact .hours-list > div:nth-child("+i+") > strong'";
   const value=expected[i-1];
   assert.ok(gateway.includes(key+": '"+value+"'"),'NAMAJE : jour '+i);
 }
});
test('Les horaires CH’ANGE ne sont pas modifiés et se rétablissent au changement d’univers',()=>{
 const contact=html.slice(html.indexOf('id="page-contact"'),html.indexOf('</section>\n</main>'));
 assert.match(contact,/<span>Lundi<\/span><strong>9h00 — 19h00<\/strong>/);
 assert.match(contact,/<span>Mardi<\/span><strong>9h00 — 19h00<\/strong>/);
 assert.match(contact,/<span>Dimanche<\/span><strong>Fermé<\/strong>/);
 assert.match(gateway,/else if\(originals\.has\(selector\)\)el\.innerHTML=originals\.get\(selector\)/);
});
test('Le bandeau NAMAJE Coiffure correspond aux mêmes horaires, sans modification de structure',()=>{
 const coiffure=html.slice(html.indexOf('id="page-coiffure"'),html.indexOf('data-cms-page="tarifs"'));
 assert.match(coiffure,/namaje-art__bottom-value">Mar\. – sam\. : 10h00 – 18h00<br>Lun\. &amp; dim\. : fermé/);
 assert.match(html,/universe-gateway\.js\?v=5/);
 assert.match(coiffure,/namaje-art__bottom-cell--address/);
});
