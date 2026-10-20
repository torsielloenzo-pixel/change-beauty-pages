# Démo — Atmosphère CH’ANGE × NAMAJE

Ouvrir `/demo-atmosphere/` pour tester l'animation, sans modifier `/index/`.

## Effets
- CH’ANGE (gauche) : pétales rose pâle qui tombent doucement.
- NAMAJE (droite) : mèches calligraphiques cuivrées flottantes.
- Les deux : quelques points lumineux très discrets.
- Trois intensités testables, plus OFF.
- Réduction automatique des effets pour `prefers-reduced-motion`.
- Aucune image tierce ou bibliothèque JavaScript supplémentaire.

## Intégration après validation
Dans `index/index.html`, placer dans `<head>`, après `universe-gateway.css` :

```html
<link rel="stylesheet" href="../universe-atmosphere.css?v=1">
```

Puis avant `</body>` :
```html
<script src="../universe-atmosphere.js?v=1" defer></script>
```

Aucun changement nécessaire dans l'HTML original des deux écrans, ni dans leur script existant. Les contrôles d'intensité sont réservés à la page de démonstration. Pour ajuster l'intensité dans la page finale, utiliser :
```js
window.ChangeAtmosphere?.setMode('subtil'); // ou 'equilibre', 'cinematique', 'off'
```

Ordre de profondeur : photo (0) → voile (1) → pétales/mèches (2) → cadre (3) → sélection/textes (4/5).
