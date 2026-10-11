# Ch’ange — vitrine publique et accès professionnel

Site statique hébergé sur GitHub Pages. Espace professionnel accessible via `gestion.html`, authentifié par Supabase Auth dans le projet indépendant `change-beauty-dev` (`xhahganhwgygmwuckrak`). Aucune clé secrète n'est embarquée. Les autorisations sont vérifiées par les politiques RLS de la base de données, et la gestion des comptes passe par une Edge Function avec jeton obligatoire.

**Important :** le site public fonctionne, mais l'espace gestion n'est utilisable qu'après attribution vérifiée du premier Administrateur. Les rendez-vous n'ont pas été ouverts à la réservation publique. L'inscription libre n'est pas proposée.

La source professionnelle (fonctions Edge et migrations) reste dans le dépôt privé `change-beauty-app`.
