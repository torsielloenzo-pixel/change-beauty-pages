'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../header-brand.js'),'utf8');

class Node{
 constructor(tag){this.tagName=tag;this.children=[];this.parentNode=null;this.hidden=false;this._listeners={};this._classes=new Set();
  this.classList={add:k=>this._classes.add(k),remove:k=>this._classes.delete(k),contains:k=>this._classes.has(k)};
 }
 get firstChild(){return this.children[0]||null;}
 appendChild(child){if(child.parentNode){child.parentNode.children=child.parentNode.children.filter(c=>c!==child)}
  this.children.push(child);child.parentNode=this;return child;}
 insertBefore(child,before){if(child.parentNode){child.parentNode.children=child.parentNode.children.filter(c=>c!==child)}
  const index=this.children.indexOf(before);this.children.splice(index<0?this.children.length:index,0,child);child.parentNode=this;return child;}
 querySelector(q){return q===':scope > small'?this.children.find(x=>x.tagName==='small')||null:null}
 addEventListener(k,fn){this._listeners[k]=fn}
 removeAttribute(k){delete this[k]}
}
function boot(){
 const originalText=new Node('#text');
 const subtitle=new Node('small');
 const anchor=new Node('a');anchor.appendChild(originalText);anchor.appendChild(subtitle);
 const doc={querySelector:q=>q==='.site-header > a.wordmark'?anchor:null,createElement:k=>new Node(k)};
 const win={};
 vm.runInNewContext(source,{document:doc,window:win,URL,console});
 return {anchor,originalText,subtitle,api:win.CHANGE_HEADER_BRAND};
}
test('CH’ANGE et INSTITUT DE BEAUTÉ forment le même bloc remplacé par l’image',()=>{
 const x=boot();
 const slot=x.anchor.children[0];
 assert.equal(x.anchor.children.length,1);
 assert.equal(slot.className,'change-brand-title');
 assert.equal(slot.children[0].className,'change-brand-text');
 assert.equal(slot.children[0].children[0],x.originalText);
 assert.equal(slot.children[0].children[1],x.subtitle);
 assert.equal(slot.children[1].className,'change-brand-image');
 assert.equal(x.subtitle.parentNode,slot.children[0]);
});
test('Texte par défaut, et image après son chargement seulement',()=>{
 const x=boot(),slot=x.anchor.children[0],img=slot.children[1];
 x.api.apply({header_logo:{mode:'image',url:'https://example.org/logo.png'}});
 assert.equal(img.hidden,true);
 assert.equal(slot.classList.contains('change-brand-mode-image'),false);
 img.onload();
 assert.equal(img.hidden,false);
 assert.equal(slot.classList.contains('change-brand-mode-image'),true);
 // Le sous-titre est inclus dans le bloc que la CSS masque simultanément.
 assert.equal(x.subtitle.parentNode,slot.children[0]);
 x.api.apply({header_logo:{mode:'text'}});
 assert.equal(img.hidden,true);
 assert.equal(slot.classList.contains('change-brand-mode-image'),false);
 assert.equal(x.subtitle.parentNode,slot.children[0]);
});
test('URL non sécurisée refusée, données locales autorisées seulement en aperçu',()=>{
 const x=boot(),img=x.anchor.children[0].children[1];
 x.api.apply({header_logo:{mode:'image',url:'javascript:alert(1)'}});
 assert.equal(img.hidden,true);
 x.api.apply({header_logo:{mode:'image',url:'data:image/png;base64,AAAA'}});
 assert.equal(img.hidden,true);
 x.api.apply({header_logo:{mode:'image',url:'data:image/png;base64,AAAA'}},true);
 assert.match(img.src,/^data:image\/png;base64,/);
});
test('CSS : les deux textes gardent le cadre global, l’image occupe 100 % du bloc',()=>{
 const css=fs.readFileSync(path.join(__dirname,'../header-brand.css'),'utf8');
 assert.match(css,/\.change-brand-title/);
 assert.match(css,/\.change-brand-text/);
 assert.match(css,/\.change-brand-title\.change-brand-mode-image \.change-brand-text/);
 assert.match(css,/visibility:hidden/);
 assert.match(css,/position:absolute/);
 assert.match(css,/object-fit:fill/);
 assert.doesNotMatch(css,/object-fit:cover/);
 assert.match(css,/width:100%/);
 assert.match(css,/height:100%/);
 assert.doesNotMatch(css,/\.site-header\s*\{[^}]*height/);
});
