'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'universe-detail-parity.css'),'utf8');

function pageBody(slug){
 const start=html.indexOf('id="page-'+slug+'"');
 assert.ok(start>=0,'missing page '+slug);
 const following=html.indexOf('<section class="page"',start+1);
 return html.slice(start,following===-1?html.length:following);
}
test('only Esthétique and Coiffure have their own restored editorial brand titles',()=>{
  assert.match(css,/:is\(#page-esthetique,#page-coiffure\) \.dual-home__copy > :is\(h1,h2\)/);
  assert.match(css,/clip:auto!important/);
  assert.match(css,/clip-path:none!important/);
  assert.match(css,/width:auto!important;height:auto!important/);
  assert.doesNotMatch(css,/#page-accueil \.dual-home__copy > :is\(h1,h2\)/);
  const beauty=pageBody('esthetique');
  const hair=pageBody('coiffure');
  assert.match(beauty,/<h1>CH’ANGE<\/h1>/);
  assert.match(beauty,/<div class="dual-home__label">ESTHÉTIQUE<\/div>/);
  assert.match(beauty,/Des soins sur mesure<br>pour révéler votre beauté<br>naturelle\./);
  assert.match(hair,/<h2>NAMAJE<\/h2>/);
  assert.match(hair,/<div class="dual-home__label">COIFFURE<\/div>/);
  assert.match(hair,/Des cheveux sublimés,<br>une signature unique\./);
});
test('both dedicated pages match Accueil badge and button metrics',()=>{
  assert.match(css,/font-size:clamp\(14px,1\.16vw,18px\)!important/);
  assert.match(css,/min-height:clamp\(35px,4\.5svh,44px\)!important/);
  assert.match(css,/border-radius:999px!important/);
  assert.match(css,/background:transparent!important/);
  assert.match(css,/content:none!important;display:none!important/);
  assert.match(css,/width:min\(100%,310px\)!important/);
  assert.match(css,/min-height:clamp\(44px,5\.6svh,56px\)!important/);
  assert.match(css,/font-family:var\(--display\)!important/);
  assert.match(css,/#page-coiffure \.dual-home__copy > h2/);
  assert.match(css,/#page-coiffure \.dual-home__copy > \.btn/);
});
test('responsive rules and stylesheet are scoped to public pages',()=>{
  assert.ok(html.indexOf('universe-detail-parity.css?v=1')>html.indexOf('public-design-system.css?v=1'));
  assert.match(css,/@media\(max-width:760px\)/);
  assert.match(css,/@media\(max-height:730px\) and \(min-width:761px\)/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
  assert.doesNotMatch(css,/(?:pro\.institut-change\.fr|\.pro-app|\.staff)/);
  assert.match(pageBody('esthetique'),/href="#tarifs">DÉCOUVRIR LES TARIFS/);
  assert.match(pageBody('coiffure'),/href="#tarifs">DÉCOUVRIR LES TARIFS/);
});
