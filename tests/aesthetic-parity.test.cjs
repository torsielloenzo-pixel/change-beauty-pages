'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'home-canvas.css'),'utf8');

function beautyMarkup(slug){
 const start=html.indexOf('id="page-'+slug+'"');
 assert.ok(start>=0,'Page manquante : '+slug);
 const end=html.indexOf('<section class="intro-bands',start);
 assert.ok(end>start,'Section de bas de page manquante : '+slug);
 const scene=html.slice(start,end);
 const matched=scene.match(/<article class="dual-home__panel dual-home__panel--beauty">([\s\S]*?)<\/article>/);
 assert.ok(matched,'Bloc CH\'ANGE visible manquant : '+slug);
 return matched[1].replace(/<a class="btn btn-dark"[\s\S]*?<\/a>/,'').replace(/\s+/g,' ').trim();
}
test('Le bloc CH’ANGE sur Esthétique est identique à celui de l accueil',()=>{
 const original=beautyMarkup('accueil');
 const dedicated=beautyMarkup('esthetique');
 assert.equal(dedicated,original);
 for(const item of ['CH’ANGE','ESTHÉTIQUE','Des soins sur mesure','pour révéler votre beauté','naturelle.']){
  assert.ok(dedicated.includes(item),item);
 }
});
test('La nouvelle page reste liée au bouton découvrir esthétique',()=>{
 assert.match(html,/href="#esthetique">DÉCOUVRIR L’ESTHÉTIQUE/);
 const section=html.slice(html.indexOf('id="page-esthetique"'),html.indexOf('id="page-coiffure"'));
 assert.match(section,/href="#tarifs">DÉCOUVRIR LES TARIFS/);
});
test('Le même emplacement visible est garanti sur desktop et mobile',()=>{
 assert.match(css,/Affichage garanti du bloc Esthétique/);
 assert.match(css,/:is\(#page-accueil,#page-esthetique\) \.dual-home__panel--beauty/);
 assert.match(css,/top:390px!important/);
 assert.match(css,/top:148px!important/);
 assert.match(css,/z-index:5!important/);
});
