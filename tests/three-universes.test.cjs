'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'home-canvas.css'),'utf8');
const engine=fs.readFileSync(path.join(root,'design-public.js'),'utf8');
const dynamic=fs.readFileSync(path.join(root,'site-dynamic.js'),'utf8');
const canvas=fs.readFileSync(path.join(root,'home-canvas.js'),'utf8');
const stylesheet=fs.readFileSync(path.join(root,'home-reference.css'),'utf8');

test('Trois pages distinctes avec URL, hero et introduction sous la photo',()=>{
 for(const slug of ['accueil','esthetique','coiffure']){
   const start=html.indexOf('data-cms-page="'+slug+'" id="page-'+slug+'"');
   assert.ok(start>0,'page manquante : '+slug);
   const end=html.indexOf('</section>\n\n  <section class="page"',start);
   const content=html.slice(start,end>start?end:start+5500);
   assert.match(content,/class="dual-home"/);
   assert.match(content,/class="dual-home__grid"/);
   assert.match(content,/class="intro-bands container"/);
   assert.ok(content.indexOf('class="intro-bands container"')>content.indexOf('class="dual-home__grid"'));
   assert.match(content,new RegExp('id="cms-modules-'+slug+'"'));
 }
});
test('Les liens de l accueil ouvrent les véritables vues, leurs boutons ouvrent les tarifs',()=>{
 assert.match(html,/href="#esthetique">DÉCOUVRIR L’ESTHÉTIQUE/);
 assert.match(html,/href="#coiffure">DÉCOUVRIR LA COIFFURE/);
 for(const slug of ['esthetique','coiffure']){
   const content=html.slice(html.indexOf('data-cms-page="'+slug+'"'),html.indexOf('data-cms-page="'+slug+'"')+3400);
   assert.match(content,/href="#tarifs">DÉCOUVRIR LES TARIFS/);
 }
 assert.match(html,/\['accueil','esthetique','coiffure'\]\.includes\(active\)/);
});
test('Chaque image et ses quatre calques peuvent être chargés séparément',()=>{
 assert.match(engine,/sceneSlugs=new Set\(\['accueil','esthetique','coiffure'\]\)/);
 assert.match(engine,/stages\.set\(slug,scene\)/);
 assert.match(engine,/renderScene\(page\)/);
 assert.match(engine,/\.change-landing-stage,\.change-page-design-canvas/);
 assert.match(dynamic,/\['accueil','esthetique','coiffure'\]\.includes\(slug\)/);
 assert.match(canvas,/for\(const hero of scenes\)/);
});
test('Les deux nouvelles pages gardent le même gabarit et le même en-tête',()=>{
 for(const slug of ['esthetique','coiffure']){
   assert.ok(css.includes('#page-'+slug));
   assert.ok(stylesheet.includes('#page-'+slug));
 }
 assert.match(css,/grid-template-rows:103px 47px 120px 62px!important/);
 assert.match(html,/href="#esthetique" data-nav="esthetique"/);
 assert.match(html,/href="#coiffure" data-nav="coiffure"/);
});
test('Les deux pages figurent dans les messages d aperçu sécurisé',()=>{
 assert.match(engine,/\['accueil','esthetique','coiffure','soins'/);
 assert.match(engine,/payload\.slug/);
});
