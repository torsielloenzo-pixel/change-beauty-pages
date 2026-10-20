'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const base=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(base,'index.html'),'utf8');
const gateway=fs.readFileSync(path.join(base,'universe-gateway.js'),'utf8');
test('NAMAJE emploie Maison de coiffure dans tous les points de contact publics',()=>{
 for(const [file,body] of [['index.html',html],['universe-gateway.js',gateway]]){
  assert.doesNotMatch(body,/institut de coiffure/i,file);
  assert.match(body,/maison de coiffure/i,file);
 }
 assert.match(html,/<p class="namaje-art__sub">MAISON DE COIFFURE<\/p>/);
 assert.match(gateway,/<small>MAISON DE COIFFURE<\/small>/);
 assert.match(gateway,/NAMAJE · MAISON DE COIFFURE/);
 assert.match(gateway,/NAMAJE · Maison de coiffure/);
 assert.match(html,/universe-gateway\.js\?v=\d+/);
});
