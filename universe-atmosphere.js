/* CH’ANGE × NAMAJE — atmospheric overlay v2.
   Decorative only: no changes to the index introduction, clicks or navigation.
   Modes: window.ChangeAtmosphere.setMode('subtil'|'equilibre'|'cinematique'|'off').
*/
(() => {
  'use strict';

  const init = () => {
    const gate = document.querySelector('.universe-gate');
    if (!gate || gate.querySelector('.universe-atmosphere')) return;

    const overlay = document.createElement('div');
    overlay.className = 'universe-atmosphere';
    overlay.setAttribute('aria-hidden', 'true');

    const petals = document.createElement('div');
    petals.className = 'universe-atmosphere__field universe-atmosphere__field--petals';
    const hair = document.createElement('div');
    hair.className = 'universe-atmosphere__field universe-atmosphere__field--hair';
    overlay.append(petals, hair);
    const shade = gate.querySelector('.universe-gate__shade');
    if (shade) shade.after(overlay);
    else gate.prepend(overlay);

    let seed = 274811;
    const rand = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    const svgNS = 'http://www.w3.org/2000/svg';

    function hairIllustration(i) {
      const svg = document.createElementNS(svgNS,'svg');
      svg.setAttribute('viewBox','0 0 120 180');
      svg.setAttribute('aria-hidden','true');
      const variants = [
        ['M20 2 C132 37 -8 112 98 178','M28 0 C123 59 19 120 100 180'],
        ['M90 0 C-25 44 127 119 28 180','M100 0 C-1 60 106 114 38 180'],
        ['M45 0 C102 50 12 103 89 180','M55 0 C112 67 35 114 97 177']
      ];
      for (const d of variants[i % 3]) {
        const path = document.createElementNS(svgNS, 'path');
        path.setAttribute('d', d);
        svg.append(path);
      }
      return svg;
    }

    // Readable from the first rendered frame: fixed accents rather than relying
    // exclusively on particles whose staggered animation may start off-screen.
    function anchor(parent, kind, config, i) {
      const el = document.createElement('span');
      el.className = 'universe-atmosphere__ornament universe-atmosphere__ornament--' + kind;
      el.style.setProperty('--x',config.x + '%');
      el.style.setProperty('--y',config.y + '%');
      el.style.setProperty('--size',config.size + 'px');
      el.style.setProperty('--alpha',String(config.alpha));
      el.style.setProperty('--angle',config.angle + 'deg');
      el.style.setProperty('--float',(6 + i * 1.4) + 's');
      if (kind === 'strand') el.append(hairIllustration(i));
      parent.append(el);
    }
    const petalAnchors = [
      {x:7,y:27,size:57,alpha:.88,angle:-37},
      {x:42,y:39,size:66,alpha:.84,angle:29},
      {x:4,y:61,size:96,alpha:.86,angle:-13},
      {x:70,y:73,size:73,alpha:.8,angle:22},
      {x:17,y:81,size:49,alpha:.86,angle:-58}
    ];
    const hairAnchors = [
      {x:68,y:5,size:165,alpha:.82,angle:-8},
      {x:7,y:47,size:176,alpha:.9,angle:10},
      {x:62,y:69,size:156,alpha:.84,angle:-20},
      {x:32,y:24,size:112,alpha:.71,angle:11}
    ];
    petalAnchors.forEach((config,i)=>anchor(petals,'petal',config,i));
    hairAnchors.forEach((config,i)=>anchor(hair,'strand',config,i));

    function tool(parent, type, config) {
      const wrap = document.createElement('span');
      wrap.className = 'universe-atmosphere__tool universe-atmosphere__tool--' + type;
      for (const key of ['x','y','size','alpha','angle','float']) {
        wrap.style.setProperty('--' + key, config[key] + (['x','y'].includes(key)?'%':key==='size'?'px':key==='angle'?'deg':key==='float'?'s':''));
      }
      // Stylised, recognizable salon tools drawn in one warm copper-white stroke.
      wrap.innerHTML = type==='comb' ?
        '<svg viewBox="0 0 120 160" aria-hidden="true"><path d="M21 26 Q21 16 31 16 L89 16 Q99 16 99 26 L99 45 L21 45 Z"/><path d="M21 45 H99"/><path d="M28 45 V138 M36 45 V146 M44 45 V140 M52 45 V146 M60 45 V140 M68 45 V146 M76 45 V140 M84 45 V146 M92 45 V138"/><path class="tool-glint" d="M28 29 H88"/></svg>' :
        '<svg viewBox="0 0 150 150" aria-hidden="true"><circle cx="33" cy="105" r="18"/><circle cx="88" cy="111" r="18"/><path d="M47 94 L130 16 L77 100 M75 96 L16 19 L96 82"/><circle cx="74" cy="88" r="3"/><path class="tool-glint" d="M111 31 L123 20"/></svg>';
      parent.append(wrap);
    }
    tool(hair,'scissors',{x:18,y:19,size:110,alpha:.9,angle:-16,float:11});
    tool(hair,'comb',{x:76,y:52,size:124,alpha:.86,angle:14,float:13});

    // Move independently of CSS keyframe phase; fixed anchors make the effect
    // immediately perceptible, and falling decorations complete the atmosphere.
    function falling(parent, kind, count) {
      for (let i=0;i<count;i++) {
        const el = document.createElement('span');
        el.className = 'universe-atmosphere__piece universe-atmosphere__piece--' + kind;
        const isStrand = kind === 'strand';
        const isPetal = kind === 'petal';
        const size = isStrand ? 74+rand()*104 : isPetal ? 22+rand()*44 : 1.7+rand()*3.3;
        el.style.setProperty('--size',size.toFixed(1)+'px');
        el.style.setProperty('--x',(4+rand()*89).toFixed(1)+'%');
        el.style.setProperty('--drift',((rand()-.5)*170).toFixed(1)+'px');
        el.style.setProperty('--time',(isStrand?17+rand()*10:isPetal?12+rand()*11:4+rand()*6).toFixed(2)+'s');
        el.style.setProperty('--delay',(-rand()*22).toFixed(2)+'s');
        el.style.setProperty('--peak',(isPetal?.70+rand()*.27:isStrand?.62+rand()*.24:.64+rand()*.2).toFixed(2));
        if (isPetal) el.style.setProperty('--blur',(rand()>.82?.7+rand()*.5:0)+'px');
        if (isStrand) el.append(hairIllustration(i));
        parent.append(el);
      }
    }
    const compact = window.matchMedia && window.matchMedia('(max-width: 720px)').matches;
    falling(petals,'petal',compact?14:25);
    falling(petals,'glimmer',compact?5:9);
    falling(hair,'strand',compact?8:17);
    falling(hair,'glimmer',compact?5:11);

    const modes = new Set(['subtil','equilibre','cinematique','off']);
    function setMode(mode) {
      if (!modes.has(mode)) return;
      gate.dataset.atmosphere = mode;
      document.querySelectorAll('[data-atmosphere-mode]').forEach(button=>{
        button.setAttribute('aria-pressed',String(button.dataset.atmosphereMode===mode));
      });
    }
    window.ChangeAtmosphere = Object.freeze({setMode});
    // In a demo, default is intentionally vivid, so the decorative objects
    // can be judged before choosing a subtler production intensity.
    setMode(document.querySelector('.atmosphere-demo-panel')?'cinematique':'equilibre');
    document.querySelectorAll('[data-atmosphere-mode]').forEach(button=>{
      button.addEventListener('click',()=>setMode(button.dataset.atmosphereMode));
    });
  };
  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
