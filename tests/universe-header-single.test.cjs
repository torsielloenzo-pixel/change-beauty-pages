'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const html=read('index.html');
const css=read('universe-gateway.css');
const gateway=read('universe-gateway.js');

test('Les quatre URL partagent un seul en-tête HTML officiel',()=>{
  assert.equal((html.match(/<header\\s+class="site-header">/g)||[]).length,1);
  assert.match(html,/<header class="site-header">/);
  for(const route of ['?univers=change#accueil','?univers=change#esthetique',
    '?univers=namaje#accueil','?univers=namaje#coiffure']){
    const universe=new URL('https://institut-change.fr/'+route).searchParams.get('univers');
    assert.ok(['change','namaje'].includes(universe));
  }
  assert.match(gateway,/const header = document.querySelector\\('\\.site-header'\\)/);
  assert.match(gateway,/desktopNav.className = 'universe-public-nav'/);
  assert.match(gateway,/if\\(actions\\) header.insertBefore\\(desktopNav,actions\\)/);
});

test('La navigation historique reste disponible en aperçu mais est masquée publiquement',()=>{
 const rule=css.slice(css.indexOf('Correctif en-tête unique CH’ANGE / NAMAJE'));
 assert.ok(rule.length>300);
 assert.match(rule,/body\\[data-universe\\]\\.change-home-layout:is\\(\\.home-canvas-mobile,:not\\(\\.home-canvas-mobile\\)\\)/);
 assert.match(rule,/body\\[data-universe\\]:not\\(\\.change-home-layout\\)/);
 assert.match(rule,/\\.site-header > nav\\.desktop-menu/);
 assert.match(rule,/\\.site-header > nav\\.change-home-nav/);
 assert.match(rule,/display:none!important/);
 assert.match(rule,/visibility:hidden!important/);
 assert.doesNotMatch(rule,/\\.universe-public-nav\\s*\\{\\s*display:none/);
 assert.match(css,/\\.site-header > \\.universe-public-nav\\{/);
});

test('Un seul logo par univers, sans modifier le site professionnel ni les photos',()=>{
 const rule=css.slice(css.indexOf('Correctif en-tête unique CH’ANGE / NAMAJE'));
 assert.match(rule,/body\\[data-universe="change"\\] \\.site-header > \\.universe-namaje-brand/);
 assert.match(rule,/body\\[data-universe="namaje"\\] \\.site-header > a\\.wordmark/);
 assert.match(css,/body\\[data-universe="namaje"\\] \\.site-header > \\.universe-namaje-brand\\{display:flex!important\\}/);
 assert.match(html,/id="mobile-menu"/);
 assert.match(gateway,/if\\(mobile\\) mobile.replaceChildren\\(\\)/);
 assert.doesNotMatch(rule,/(?:page-esthetique|page-coiffure|hero|change-stage|\\.pro-app)/);
});
test('La correction CSS est bien chargée en dernier avec une version neuve',()=>{
 assert.match(html,/universe-gateway\\.css\\?v=4/);
 assert.ok(html.indexOf('universe-gateway.css?v=4')>html.indexOf('official-public-header.css'));
});
