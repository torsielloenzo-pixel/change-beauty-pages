const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const css=fs.readFileSync(path.join(__dirname,'../first-screen-fluid.css'),'utf8');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');

test('fluid layout is loaded after the legacy canvas',()=>{
  const old=html.indexOf('home-canvas.css');
  const fresh=html.indexOf('first-screen-fluid.css');
  assert.ok(old!==-1&&fresh>old,'fluid overrides must load last');
});
test('three primary pages share viewport-fit hero without transformed text',()=>{
  assert.match(css,/#page-accueil,#page-esthetique,#page-coiffure/);
  assert.match(css,/height:100svh!important/);
  assert.match(css,/\.dual-home__grid\{[\s\S]*?transform:none!important/);
  assert.match(css,/\.site-header,[\s\S]*?transform:none!important/);
});
test('fluid breakpoints preserve legible mobile content and photo cropping controls',()=>{
  assert.match(css,/@media\(max-width:760px\)/);
  assert.match(css,/@media\(max-height:750px\) and \(min-width:761px\)/);
  assert.match(css,/--home-editor-font-size/);
  assert.match(css,/--stage-mobile-x|--stage-x/);
  assert.match(css,/\.esthetique-service-menu/);
  assert.match(css,/\.coiffure-service-menu/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});
