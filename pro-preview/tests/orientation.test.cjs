const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const script = fs.readFileSync(path.join(__dirname, '../orientation.js'), 'utf8');

function simulate({ width, height, degrees, installed = true, phone = true, legacy = undefined }) {
  const classes = new Set();
  const vars = new Map();
  const callbacks = new Map();
  const on = (scope, type, callback) => callbacks.set(scope + ':' + type, callback);

  const documentElement = {
    classList: {
      add(...values) { values.forEach(v => classes.add(v)); },
      remove(...values) { values.forEach(v => classes.delete(v)); },
      toggle(value, on) { if (on) classes.add(value); else classes.delete(value); },
    },
    style: {
      setProperty(k,v) { vars.set(k,v); },
      removeProperty(k) { vars.delete(k); },
    },
  };
  const orientation = { angle: degrees, addEventListener(type, callback) { on('screen', type, callback); } };
  const fakeWindow = {
    innerWidth: width, innerHeight: height,
    orientation: legacy,
    navigator: { standalone: installed },
    screen: { width: phone ? 390 : 1024, height: phone ? 844 : 1366, orientation },
    matchMedia() { return { matches: installed, addEventListener() {} }; },
    visualViewport: { addEventListener(type, callback) { on('visual', type, callback); } },
    addEventListener(type, callback) { on('window', type, callback); },
  };
  const ctx = {
    window: fakeWindow,
    document: {
      documentElement,
      getElementById(id) { return id === 'app' ? {} : null; },
      activeElement: null,
      visibilityState: 'visible',
      addEventListener(type, callback) { on('document', type, callback); },
    },
    Number, Math, RegExp, String,
    setTimeout() { return 1; },
    clearTimeout() {},
    requestAnimationFrame(callback) { callback(); return 1; },
    cancelAnimationFrame() {},
  };
  vm.runInNewContext(script, ctx, { filename: 'orientation.js', timeout: 1000 });
  return {
    classes, vars, window: fakeWindow, document: ctx.document,
    fire(scope, type) { callbacks.get(scope + ':' + type)?.(); },
  };
}
const has = (r,c) => r.classes.has(c);
let result = simulate({width:390,height:844,degrees:0});
assert.equal(has(result,'pwa-virtual-portrait'),false,'Portrait standard non transformé');

result = simulate({width:844,height:390,degrees:90});
assert.equal(has(result,'pwa-virtual-portrait'),true);
assert.equal(has(result,'pwa-virtual-landscape'),true);
assert.equal(result.vars.get('--pwa-portrait-width'),'390px');
assert.equal(result.vars.get('--pwa-portrait-height'),'844px');
assert.equal(result.vars.get('--pwa-counter-angle'),'-90deg');

result = simulate({width:844,height:390,degrees:270});
assert.equal(result.vars.get('--pwa-counter-angle'),'-270deg');

result = simulate({width:390,height:844,degrees:180});
assert.equal(has(result,'pwa-virtual-landscape'),false);
assert.equal(result.vars.get('--pwa-counter-angle'),'-180deg');

result = simulate({width:844,height:390,degrees:90,installed:false});
assert.equal(has(result,'pwa-virtual-portrait'),false,'Safari standard inchangé');

result = simulate({width:1366,height:1024,degrees:90,phone:false});
assert.equal(has(result,'pwa-virtual-portrait'),false,'Desktop inchangé');

result = simulate({width:844,height:390,degrees:0,legacy:-90});
assert.equal(result.vars.get('--pwa-counter-angle'),'-270deg','Compatibilité window.orientation');

console.log('OK : portrait, deux paysages, portrait inversé, Safari, bureau et angle iOS historique.');

// Rotation en direct : même document / mêmes éléments, aucune navigation.
result = simulate({width:390,height:844,degrees:0});
result.window.innerWidth=844;
result.window.innerHeight=390;
result.window.screen.orientation.angle=90;
result.fire('window','orientationchange');
assert.equal(result.vars.get('--pwa-counter-angle'),'-90deg');
assert.equal(result.vars.get('--pwa-portrait-width'),'390px');
assert.equal(result.vars.get('--pwa-portrait-height'),'844px');

// La rotation opposée est compensée, sans recréer la page.
result.window.screen.orientation.angle=270;
result.fire('screen','change');
assert.equal(result.vars.get('--pwa-counter-angle'),'-270deg');

// Retour au portrait : transformation retirée sans rechargement.
result.window.innerWidth=390;
result.window.innerHeight=844;
result.window.screen.orientation.angle=0;
result.fire('window','resize');
assert.equal(has(result,'pwa-virtual-portrait'),false);
assert.equal(has(result,'pwa-virtual-landscape'),false);

// Clavier iOS : si la hauteur tombe sous la largeur sans angle paysage,
// ce n'est PAS une vraie rotation.
result = simulate({width:390,height:844,degrees:0});
result.document.activeElement={tagName:'INPUT'};
result.window.innerHeight=330;
result.fire('window','resize');
assert.equal(has(result,'pwa-virtual-portrait'),false);

// Clavier déjà ouvert + orientation paysage signalée : bien compenser.
result = simulate({width:844,height:390,degrees:90});
result.document.activeElement={tagName:'INPUT'};
result.fire('window','resize');
assert.equal(has(result,'pwa-virtual-landscape'),true);

// Ni Safari ni les navigateurs desktop ne préparent un calque GPU.
result = simulate({width:844,height:390,degrees:90,installed:false});
assert.equal(has(result,'pwa-orientation-armed'),false);
result = simulate({width:1366,height:1024,degrees:90,phone:false});
assert.equal(has(result,'pwa-orientation-armed'),false);
console.log('OK : transitions directes, clavier et isolation PWA.');
