'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../home-canvas.js'),'utf8');
const nearly=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-8,
  'received '+actual+', expected '+expected);

function makeFixture(width,{height=1024,touch=false}={}){
 const vars={},callbacks={},added=new Set();
 const root={clientWidth:width,dataset:{},style:{setProperty(k,v){vars[k]=v;}}};
 const viewport={
   clientWidth:width,
   style:{setProperty(k,v){vars[k]=v;}},
   querySelector(selector){assert.equal(selector,'.dual-home__grid');return canvas;}
 };
 const stage={parentNode:null};
 const canvas={prepend(child){child.parentNode=this;this.firstChild=child;}};
 const classes={toggle(k,p){if(p)added.add(k);else added.delete(k);}};
 const win={
   innerHeight:height,
   matchMedia(q){return {matches:q.includes('pointer:coarse')?touch&&root.clientWidth<=699:root.clientWidth<=699}},
   addEventListener(type,callback){callbacks[type]=callback;},
   dispatchEvent(){}
 };
 const doc={
   documentElement:root,body:{classList:classes},
   querySelector(q){assert.equal(q,'#page-accueil .dual-home');return viewport;},
   getElementById(k){assert.equal(k,'change-landing-stage');return stage;}
 };
 vm.runInNewContext(source,{
   window:win,document:doc,
   requestAnimationFrame(fn){fn();},
   Event:class Event{constructor(type){this.type=type;}}
 });
 return {
   root,stage,canvas,vars,classes:added,
   resize(newWidth,newHeight){
     root.clientWidth=newWidth;viewport.clientWidth=newWidth;
     win.innerHeight=newHeight;callbacks.resize();
   }
 };
}
test('Prévisualisation 1440×920 : scène entière, décalage latéral symétrique',()=>{
 const f=makeFixture(1440,{height:920});
 assert.equal(f.stage.parentNode,f.canvas);
 nearly(+f.vars['--home-canvas-scale'],920/1024);
 nearly(parseFloat(f.vars['--home-canvas-height']),920);
 nearly(parseFloat(f.vars['--home-canvas-offset-x']),30);
 assert.equal(f.root.dataset.homeCanvas,'desktop');
});
test('Fenêtres larges ou basses : priorité au cadrage intégral sans coupe',()=>{
 const f=makeFixture(1536,{height:1024});
 nearly(+f.vars['--home-canvas-scale'],1);
 nearly(parseFloat(f.vars['--home-canvas-height']),1024);
 nearly(parseFloat(f.vars['--home-canvas-offset-x']),0);
 f.resize(1920,1080);
 nearly(+f.vars['--home-canvas-scale'],1080/1024);
 nearly(parseFloat(f.vars['--home-canvas-height']),1080);
 nearly(parseFloat(f.vars['--home-canvas-offset-x']),150);
 f.resize(1366,680);
 nearly(+f.vars['--home-canvas-scale'],680/1024);
 nearly(parseFloat(f.vars['--home-canvas-height']),680);
 nearly(parseFloat(f.vars['--home-canvas-offset-x']),(1366-1536*680/1024)/2);
});
test('La hauteur seule déclenche aussi le recalcul de la composition',()=>{
 const f=makeFixture(1440,{height:920});
 const oldScale=+f.vars['--home-canvas-scale'];
 f.resize(1440,760);
 assert.ok(+f.vars['--home-canvas-scale']<oldScale);
 nearly(parseFloat(f.vars['--home-canvas-height']),760);
});
test('Sur téléphone tactile : canevas portrait à l’échelle de largeur, défilement autorisé',()=>{
 const f=makeFixture(390,{height:844,touch:true});
 assert.equal(f.root.dataset.homeCanvas,'mobile');
 assert.equal(f.classes.has('home-canvas-mobile'),true);
 nearly(+f.vars['--home-canvas-scale'],390/430);
 nearly(parseFloat(f.vars['--home-canvas-height']),1280*390/430);
 nearly(parseFloat(f.vars['--home-canvas-offset-x']),0);
 f.resize(430,932);
 nearly(+f.vars['--home-canvas-scale'],1);
 nearly(parseFloat(f.vars['--home-canvas-height']),1280);
 f.resize(820,1180);
 assert.equal(f.classes.has('home-canvas-mobile'),false);
 nearly(+f.vars['--home-canvas-scale'],Math.min(820/1536,1180/1024));
});
test('Le même décalage et la même échelle positionnent photo, texte et entête',()=>{
 const css=fs.readFileSync(path.join(__dirname,'../home-canvas.css'),'utf8');
 const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
 assert.match(css,/\.dual-home__grid\{[\s\S]*?left:var\(--home-canvas-offset-x,0px\)/);
 assert.match(css,/\.site-header,[\s\S]*?left:var\(--home-canvas-offset-x,0px\)/);
 assert.match(css,/transform:scale\(var\(--home-canvas-scale,1\)\)/);
 assert.match(css,/#change-landing-stage/);
 assert.match(html,/home-canvas\.css/);
 assert.match(html,/home-canvas\.js/);
 assert.match(html,/intro-bands container/);
});
