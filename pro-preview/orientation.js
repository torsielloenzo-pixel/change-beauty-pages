/* Ch’ange Pro — portrait virtuel haute réactivité.
 * Uniquement pour la PWA installée sur téléphone.
 * Démarrage synchrone dans <head> AVANT les feuilles CSS pour éviter un flash
 * en paysage lors de l'ouverture de la PWA.
 * Aucune lecture de capteur, autorisation ou donnée métier enregistrée.
 */
(() => {
  'use strict';

  const root = document.documentElement;
  const STORAGE_KEY = 'change-pro:portrait-frame:v1';
  const media = window.matchMedia?.('(display-mode: standalone)') || { matches: false };
  const landscapeMedia = window.matchMedia?.('(orientation: landscape)') || { matches: false };
  const installed = () => media.matches || window.navigator.standalone === true;
  const normalize = (value) => Number.isFinite(value) ? ((value % 360) + 360) % 360 : null;
  const deviceWidth = () => Math.min(
    Number(window.screen?.width) || window.innerWidth,
    Number(window.screen?.height) || window.innerHeight,
  );
  const phone = () => deviceWidth() > 0 && deviceWidth() < 650;

  // Lecture optionnelle d'un cache minuscule : dimensions de la fenêtre
  // en portrait et dernier sens de rotation, JAMAIS de données clientes.
  // Le cache n'est qu'un secours. Les mesures actuelles priment.
  let geometry = null;
  try {
    const value = JSON.parse(window.sessionStorage?.getItem(STORAGE_KEY) || 'null');
    const sameScreen = Math.abs((value?.screenMin || 0) - deviceWidth()) <= 3;
    if (sameScreen && value.pw >= 240 && value.pw <= 650 &&
        value.ph >= value.pw && value.ph < 1600 &&
        (value.side === 90 || value.side === 270)) geometry = value;
  } catch (_) { /* Le stockage peut être désactivé : ne pas bloquer l'app. */ }

  let last = null;
  let frame = 0;
  let settleOne = 0;
  let settleTwo = 0;
  let previousSide = geometry?.side || 90;
  const persist = (pw, ph, side = previousSide) => {
    if (pw < 240 || ph < pw || ph > 1600) return;
    const data = { screenMin: deviceWidth(), pw, ph, side };
    geometry = data;
    try { window.sessionStorage?.setItem(STORAGE_KEY, JSON.stringify(data)); }
    catch (_) {}
  };
  const angleCandidates = () => [
    normalize(typeof window.orientation === 'number' ? window.orientation : NaN),
    normalize(window.screen?.orientation?.angle),
  ].filter(a => a !== null);
  const keyboardOpen = () => {
    const active = document.activeElement;
    return !!active && /^(INPUT|TEXTAREA|SELECT)$/.test(active.tagName);
  };
  const readOrientation = (landscape) => {
    const possible = angleCandidates().find(a => landscape ? a === 90 || a === 270 : a === 0 || a === 180);
    return possible === undefined ? (landscape ? previousSide : 0) : possible;
  };

  const reset = () => {
    if (last !== null) {
      root.classList.remove('pwa-virtual-portrait', 'pwa-virtual-landscape');
      root.style.removeProperty('--pwa-portrait-width');
      root.style.removeProperty('--pwa-portrait-height');
      root.style.removeProperty('--pwa-counter-angle');
      last = null;
    }
    root.classList.remove('pwa-orientation-armed');
  };

  const update = () => {
    if (!installed() || !phone()) { reset(); return; }

    // Armer un calque de composition GPU même en portrait. Le CSS media-query
    // paysage peut alors intervenir AVANT le prochain événement JS.
    root.classList.add('pwa-orientation-armed');

    const w = window.innerWidth;
    const h = window.innerHeight;
    const portraitAngle = readOrientation(false);
    let landscape = w > h;

    // L'ouverture d'un clavier virtuel peut réduire la hauteur visible
    // sans que l'utilisateur ait physiquement tourné son iPhone.
    // Ne jamais traiter ce cas comme une vraie rotation.
    if (keyboardOpen() && !last?.landscape &&
        landscape && (portraitAngle === 0 || portraitAngle === 180)) {
      landscape = false;
    }

    if (!landscape && portraitAngle !== 180) {
      if (w >= 240 && h > w && !keyboardOpen()) persist(w, h);
      root.classList.remove('pwa-virtual-portrait', 'pwa-virtual-landscape');
      root.style.removeProperty('--pwa-portrait-width');
      root.style.removeProperty('--pwa-portrait-height');
      // Conserver le dernier sens de rotation pour la règle CSS préventive.
      root.style.setProperty('--pwa-counter-angle', (-previousSide) + 'deg');
      last = { width: w, height: h, angle: 0, landscape: false };
      return;
    }

    const angle = landscape ? readOrientation(true) : 180;
    if (landscape) previousSide = angle;

    let width = landscape ? h : w;
    let height = landscape ? w : h;
    if (keyboardOpen() && last?.landscape === landscape && last?.angle === angle) {
      width = last.width;
      height = last.height;
    }

    // WebKit peut signaler une dimension passagère pendant l'animation native.
    // Utiliser le cadre précédent si le viewport est temporairement incohérent.
    if ((width < 240 || height < width) && geometry) {
      width = geometry.pw;
      height = geometry.ph;
    }

    if (last?.width !== width || last?.height !== height ||
        last?.angle !== angle || last?.landscape !== landscape) {
      root.style.setProperty('--pwa-portrait-width', width + 'px');
      root.style.setProperty('--pwa-portrait-height', height + 'px');
      root.style.setProperty('--pwa-counter-angle', (-angle) + 'deg');
      root.classList.add('pwa-virtual-portrait');
      root.classList.toggle('pwa-virtual-landscape', landscape);
      last = { width, height, angle, landscape };
    }
    if (landscape && !keyboardOpen()) persist(width, height, previousSide);
  };

  const scheduleFrame = () => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      update();
    });
  };
  const orientationChanged = () => {
    // Correction immédiate au sein du gestionnaire (plus rapide qu'un
    // requestAnimationFrame seul), puis deux contrôles pour les délais WebKit.
    update();
    scheduleFrame();
    clearTimeout(settleOne);
    clearTimeout(settleTwo);
    settleOne = setTimeout(update, 64);
    settleTwo = setTimeout(update, 230);
  };
  const resized = () => {
    // L'angle peut changer avant que le viewport soit stabilisé.
    // Correction immédiate puis regroupement des petits changements.
    update();
    scheduleFrame();
  };

  // Ce premier appel se produit dans <head>, avant le CSS et avant
  // le chargement des écrans professionnels.
  update();

  window.addEventListener('orientationchange', orientationChanged, { passive: true });
  window.addEventListener('resize', resized, { passive: true });
  window.addEventListener('pageshow', orientationChanged, { passive: true });
  window.screen?.orientation?.addEventListener?.('change', orientationChanged);
  window.visualViewport?.addEventListener?.('resize', scheduleFrame, { passive: true });
  landscapeMedia.addEventListener?.('change', orientationChanged);
  media.addEventListener?.('change', orientationChanged);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') orientationChanged();
  });

  // Test/diagnostic volontairement invisible : aucune télémétrie ni requête.
  // Permet d'observer les dimensions depuis les outils de développement.
  window.__changeProPortraitDiagnostics = () => ({
    installed: installed(),
    phone: phone(),
    width: window.innerWidth,
    height: window.innerHeight,
    last: last ? { ...last } : null,
    cachedFrame: geometry ? { ...geometry } : null,
  });
})();
