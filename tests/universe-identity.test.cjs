'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.join(__dirname,'..');
const source=fs.readFileSync(path.join(root,'header-brand.js'),'utf8');
const css=fs.readFileSync(path.join(root,'universe-identity.css'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');

class Elem{
 constructor(tag,text=''){
  this.tagName=tag;this.textContent=text;this.children=[];this.parentNode=null;
  this.hidden=false;this.listeners={};this.classes=new Set();
  this.classList={add:(v)=>this.classes.add(v),remove:(v)=>this.classes.delete(v),contains:(v)=>this.classes.has(v)};
 }
 get firstChild(){return this.children[0]||null}
 appendChild(x){if(x.parentNode)x.parentNode.children=x.parentNode.children.filter(c=>c!==x);x.parentNode=this;this.children.push(x);return x}
 querySelector(s){return s===':scope > small'?this.children.find(c=>c.tagName==='small')||null:null}
 addEventListener(event,fn){this.listeners[event]=fn}
 removeAttribute(n){delete this[n]}
 setAttribute(k,v){this[k]=v}
}
function boot(initialHash='#accueil'){
 const text=new Elem('#text','CH’ANGE '),small=new Elem('small','INSTITUT DE BEAUTÉ');
 const wordmark=new Elem('a');wordmark.appendChild(text);wordmark.appendChild(small);
 const win={location:{hash:initialHash},events:{},addEventListener(n,fn){this.events[n]=fn}};
 const doc={querySelector(q){return q==='.site-header > a.wordmark'?wordmark:null},createElement:n=>new Elem(n)};
 vm.runInNewContext(source,{document:doc,window:win,URL});
 return {api:win.CHANGE_HEADER_BRAND,wordmark,text,small,window:win};
}
test('NAMAJE appears only while navigating within Coiffure and restores CH’ANGE',()=>{
 const x=boot('#accueil');
 assert.equal(x.text.textContent,'CH’ANGE ');
 assert.equal(x.small.textContent,'INSTITUT DE BEAUTÉ');
 x.api.setUniverse('coiffure');
 assert.equal(x.text.textContent,'NAMAJE ');
 assert.equal(x.small.textContent,'INSTITUT DE COIFFURE');
 assert.match(x.wordmark['aria-label'],/NAMAJE/);
 x.api.setUniverse('esthetique');
 assert.equal(x.text.textContent,'CH’ANGE ');
 assert.equal(x.small.textContent,'INSTITUT DE BEAUTÉ');
 x.window.location.hash='#coiffure';
 x.window.events.hashchange();
 assert.equal(x.small.textContent,'INSTITUT DE COIFFURE');
});
test('saved image logo cannot cover NAMAJE, and returns on other routes',()=>{
 const x=boot('#accueil'),slot=x.wordmark.firstChild,img=slot.children[1];
 x.api.apply({header_logo:{mode:'image',url:'https://example.org/logo.png'}});
 img.onload();
 assert.equal(img.hidden,false);
 x.api.setUniverse('coiffure');
 assert.equal(img.hidden,true);
 assert.equal(slot.classList.contains('change-brand-mode-image'),false);
 x.api.apply({header_logo:{mode:'image',url:'https://example.org/new.png'}});
 assert.equal(img.hidden,true);
 x.api.setUniverse('accueil');
 assert.match(img.src,/new.png/);
 img.onload();
 assert.equal(img.hidden,false);
});
test('the new unified header and photographic titles are loaded on all three scenes',()=>{
 assert.ok(html.indexOf('universe-identity.css')>html.indexOf('header-editorial.css'));
 assert.ok(html.indexOf('header-brand.js?v=4')>0);
 assert.match(html,/CHANGE_HEADER_BRAND\?\.setUniverse\(active\)/);
 assert.match(css,/body:not\(\.change-home-layout\).*\.change-home-nav/);
 assert.match(css,/dual-home__copy > :is\(h1,h2\)/);
 assert.match(css,/clip-path:inset\(50%\)/);
 assert.match(css,/\.dual-home__label/);
 assert.match(css,/font-family:var\(--sans\)!important/);
 assert.match(css,/font-size:clamp\(21px,2vw,31px\)!important/);
 assert.match(css,/#page-accueil,#page-esthetique,#page-coiffure/);
 assert.match(css,/border-radius:999px!important/);
});

test('Accueil: badges are smaller, truly hollow and have no decorative strokes',()=>{
 const marker='Accueil UNIQUEMENT — encadrés fins sans remplissage.';
 const start=css.indexOf(marker);
 assert.ok(start>0,'a dedicated accueil-only override is required');
 const home=css.slice(start);
 assert.match(home,/#page-accueil \.dual-home__label\{/);
 assert.match(home,/background:transparent!important/);
 assert.match(home,/backdrop-filter:none!important/);
 assert.match(home,/box-shadow:none!important/);
 assert.match(home,/border:1px solid rgba\(60,40,33,\.76\)!important/);
 assert.match(home,/min-height:clamp\(38px,4\.8svh,48px\)!important/);
 assert.match(home,/font-size:clamp\(16px,1\.35vw,21px\)!important/);
 assert.match(home,/#page-accueil \.dual-home__label::before/);
 assert.match(home,/#page-accueil \.dual-home__label::after/);
 assert.match(home,/content:none!important/);
 assert.match(home,/display:none!important/);
 // Dedicated pages keep their own larger framed labels.
 assert.doesNotMatch(home,/#page-esthetique \.dual-home__label/);
 assert.doesNotMatch(home,/#page-coiffure \.dual-home__label/);
 assert.match(html,/universe-identity\.css\?v=2/);
});
