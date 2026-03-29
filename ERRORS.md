# État du Projet et Instructions de Correction

## 🟢 État Actuel
- **Build TypeScript** : ✅ **SUCCÈS** (Plus aucune erreur de compilation). Le site peut être construit (`npm run build`).
- **Fonctionnalités** :
  - Les pages Hardware (Composants, Consoles, Périphériques, Setup) fonctionnent avec le nouveau `AmazonLoader`.
  - L'authentification Supabase est configurée.
  - Le design des cartes a été ajusté (hauteur réduite, image remplissant le cadre).

## 🟠 Erreurs Restantes (Linting)
Il reste environ **60 avertissements ESLint** qui n'empêchent pas le build mais qui devraient être corrigés pour la propreté du code :

1.  **Images non optimisées** (`@next/next/no-img-element`) :
    - Utilisation de balises `<img>` standard au lieu du composant `<Image />` de Next.js.
    - *Impact* : Performance (LCP).
    - *Fichiers concernés* : `AmazonLoader.tsx`, `AmazonAffiliateCatalog.tsx`.

2.  **Variables inutilisées** (`@typescript-eslint/no-unused-vars`) :
    - Des variables déclarées mais non utilisées (ex: `e`, `signOut`, `setIsLoading`).
    - *Fichiers concernés* : `Navbar.tsx`, `useUserRoles.ts`, `AmazonLoader.tsx`.

3.  **Dépendances useEffect manquantes** (`react-hooks/exhaustive-deps`) :
    - *Fichiers concernés* : `AmazonLoader.tsx`, `BackgroundAnimation.tsx`.

## 🚀 Instructions de Déploiement (Hostinger)

Pour déployer sur un hébergement statique (comme Hostinger) :

1.  **Générer le build statique** :
    Ouvrez un terminal dans `web-nextjs` et lancez :
    ```bash
    npm run build:static
    ```
    *(Cette commande utilise un workaround pour Windows pour éviter les problèmes de droits PowerShell)*

2.  **Créer l'archive ZIP** :
    Une fois le build terminé (dossier `out` créé), lancez :
    ```bash
    python zip_export.py
    ```
    Cela va créer un fichier `gigaprice_static.zip` à la racine du projet.

3.  **Upload** :
    - Connectez-vous à votre panel Hostinger -> File Manager -> public_html.
    - Uploadez `gigaprice_static.zip`.
    - Faites un clic droit -> Extract.
    - Assurez-vous que les fichiers sont bien dans `public_html` (et pas dans un sous-dossier).

## 🛠️ Commandes Utiles
- `npm run dev` : Lancer le serveur local.
- `npm run lint` : Voir la liste détaillée des erreurs de style.
- `git push` : Envoyer les modifications sur GitHub.
