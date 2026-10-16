'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const css=fs.readFileSync(path.join(root,'scene-superposition.css'),'utf8');
const shared=fs.readFileSync(path.join(root,'home-canvas.css'),'utf8');
const engine=fs.readFileSync(path.join(root,'design-public.js'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');

test('Les trois photos partagent le même cadre et un zoom indépendant',()=>{
 for(const slug of ['page-accueil','page-esthetique','page-coiffure'])assert.ok(css.includes('#'+slug));
 assert.match(css,/\.change-landing-stage\{[^}]*width:100%!important;[^}]*height:100%!important/s);
 assert.match(css,/\.change-stage-photo\{[^}]*width:100%!important;[^}]*height:100%!important/s);
 assert.match(shared,/width:1536px!important/);
 assert.match(shared,/height:1024px!important/);
 assert.match(shared,/width:430px!important/);
 assert.match(shared,/height:1280px!important/);
 assert.match(engine,/const primary=imageUrl\(page\.hero_image_url,!!page\.__preview\)/);
 assert.match(engine,/renderLayers\(currentStage\.querySelector\('\.change-stage-layers'\),d\.layers/);
});
test('Aligner le cadrage n écrase ni la photo ni les calques',()=>{
 assert.match(engine,/d\.scene_align_home!==false/);
 assert.match(engine,/const imageSettings=matchHome\?referenceDesign:d/);
 assert.match(engine,/const imageLegacy=matchHome\?referenceCfg:cfg/);
 assert.match(engine,/currentStage\.style\.setProperty\('--stage-opacity',number\(d\.image_opacity/);
 assert.match(engine,/currentStage\.style\.setProperty\('--stage-veil',number\(d\.veil/);
 assert.match(engine,/img\.style\.objectFit=imageSettings\.image_fit/);
});
test('Le fondu est disponible entre les 3 pages et respecte la réduction des animations',()=>{
 assert.match(css,/view-transition-name:change-universe-hero/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
 assert.match(html,/document\.startViewTransition\(renderRoute\)/);
 assert.match(html,/seamlessPages=new Set\(\['accueil','esthetique','coiffure'\]\)/);
 assert.match(html,/scene-superposition\.css/);
 assert.match(engine,/region\.dataset\.universeFade/);
});
test('Tous les scripts restent syntaxiquement valides',()=>{
 new Function(engine);
 const embedded=html.slice(html.lastIndexOf('<script>(function(){'),html.lastIndexOf('</script>\n<script src="./supabase-config.js"'));
 assert.ok(embedded.startsWith('<script>'));
 new Function(embedded.slice('<script>'.length));
});
