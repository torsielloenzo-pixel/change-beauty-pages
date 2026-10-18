'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const css=fs.readFileSync(path.join(__dirname,'../home-editorial-polish.css'),'utf8');
const previous=fs.readFileSync(path.join(__dirname,'../universe-identity.css'),'utf8');

test('new stylesheet is loaded last and original homepage CTAs remain functional',()=>{
  assert.ok(html.search(/home-editorial-polish\.css\?v=\d+/)>html.indexOf('universe-identity.css?v=2'));
  assert.match(html, /href="#esthetique">DÉCOUVRIR L’ESTHÉTIQUE/);
  assert.match(html, /href="#coiffure">DÉCOUVRIR LA COIFFURE/);
  assert.match(html, /id="change-hero-scroll"/);
  assert.match(html, /change-reserve-label/);
  assert.match(css, /\.change-reserve-label\{[\s\S]*?display:inline-block!important/);
  assert.match(html, /change-calendar-icon/);
  assert.match(html, /viewBox="0 0 24 24"/);
  assert.match(html, /class="change-mobile-reserve"/);
  assert.match(html, /class="mobile-toggle"/);
});
test('photo has light touch, ivory/chocolate CTA, scroll circle and frosted services',()=>{
 assert.match(css, /#page-accueil \.dual-home__copy > \.btn/);
 assert.match(css, /#page-accueil \.dual-home__panel--hair \.btn/);
 assert.match(css, /#page-accueil \.dual-home__center h2/);
 assert.match(css, /#page-accueil \.dual-home__services li\+li/);
 assert.match(css, /#page-accueil \.dual-home__scroll::before/);
 assert.match(css, /content:"↓"/);
 assert.match(css, /@media\(max-width:760px\)/);
 assert.match(css, /@media\(max-width:610px\)/);
 assert.match(css, /@media\(prefers-reduced-motion:reduce\)/);
});
test('small hollow labels and hidden giant brand titles stay enforced',()=>{
 assert.match(previous,/clip-path:inset\(50%\)/);
 assert.match(previous,/#page-accueil \.dual-home__label::before/);
 assert.match(previous,/content:none!important/);
 assert.match(css, /#page-accueil \.dual-home__label::after/);
 assert.match(css, /background:transparent!important;box-shadow:none!important/);
 assert.doesNotMatch(html, /href="https?:\/\/facebook\.com\//);
});

test('Les deux menus de la seule page Accueil sont déplacés vers le bas',()=>{
 const file=fs.readFileSync(path.join(__dirname,'../home-menu-position.css'),'utf8');
 assert.ok(html.indexOf('home-menu-position.css?v=2')>html.indexOf('universe-photo-only.css?v=1'));
 assert.match(file,/#page-accueil \.dual-home__panel--beauty/);
 assert.match(file,/#page-accueil \.dual-home__panel--hair/);
 assert.match(file,/top: 70% !important/);
 assert.match(file,/@media \(max-width:760px\)/);
 assert.doesNotMatch(file,/#page-esthetique|#page-coiffure/);
});
