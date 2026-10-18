'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'home-canvas.css'),'utf8');
const editorial=fs.readFileSync(path.join(root,'esthetique-first-visit.css'),'utf8');

function beautyMarkup(slug){
 const start=html.indexOf('id="page-'+slug+'"');
 assert.ok(start>=0,'Page manquante : '+slug);
 const end=html.indexOf('<section class="intro-bands',start);
 assert.ok(end>start,'Présentation manquante : '+slug);
 const scene=html.slice(start,end);
 const matched=scene.match(/<article class="dual-home__panel dual-home__panel--beauty"[^>]*>([\s\S]*?)<\/article>/);
 assert.ok(matched,'Bloc Esthétique manquant : '+slug);
 return matched[1];
}
test('La description Esthétique reste celle de l accueil malgré la nouvelle composition',()=>{
 const original=beautyMarkup('accueil');
 const dedicated=beautyMarkup('esthetique');
 const shared='Des soins sur mesure<br>pour révéler votre beauté<br>naturelle.';
 assert.ok(original.includes(shared));
 assert.ok(dedicated.includes(shared));
 assert.match(dedicated,/<h1>ESTHÉTIQUE<\/h1>/);
 assert.match(dedicated,/CH’ANGE · LE THOR/);
 assert.match(dedicated,/esthetique-hero-disciplines/);
 assert.match(dedicated,/VISAGE.*CORPS.*ÉPILATION.*BIEN-ÊTRE/);
});
test('Le bouton de l accueil mène à la page dédiée, qui mène aux tarifs',()=>{
 assert.match(html,/href="#esthetique">DÉCOUVRIR L’ESTHÉTIQUE/);
 assert.match(beautyMarkup('esthetique'),/href="#tarifs">DÉCOUVRIR LES TARIFS/);
});
test('Le cadre photographie reste identique sur desktop et mobile',()=>{
 assert.match(css,/:is\(#page-accueil,#page-esthetique\) \.dual-home__panel--beauty/);
 assert.match(css,/width:1536px!important/);
 assert.match(css,/height:1024px!important/);
 assert.match(editorial,/#page-esthetique/);
 assert.match(editorial,/@media\(max-width:760px\)/);
});
