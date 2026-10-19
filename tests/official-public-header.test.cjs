'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const base=path.join(__dirname,'..');
const css=fs.readFileSync(path.join(base,'official-public-header.css'),'utf8');
const index=fs.readFileSync(path.join(base,'index.html'),'utf8');
const brand=fs.readFileSync(path.join(base,'header-brand.js'),'utf8');

test('La géométrie officielle CH’ANGE précède la navigation par univers',()=>{
 const link=/official-public-header\.css\?v=\d+/.exec(index);
 assert.ok(link,'nouvelle feuille non chargée');
 const tail=index.slice(index.lastIndexOf('<link rel="stylesheet"'),index.indexOf('</head>'));
 assert.match(tail,/universe-gateway\.css/);
 assert.ok(index.indexOf('universe-gateway.css')>index.indexOf('official-public-header.css'));
 assert.ok(index.indexOf('official-public-header.css')>index.indexOf('universe-photo-only.css'));
 assert.ok(index.indexOf('official-public-header.css')>index.indexOf('universe-identity.css'));
});
test('Le fond transparent de haut de page reste identique en défilement et pages intérieures',()=>{
 assert.match(css,/--change-official-header-background:linear-gradient\(/);
 assert.match(css,/\.change-stage-scrolled \.site-header/);
 assert.match(css,/\.change-page-header-active \.site-header/);
 assert.match(css,/body:not\(\.change-home-layout\) \.site-header/);
 assert.match(css,/position:fixed!important/);
 assert.match(css,/background:var\(--change-official-header-background\)!important/);
 assert.match(css,/height:var\(--change-official-header-height\)!important/);
 assert.match(css,/transform:none!important/);
 assert.match(css,/box-shadow:none!important/);
 assert.match(css,/\.preview-bar/);
});
test('Même marque, taille et menu sur toutes les pages, y compris mobile',()=>{
 assert.doesNotMatch(brand,/textContent\s*=\s*nextHair/);
 assert.doesNotMatch(brand,/coiffure:text/);
 assert.match(brand,/function setUniverse\(_slug\)/);
 assert.match(brand,/CH’ANGE, institut de beauté/);
 assert.match(css,/\.site-header > \.change-home-nav/);
 assert.match(css,/@media\(max-width:1250px\)/);
 assert.match(css,/@media\(max-width:680px\)/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
 assert.match(css,/\.mobile-menu\[hidden\]/);
});
