'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../home-beauty-collision.js'),'utf8');
const css=fs.readFileSync(path.join(__dirname,'../home-beauty-collision.css'),'utf8');
const near=(a,b)=>assert.ok(Math.abs(a-b)<.75,`${a} différent de ${b}`);

function fixture({top=620,height=240,rowTop=820,heroTop=0,hiddenServices=false}={}){
  const vars={};
  const panel={
    style:{
      setProperty(k,v){vars[k]=v;},
      getPropertyValue(k){return vars[k]||'';},
      removeProperty(k){delete vars[k];}
    },
    get clientHeight(){return Math.min(height,parseFloat(vars['--change-home-beauty-safe-max-height'])||height);},
    get scrollHeight(){return height;},
    getBoundingClientRect(){
      const lift=parseFloat(vars['--change-home-beauty-safe-lift'])||0;
      const h=this.clientHeight;
      return {top:top-lift,bottom:top+h-lift,width:330,height:h};
    }
  };
  const services={
    getBoundingClientRect(){
      return {top:rowTop,bottom:rowTop+(hiddenServices?0:86),width:1250,height:hiddenServices?0:86};
    }
  };
  const header={getBoundingClientRect(){return {top:0,bottom:90,height:90,width:1500};}};
  const hero={
    querySelector(selector){
      return selector==='.dual-home__panel--beauty'?panel:selector==='.dual-home__services'?services:null;
    },
    getBoundingClientRect(){return {top:heroTop,bottom:heroTop+920,width:1500,height:920};}
  };
  const home={hidden:false,querySelector:s=>s==='.dual-home'?hero:null};
  const events={};
  const win={
    innerHeight:900,
    requestAnimationFrame(fn){fn();},
    addEventListener(type,fn){events[type]=fn;}
  };
  const doc={
    getElementById:id=>id==='page-accueil'?home:null,
    querySelector:s=>s==='.site-header'?header:null,
    body:{classList:{contains:s=>s==='change-home-layout'}},
    fonts:null
  };
  vm.runInNewContext(source,{document:doc,window:win});
  return {panel,services,home,vars,events,
    setRowTop(v){rowTop=v;},
    setHidden(v){hiddenServices=v;},
    setHeroTop(v){heroTop=v;},
    currentBottom(){return panel.getBoundingClientRect().bottom;}
  };
}
test('Sans collision, garder exactement la position choisie',()=>{
 const x=fixture({top:530,height:210,rowTop:850});
 near(x.currentBottom(),740);
 near(parseFloat(x.vars['--change-home-beauty-safe-lift']||0),0);
});
test('Collision : remonter juste au-dessus de la rangée des prestations',()=>{
 const x=fixture({top:620,height:240,rowTop:820});
 assert.ok(parseFloat(x.vars['--change-home-beauty-safe-lift'])>0);
 assert.ok(x.currentBottom()<=820-16);
 near(x.currentBottom(),820-22.5);
});
test('Après redimensionnement, la correction ne se cumule pas',()=>{
 const x=fixture({top:620,height:240,rowTop:820});
 const original=parseFloat(x.vars['--change-home-beauty-safe-lift']);
 x.events.resize();
 near(parseFloat(x.vars['--change-home-beauty-safe-lift']),original);
 x.setRowTop(920);x.events.resize();
 near(parseFloat(x.vars['--change-home-beauty-safe-lift']||0),0);
});
test('Un écran très court ne laisse pas le texte déborder sur les prestations',()=>{
 const x=fixture({top:340,height:350,rowTop:465});
 assert.ok(x.panel.getBoundingClientRect().bottom<=465-16);
 assert.equal(x.vars['--change-home-beauty-safe-overflow'],'auto');
 assert.ok(x.panel.clientHeight<350);
});
test('Si les catégories sont masquées sur mobile, ne rien modifier',()=>{
 const x=fixture({top:620,height:240,rowTop:820,hiddenServices:true});
 near(parseFloat(x.vars['--change-home-beauty-safe-lift']||0),0);
 assert.equal(x.vars['--change-home-beauty-safe-max-height'],undefined);
});
test('Après scroll, les mesures restent relatives à la scène',()=>{
 const x=fixture({top:320,height:150,rowTop:580,heroTop:-180});
 near(parseFloat(x.vars['--change-home-beauty-safe-lift']||0),0);
});
test('La CSS ne repositionne ni Coiffure, ni les autres pages, ni les images',()=>{
 assert.match(css,/#page-accueil \.dual-home__grid > \.dual-home__panel--beauty/);
 assert.match(css,/--change-home-beauty-safe-lift/);
 assert.match(css,/--change-home-beauty-safe-max-height/);
 assert.doesNotMatch(css,/#page-coiffure|#page-esthetique|\.change-stage-photo/);
 new Function(source);
});
