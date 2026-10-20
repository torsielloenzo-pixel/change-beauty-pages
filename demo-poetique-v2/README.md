# Poétique photographique V2 — démonstration animée

URL : https://torsielloenzo-pixel.github.io/change-beauty-pages/demo-poetique-v2/

## Animation

- 3 plans de pétales en mouvement : petits pétales au loin, pétales nets à mi-distance et grandes formes floues qui passent près de la caméra.
- Chute depuis le haut, déviation par plusieurs rafales, rotation et bascule 3D, sortie du cadre par le bas. Chaque nouveau passage suit une trajectoire différente.
- Une partie des pétales est déjà visible dès l'ouverture pour ne pas attendre une boucle complète.
- CH’ANGE : pétales et voile rosé qui prolongent les fleurs de la photographie.
- NAMAJE : balayages lumineux animés suivant les lignes des cheveux, plus perceptibles au survol de « Coiffure ».
- Survol Esthétique : brise légèrement renforcée.
- Trois réglages de test : Doux, Naturel (défaut), Vent +, avec pause/reprise.
- Compatible mobile (22 pétales), sans librairie externe ; animation suspendue lorsque l'onglet est masqué.
- En mode « mouvements réduits », quelques pétales fixes remplacent l'animation.

## Intégration après validation

L'index public `index/index.html` reste inchangé.

À ajouter dans le `head` de `index/index.html`, juste après la feuille `universe-gateway.css` :

```html
<link rel="stylesheet" href="../poetic-v2.css?v=2">
```

À ajouter avant la fin du `body`, après le script de navigation d'origine :

```html
<script src="../poetic-v2.js?v=2" defer></script>
```

Le JavaScript crée automatiquement les calques visuels, sans supprimer les textes ou modifier les actions des boutons.

Réglages facultatifs en console : `window.PoeticV2.setMode('doux'|'naturel'|'vivant')`, `.pause()`, `.resume()`, `.reset()`, `.status()`.

Les boutons de test ne sont affichés que sur `/demo-poetique-v2/`.

## Limite honnête

Les pétales sont de vrais calques SVG animés par JavaScript ; la photographie originale n'est pas transformée en une vidéo 3D.