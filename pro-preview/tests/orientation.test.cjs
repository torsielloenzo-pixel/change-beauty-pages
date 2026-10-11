const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const script = fs.readFileSync(path.join(__dirname, '../orientation.js'), 'utf8');

function simulate({ width, height, degrees, installed = true, phone = true, legacy = undefined }) {
  const classes = new Set();
  const vars = new Map();
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
  const orientation = { angle: degrees, addEventListener() {} };
  const fakeWindow = {
    innerWidth: width, innerHeight: height,
    orientation: legacy,
    navigator: { standalone: installed },
    screen: { width: phone ? 390 : 1024, height: phone ? 844 : 1366, orientation },
    matchMedia() { return { matches: installed, addEventListener() {} }; },
    visualViewport: { addEventListener() {} },
    addEventListener() {},
  };
  const ctx = {
    window: fakeWindow,
    document: {
      documentElement,
      getElementById(id) { return id === 'app' ? {} : null; },
      activeElement: null,
      addEventListener() {},
    },
    Number, Math, RegExp, String,
    setTimeout() { return 1; },
    clearTimeout() {},
    requestAnimationFrame(callback) { callback(); return 1; },
    cancelAnimationFrame() {},
  };
  vm.runInNewContext(script, ctx, { filename: 'orientation.js', timeout: 1000 });
  return { classes, vars };
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
