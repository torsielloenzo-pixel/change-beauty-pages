'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../home-canvas.js'),'utf8');

function makeFixture(width,{touch=false}={}){
  const vars={};
  const callbacks={};
  const added=new Set();
  const root={
    clientWidth:width,dataset:{},
    style:{setProperty(name,value){vars[name]=value;}}
  };
  const viewport={
    style:{setProperty(name,value){vars[name]=value;}},
    querySelector(selector){assert.equal(selector,'.dual-home__grid');return canvas;}
  };
  const stage={parentNode:null};
  const canvas={prepend(child){child.parentNode=this;this.firstChild=child;}};
  const classes={
    toggle(name,present){if(present)added.add(name);else added.delete(name);}
  };
  const windowMock={
    matchMedia(query){return {matches:query.includes('pointer:coarse')?touch&&root.clientWidth<=699:root.clientWidth<=699}},
    addEventListener(type,callback){callbacks[type]=callback;},
    dispatchEvent(){}
  };
  const documentMock={
    documentElement:root,body:{classList:classes},
    querySelector(selector){
      if(selector==='#page-accueil .dual-home')return viewport;
      if(['#page-esthetique .dual-home','#page-coiffure .dual-home'].includes(selector))return null;
      throw Error('Sélecteur inattendu : '+selector);
    },
    getElementById(id){assert.equal(id,'change-landing-stage');return stage;}
  };
  vm.runInNewContext(source,{
    window:windowMock,document:documentMock,
    requestAnimationFrame(fn){fn();},
    Event:class Event{constructor(type){this.type=type;}}
  });
  return {
    root,stage,canvas,vars,classes:added,
    resize(width){root.clientWidth=width;callbacks.resize();}
  };
}
test('Desktop : photographie, calques et textes partagent exactement le ratio d origine',()=>{
 const f=makeFixture(1536);
 assert.equal(f.stage.parentNode,f.canvas);
 assert.equal(f.vars['--home-canvas-scale'],'1');
 assert.equal(f.vars['--home-canvas-height'],'1024px');
 f.resize(960);
 assert.equal(Number(f.vars['--home-canvas-scale']),960/1536);
 assert.equal(Number.parseFloat(f.vars['--home-canvas-height']),1024*960/1536);
 f.resize(430);
 assert.equal(Number(f.vars['--home-canvas-scale']),430/1536);
 assert.equal(f.root.dataset.homeCanvas,'desktop');
 assert.equal(f.classes.has('home-canvas-mobile'),false);
 f.resize(1920);
 assert.equal(Number(f.vars['--home-canvas-scale']),1920/1536);
 assert.equal(Number.parseFloat(f.vars['--home-canvas-height']),1280);
});
test('Téléphone tactile : composition portrait constante à chaque largeur',()=>{
 const f=makeFixture(390,{touch:true});
 assert.equal(f.root.dataset.homeCanvas,'mobile');
 assert.equal(f.classes.has('home-canvas-mobile'),true);
 assert.equal(Number(f.vars['--home-canvas-scale']),390/430);
 assert.equal(Number.parseFloat(f.vars['--home-canvas-height']),1280*390/430);
 f.resize(430);
 assert.equal(Number(f.vars['--home-canvas-scale']),1);
 assert.equal(Number.parseFloat(f.vars['--home-canvas-height']),1280);
 f.resize(820);
 assert.equal(f.classes.has('home-canvas-mobile'),false);
 assert.equal(Number(f.vars['--home-canvas-scale']),820/1536);
});
test('Le fond et les contenus sont montés sous le même repère de transformation',()=>{
 const css=fs.readFileSync(path.join(__dirname,'../home-canvas.css'),'utf8');
 const main=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
 assert.match(css,/transform:scale\(var\(--home-canvas-scale,1\)\)/);
 assert.match(css,/\.change-landing-stage/);
 assert.match(main,/home-canvas\.css/);
 assert.match(main,/home-canvas\.js/);
 assert.match(main,/intro-bands container/);
});


test('CH’ANGE et NAMAJE : mêmes rangées et boutons sur les trois scènes',()=>{
 const css=fs.readFileSync(path.join(__dirname,'../home-canvas.css'),'utf8');
 assert.match(css,/grid-template-rows:103px 47px 120px 62px!important/);
 assert.match(css,/grid-template-rows:78px 38px 116px 53px!important/);
 assert.match(css,/grid-row:3!important/);
 assert.match(css,/grid-row:4!important/);
 assert.match(css,/width:340px!important/);
 assert.match(css,/height:62px!important/);
 for(const slug of ['page-accueil','page-esthetique','page-coiffure'])assert.ok(css.includes('#'+slug));
});
