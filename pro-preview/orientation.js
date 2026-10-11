/* Ch’ange Pro — portrait virtuel (PWA installée uniquement).
   Aucune demande d'accès capteur, aucun verrouillage natif fictif.
   La rotation physique peut être compensée lorsque WebKit expose l'orientation. */
(() => {
  'use strict';
  const root = document.documentElement;
  const viewportApp = document.getElementById('app');
  if (!viewportApp) return;

  const standaloneQuery = window.matchMedia('(display-mode: standalone)');
  const isInstalled = () => standaloneQuery.matches || window.navigator.standalone === true;
  const isPhoneSize = () => {
    const screenMin = Math.min(
      Number(window.screen?.width) || window.innerWidth,
      Number(window.screen?.height) || window.innerHeight,
    );
    return screenMin < 650;
  };
  const angleNumber = (n) => Number.isFinite(n) ? ((n % 360) + 360) % 360 : null;
  const isInputActive = () => {
    const el = document.activeElement;
    return el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName);
  };
  const candidates = () => {
    const legacy = typeof window.orientation === 'number' ? angleNumber(window.orientation) : null;
    const modern = typeof window.screen?.orientation?.angle === 'number'
      ? angleNumber(window.screen.orientation.angle) : null;
    return [legacy, modern].filter((v) => v !== null);
  };
  const orientationAngle = (landscape) => {
    const supported = candidates().filter(a => landscape ? (a === 90 || a === 270) : (a === 0 || a === 180));
    if (supported.length) return supported[0];
    // En l'absence d'angle exploitable, le navigateur fournit parfois seulement
    // le rapport largeur/hauteur. Une direction positive est une approximation.
    return landscape ? 90 : 0;
  };

  let last = null;
  let raf = 0;
  let settling = 0;

  const clearSimulation = () => {
    root.classList.remove('pwa-virtual-portrait', 'pwa-virtual-landscape');
    root.style.removeProperty('--pwa-portrait-width');
    root.style.removeProperty('--pwa-portrait-height');
    root.style.removeProperty('--pwa-counter-angle');
    last = null;
  };

  const update = () => {
    raf = 0;
    // Le vrai site dans Safari n'est jamais contraint.
    if (!isInstalled() || !isPhoneSize()) { clearSimulation(); return; }

    const physicalWidth = window.innerWidth;
    const physicalHeight = window.innerHeight;
    const isLandscape = physicalWidth > physicalHeight;
    const angle = orientationAngle(isLandscape);

    // Le mode portrait normal n'a ni position fixed ni rotation supplémentaire.
    if (!isLandscape && angle !== 180) { clearSimulation(); return; }

    let width = isLandscape ? physicalHeight : physicalWidth;
    let height = isLandscape ? physicalWidth : physicalHeight;

    // Les ouvertures de clavier peuvent modifier la hauteur disponible sans
    // rotation réelle. Garder le cadre précédemment calculé durant la saisie.
    if (last && last.angle === angle && last.landscape === isLandscape && isInputActive()) {
      width = last.width;
      height = last.height;
    }

    // Évite les recalculs de styles inutiles durant les changements de viewport.
    if (last && last.width === width && last.height === height &&
        last.angle === angle && last.landscape === isLandscape) return;

    root.style.setProperty('--pwa-portrait-width', width + 'px');
    root.style.setProperty('--pwa-portrait-height', height + 'px');
    root.style.setProperty('--pwa-counter-angle', (-angle) + 'deg');
    root.classList.add('pwa-virtual-portrait');
    root.classList.toggle('pwa-virtual-landscape', isLandscape);
    last = { width, height, angle, landscape: isLandscape };
  };

  const schedule = () => {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(update);
    clearTimeout(settling);
    settling = setTimeout(update, 240);
  };

  update();
  window.addEventListener('orientationchange', schedule);
  window.addEventListener('resize', schedule);
  window.addEventListener('pageshow', schedule);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') schedule();
  });
  window.screen?.orientation?.addEventListener?.('change', schedule);
  window.visualViewport?.addEventListener?.('resize', schedule);
  standaloneQuery.addEventListener?.('change', schedule);
})();
