'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const editorial=fs.readFileSync(path.join(root,'esthetique-first-visit.css'),'utf8');
const photoOnly=fs.readFileSync(path.join(root,'universe-photo-only.css'),'utf8');
const scene=(slug)=>{
 const start=html.indexOf('id="page-'+slug+'"');
 assert.ok(start>0,'missing '+slug);
 const next=html.indexOf('data-cms-page="',start+1);
 return html.slice(start,next>start?next:html.length);
};
test('Une composition dédiée strictement à Esthétique, sans toucher aux autres pages',()=>{
 const official=html.indexOf('official-public-header.css');
 const dedicated=html.indexOf('esthetique-first-visit.css');
 const oldHide=html.indexOf('universe-photo-only.css');
 assert.ok(oldHide<dedicated && dedicated<official,
  'Le style Esthétique suit les anciennes règles de masquage, mais précède l’en-tête officiel');
 assert.match(photoOnly,/#page-esthetique,#page-coiffure/);
 assert.match(editorial,/\#page-esthetique \.dual-home__grid > \.dual-home__panel--beauty\{[\s\S]*?display:block!important/);
 assert.match(editorial,/\#page-esthetique \.dual-home__grid > \.esthetique-hero-scroll\{[\s\S]*?display:inline-flex!important/);
 assert.doesNotMatch(editorial,/#page-coiffure|#page-accueil/);
});
test('Le parcours de première visite est complet et ses actions fonctionnent',()=>{
 const esthetique=scene('esthetique');
 assert.match(esthetique,/<h1>ESTHÉTIQUE<\/h1>/);
 assert.match(esthetique,/>CH’ANGE · LE THOR<\/div>/);
 assert.match(esthetique,/Des soins sur mesure<br>pour révéler votre beauté<br>naturelle\./);
 assert.match(esthetique,/href="#tarifs">DÉCOUVRIR LES TARIFS/);
 assert.match(esthetique,/VISAGE[\s\S]*CORPS[\s\S]*ÉPILATION[\s\S]*BIEN-ÊTRE/);
 assert.match(esthetique,/data-hero-scroll/);
 assert.match(esthetique,/DÉCOUVREZ NOTRE UNIVERS/);
 assert.match(html,/\[data-hero-scroll\]/);
 assert.match(esthetique,/class="intro-bands container"/);
});
test('La page Coiffure demeure photographique sans élément éditorial ajouté',()=>{
 const coiffure=scene('coiffure');
 assert.match(coiffure,/<h2>NAMAJE<\/h2>/);
 assert.doesNotMatch(coiffure,/esthetique-hero-disciplines|esthetique-hero-scroll|CH’ANGE · LE THOR/);
});
test('La photographie garde son propre calque, sans modification du moteur du cadrage',()=>{
 const esthetique=scene('esthetique');
 assert.match(esthetique,/class="dual-home__grid"/);
 assert.doesNotMatch(editorial,/\.change-stage-photo\s*\{/);
 assert.doesNotMatch(editorial,/\.change-landing-stage\s*\{/);
 assert.match(editorial,/@media\(max-width:760px\)/);
 assert.match(editorial,/@media\(prefers-reduced-motion:reduce\)/);
 assert.match(editorial,/animation:change-esthetique-enter/);
});
