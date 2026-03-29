# GigaPrice - Comparateur de Prix Gaming 🎮

Bienvenue sur le projet **GigaPrice**, une application web moderne développée avec Next.js pour comparer les prix des jeux vidéo, accéder à des abonnements à prix réduit (Spotify, Netflix, etc.) et participer à des giveaways communautaires.

## 🌟 Fonctionnalités Principales

-   **🔍 Comparateur Intelligent** : Recherche instantanée et affichage des meilleures offres pour les jeux PC et consoles.
-   **📉 Page Offres / Promotions** : Une page “offres” (maquette) avec recherche, catégories et cartes cliquables.
-   **💎 Abonnements & Services** : Liste complète des services (Spotify, Discord Nitro, etc.) avec filtrage par catégorie.
-   **🎁 Espace Giveaways** : Section dédiée aux jeux gratuits et événements communautaires via Discord.
-   **🕹️ Page Détail Jeu** : Page complète par jeu (description, dates, images, jeux similaires).
-   **🎨 Design Immersif** :
    -   Animation de fond interactive (Canvas) persistante.
    -   Transitions de pages fluides.
    -   Thème sombre moderne avec effets de verre (Glassmorphism).
-   **📱 100% Responsive** : Interface optimisée pour mobiles, tablettes et desktops.

## 🛠 Stack Technique

-   **Framework** : [Next.js 16.1.1](https://nextjs.org/) (App Router, Turbopack)
-   **Moteur UI** : [React 19](https://react.dev/)
-   **Langage** : TypeScript
-   **Styles** : CSS3 Moderne (Variables, Flexbox/Grid, Animations)
-   **Icônes** : React Icons (`fa` - FontAwesome)
-   **Animation** : HTML5 Canvas & CSS Keyframes

## 📁 Structure du Projet

Le projet suit l'architecture **App Router** de Next.js :

-   **`src/app`** : Pages et logique de routage.
    -   `page.tsx` : Page d'accueil (Search Bar & Suggestions).
    -   `promotions/` : Page “offres” (maquette) avec recherche + catégories (cartes cliquables).
    -   `tendances/` : Page tendances (grille 4 colonnes sur desktop).
    -   `jeux/[slug]/` : Page détail jeu (infos + galerie + similaires).
    -   `abonnements/` : Page des services (Netflix, etc.).
    -   `game-keys/` & `jeux-gratuits/` : Pages communautaires.
    -   `template.tsx` : Gestion des transitions de page (Fade-in).
    -   `layout.tsx` : Structure globale (Navbar, Footer, Background).
    -   `globals.css` : Styles globaux, thèmes et animations.
-   **`src/components`** : Composants UI réutilisables.
    -   `Navbar.tsx` : Barre de navigation responsive.
    -   `Footer.tsx` : Pied de page complet.
    -   `BackgroundAnimation.tsx` : Animation de fond (vagues/étoiles).
-   **`src/data`** : Données maquette (jeux, tags, helpers).
    -   `games.ts` : Source de vérité des jeux (tendances + offres + pages détail).
-   **`public/images`** : Assets statiques (Logos, Icônes).

## 🚀 Installation et Lancement

### Prérequis
-   Node.js 18+ installé.

### Installation

1.  **Cloner le projet** (si nécessaire) ou accéder au dossier.
2.  **Installer les dépendances** :
    ```bash
    npm install
    ```

### Lancement du Serveur

Pour démarrer l'application en mode développement :

```bash
npm run dev
```

> **Note pour les utilisateurs Windows (PowerShell)** :
> Si vous rencontrez des erreurs de politique d'exécution avec `npm` ou `npx`, utilisez la commande directe :
> ```powershell
> node node_modules/next/dist/bin/next dev
> ```

Ouvrez ensuite [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 🐛 Dépannage Courant

-   **Erreur "Execution Policy"** : Voir la note ci-dessus pour lancer via `node`.
-   **Port 3000 utilisé** : Le serveur tentera d'utiliser un autre port ou vous pouvez tuer le processus Node existant via le Gestionnaire des tâches.
-   **Cache/Build incorrect** : Supprimez le dossier `.next` et relancez le serveur pour forcer une recompilation propre.

## 🔄 Dernières Mises à Jour (Changelog)

### UI/UX & Design
-   **AmazonLoader** : Ajustement de la taille du logo (150px) pour l'aligner visuellement avec celui de GigaPrice.
-   **Page Promotions** : Correction du padding supérieur (160px) pour éviter le chevauchement du titre "OFFRE DU JOUR" avec la barre de navigation.
-   **Tendances** : Header “Tendances ›” (style Instant Gaming) et grille plus dense (4 colonnes).
-   **Détail jeu** : Nouvelle mise en page pro (hero + cover + meta + galerie + similaires).
-   **Navbar** :
    -   Promotions retiré des liens du haut et replacé en bouton principal.
    -   Rectangle central plus arrondi.
    -   Liens du haut redimensionnés et espacement ajusté.
    -   Suppression du fond derrière les liens du haut.
    -   Masquage des liens du haut au scroll.

### Fonctionnalités & Admin
-   **Price Panel** :
    -   Ajout de la colonne **"Catégorie"** dans le tableau de modération.
    -   Mise à jour du composant `ModerationRow` pour supporter l'affichage des catégories (RPG, Sport, etc.).
    -   Préparation pour l'intégration des données du Bot Scanner.

### Juridique & Conformité (RGPD)
-   **Cookie Consent Modal** :
    -   Correction de l'ordre des boutons : "Personnaliser" (gauche), "Tout refuser" (milieu), "Tout accepter" (droite).
    -   Correction du lien "En savoir plus" : ouverture dans un nouvel onglet (`target="_blank"`) pour ne pas perdre le contexte du popup.
    -   Logique d'hydratation corrigée (suppression de l'erreur rouge `Hydration failed` liée au localStorage).
    -   Style : Suppression du doublon de lien et nettoyage visuel.
-   **Page Politique Cookies** :
    -   Refonte complète du design pour correspondre à la page "Mentions Légales" (fond sombre `#1a1a1a`, typographie centrée, lisibilité accrue).
    -   Suppression du fond violet incorrect.

### Homepage (Accueil)
-   **Carousel Recommandations** : Ajout d'une nouvelle section "🔥 Recommandations" entre les "Suggestions de la semaine" et les "Tendances", avec un carousel interactif dédié (nouveaux jeux : Helldivers 2, Palworld, RDR2...).

### Backend & Infrastructure
-   **Supabase (En cours)** : Compte Supabase existant (déjà lié au bot Discord et version beta). Prochaine étape : migration des données statiques vers la base de données Supabase.

### Maquette “Jeux”
-   **Données centralisées** : ajout de `src/data/games.ts` (slugs, images, description, dates, tags).
-   **Page Offres** : `/promotions` liste tous les jeux maquette, filtrables, et cliquables vers le détail.
-   **Page Détail** : `/jeux/[slug]` affiche infos complètes + jeux similaires + accès Tendances.

## 📝 Auteur

Projet développé pour **GigaPrice**.
