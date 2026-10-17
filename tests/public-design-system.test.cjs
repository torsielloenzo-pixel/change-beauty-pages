'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'public-design-system.css'),'utf8');
const previous=fs.readFileSync(path.join(root,'home-editorial-polish.css'),'utf8');

test('all nine public pages receive one stylesheet loaded after homepage rules',()=>{
  const pages=['accueil','esthetique','coiffure','soins','tarifs','univers','galerie','cadeaux','contact'];
  for(const slug of pages)assert.match(html,new RegExp('id="page-'+slug+'" data-page="'+slug+'"'));
  assert.ok(html.indexOf('public-design-system.css?v=1')>html.indexOf('home-editorial-polish.css?v=2'));
  assert.match(css,/main > \.page/);
});
test('private professional frontend remains strictly outside of CSS and HTML changes',()=>{
  assert.doesNotMatch(css,/(?:pro\.institut-change\.fr|\/app\/|\.gestion-page|\.pro-app|\.staff)/);
  assert.match(html,/<link rel="stylesheet" href="\.\/public-design-system\.css\?v=1">/);
  assert.doesNotMatch(css,/\.dual-home\s*\{/);
  assert.match(css,/main > \.page > :not\(\.dual-home\) \.btn/);
});
test('interior page sections share CTA, typography, filters and responsive rules',()=>{
  for(const selector of ['.inner-intro','.price-heading','.price-chip','.chip','.category-card','.gallery-item',
     '.care-item','.universe-grid','.price-contact','.gift-hero','.gift-steps','.contact-grid','.faq','.action-panel','.footer']){
    assert.ok(css.includes(selector),'missing visual token: '+selector);
  }
  assert.match(css,/@media\(max-width:900px\)/);
  assert.match(css,/@media\(max-width:680px\)/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
  assert.match(css,/--public-ease/);
});
test('the photographed homepage and its existing buttons remain untouched',()=>{
  assert.match(previous,/#page-accueil \.dual-home__copy > \.btn/);
  assert.match(html,/href="#esthetique">DÉCOUVRIR L’ESTHÉTIQUE/);
  assert.match(html,/href="#coiffure">DÉCOUVRIR LA COIFFURE/);
  assert.match(html,/window\.CHANGE_HEADER_BRAND\?\.setUniverse\(active\)/);
});
