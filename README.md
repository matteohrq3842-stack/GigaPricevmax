# 🦄 GigaPrice - L'Écosystème Ultime de Gaming Deals

> **Documentation Maître** - Ce fichier consolide l'intégralité de la documentation du projet GigaPrice (Bot, Site Web, Architecture, Stratégie).
> *Dernière mise à jour : Janvier 2026*

## 📚 Table des Matières Globale
1.  [🌟 Vision & Vue d'Ensemble](#1-vision--vue-densemble)
2.  [🏗️ Architecture Technique](#2-architecture-technique)
3.  [🤖 Bot Discord : Le Cerveau](#3-bot-discord--le-cerveau)
4.  [🌐 Site Web Next.js : La Vitrine](#4-site-web-nextjs--la-vitrine)
5.  [💰 Price Panel & Administration](#5-price-panel--administration)
6.  [💸 Stratégie "Money Maker" (Affiliation)](#6-stratégie-money-maker-affiliation)
7.  [🎮 Gamification & Systèmes Clés](#7-gamification--systèmes-clés)
8.  [🚀 Roadmap V2](#8-roadmap-v2---horizon-février-2026)
9.  [📝 Historique & Changelogs](#9-historique--changelogs)
10. [🔧 Guide Développeur & Installation](#10-guide-développeur--installation)

---

## 🚨 Mise à jour Requise : Bot & Base de Données (Janvier 2026)
**ACTION CRITIQUE POUR LE DÉVELOPPEUR BOT**

Nous avons ajouté l'affichage des configurations système (Minimale / Recommandée) sur le site. Pour que cela fonctionne dynamiquement, vous devez mettre à jour Supabase et le Bot.

### 1. Modification Supabase (SQL)
Exécutez cette requête dans votre éditeur SQL Supabase pour ajouter les colonnes nécessaires :

```sql
ALTER TABLE games 
ADD COLUMN min_config JSONB DEFAULT NULL,
ADD COLUMN rec_config JSONB DEFAULT NULL;
```

### 2. Format des Données attendu (JSON)
Le bot doit scraper les configs (ex: depuis Steam) et les insérer sous forme d'objet JSON dans ces colonnes.
**Structure JSON type :**
```json
{
  "os": "Windows 10 64-bit",
  "processor": "Intel Core i7-4790K / AMD Ryzen 5 1500X",
  "memory": "16 GB RAM",
  "graphics": "NVIDIA GeForce GTX 1060 6GB / AMD Radeon RX 580 4GB",
  "storage": "70 GB available space",
  "additional": "SSD Recommended"
}
```

---

## 1. Vision & Vue d'Ensemble
*Fusionné depuis `README_PROJECT.md`*

GigaPrice n'est pas juste un bot de promo, c'est un écosystème complet conçu pour :
1.  **Scanner** le web pour trouver les meilleurs prix de jeux vidéo (PC, PS, Xbox, Switch).
2.  **Comparer** les stores officiels (Steam...) vs Marché Gris (ActuGame, Eneba, CDKeys).
3.  **Monétiser** via l'affiliation automatique et intelligente.
4.  **Fidéliser** une communauté via de la gamification poussée (Hype Meter, VIP, Roulette).

### Stack Technique Globale
*   **Langage Backend :** Python 3.10+ (Discord.py 2.0+, Aiohttp, BeautifulSoup).
*   **Frontend :** Next.js 16 (React 19, Tailwind CSS, TypeScript, Framer Motion).
*   **Base de Données Cloud :** Supabase (PostgreSQL) -> Source de vérité unique (Deals Hardware & Digital).
*   **Base de Données Locale :** SQLite -> Cache historique pour graphiques.
*   **APIs :** Steam, QuickChart.io, Discord API.

> **Note importante :** Le code source du Bot Discord n'est pas inclus dans ce dépôt pour le moment. En revanche, le site web est déjà connecté à Supabase (lecture des deals) et le Price Panel est protégé via RLS + synchro des rôles Discord côté serveur.

---

## 2. Architecture Technique
*Fusionné depuis `README_PROJECT.md` et `README_DEV_WEB.md`*

Le projet repose sur une séparation claire des responsabilités :

### A. Cœur du Bot (Python)
*   `bot.py` : Point d'entrée. Charge les extensions (Cogs) et initialise la connexion DB.
*   `cogs/deals.py` : **Le cerveau.** Gère la boucle de scan quotidien, l'affichage des promos et la logique "Comparer".
*   `utils/affiliate.py` : **Module Critique.** Centralise la transformation des URLs en liens affiliés.
*   `utils/database.py` : Wrapper pour les appels Supabase.

### B. Flux de Données
1.  **Détection :** Le bot scanne une source (Steam API ou scraping).
2.  **Filtrage :** Vérifie si le jeu est déjà en base ou si la promo > 10%.
3.  **Enrichissement :** Récupère image, prix original. **INJECTION AFFILIATION**.
4.  **Stockage :** Sauvegarde dans Supabase (`bot_deals`).
5.  **Diffusion :** Poste dans le salon dédié (`#pc-promos`) et envoie les alertes DM.

---

## 3. Bot Discord : Le Cerveau
*Fusionné depuis `README_PROJECT.md` et `README_CHANGES.md`*

### Fonctionnalités Majeures
*   **Scraping Parallèle (Asyncio)** : Recherche simultanée sur 4 sources (Steam, IG, Eneba, CDKeys) via `asyncio.gather`.
*   **Système de Comparaison** :
    *   Au clic sur "Comparer", le bot cherche le prix "Live" sur les marchés gris.
    *   Génère un embed avec graphique comparatif et liens affiliés.
*   **Nettoyage Automatique** : Supprime de Supabase les deals vieux de plus de 3 jours.
*   **Tri Intelligent** : Analyse le titre/plateforme pour envoyer dans le bon salon (PC, Xbox, PS, Switch).

---

## 4. Site Web Next.js : La Vitrine

### Objectifs UI
*   Mettre en avant les deals en priorité.
*   Donner un accès rapide aux catégories clés.
*   Créer une identité visuelle cohérente avec le site de référence.

### Pages Clés
*   Accueil : hero, carrousels, mises en avant.
*   Catégories : monnaies, abonnements, cartes cadeaux, hardware.
*   Détails : page `/deal/[id]` avec infos produit et badges.
*   Détails jeu : page `/jeux/[slug]` (données Supabase `bot_deals` + fallback maquette).

### Langues (FR/EN) : stratégie recommandée
Pour ton cas (site de promos/jeux avec pages `/jeux/[slug]`), la meilleure stratégie en pratique :
*   Phase 1 : simple (switch FR/EN pour l’interface) → rapide, peu risqué.
*   Phase 2 : propre quand le site est stable → tu passes aux URLs `/fr` `/en` + SEO.

### Détails techniques : `/jeux/[slug]` (SSG + Supabase)
Le site est configuré pour fonctionner en **export statique** (Hostinger) et pour pré-générer les pages de jeux.

#### Points clés (à connaître)
*   **Trailing slash activé** : `next.config.ts` a `trailingSlash: true`.
    *   `/jeux/mon-slug` retourne **308** vers `/jeux/mon-slug/` (comportement normal).
*   **Routes statiques + paramètres stricts** : la page jeu utilise `dynamicParams = false`.
    *   Conséquence : si un slug n’est pas présent dans `generateStaticParams()`, la route devient **404** (même si la donnée existe en base).
*   **Limite PostgREST / Supabase** : les sélections peuvent être plafonnées (souvent **1000 lignes**).
    *   Conséquence : `limit(5000)` ne garantit pas de récupérer tous les slugs ; il faut paginer via `.range(from, to)`.

#### Incident résolu : “Jeu introuvable” / slugs valides en 404 (Janvier 2026)
Symptômes observés :
*   Certains slugs réels en base (ex: `vigor-cataclysm-commander-pack`) renvoyaient **404** sur `/jeux/<slug>/`.
*   D’autres pages affichaient “Jeu introuvable” avec le slug affiché à `undefined`.

Causes racines :
*   `generateStaticParams()` ne récupérait pas tous les slugs Supabase (plafond de lignes) → pages non pré-générées → **404**.
*   Dans certains contextes App Router, `params` peut arriver sous forme de **Promise** → `params.slug` devenait `undefined` → fallback “Jeu introuvable”.

Correctifs appliqués :
*   Pagination correcte des slugs dans `generateStaticParams()` via `.range()` avec un `pageSize` compatible.
*   Lecture robuste des paramètres : `await Promise.resolve(params)` avant normalisation du slug.
*   Centralisation de la récupération Supabase via `fetchBotDealBySlug()` + `fetchSimilarBotDeals()` (source unique côté `src/data/games.ts`).

#### Vérification rapide
*   Test “redirect trailing slash” : `/jeux/vigor-cataclysm-commander-pack` → 308 → `/jeux/vigor-cataclysm-commander-pack/`
*   Test rendu : `/jeux/vigor-cataclysm-commander-pack/` retourne 200 et affiche le titre du jeu.

### ⚠️ PRIORITÉ PRODUIT : ajouter le système Metacritic sur le site
La base expose un score Metacritic dans `bot_deals` (colonne `metacritic_score`).

Ce projet DOIT maintenant intégrer Metacritic dans la vitrine web, sinon on perd :
*   un signal qualité fort (UX),
*   un axe de tri/filtre pertinent (conversion),
*   une info “preuve sociale” utile (SEO/CTR).

À faire côté site (minimum attendu) :
*   Afficher le `metacritic_score` sur les cartes et sur la page `/jeux/[slug]`.
*   Prévoir un fallback propre si le score est absent (`null`/`0`).
*   Ajouter (à terme) un tri et/ou un filtre “Meilleurs scores”.

Stratégie de tri recommandée (hybride) :
*   Accueil / recommandations : mettre en avant les “meilleurs jeux en promo” en priorisant le Metacritic, avec un garde-fou pour éviter de remonter des offres peu intéressantes.
*   Promos : trier d’abord par intérêt de l’offre (réduction/prix), puis utiliser Metacritic comme boost à égalité.
*   Tendances : trier d’abord par fraîcheur/activité (nouveaux deals, clics/engagement), puis utiliser Metacritic comme boost à égalité.
*   Données manquantes : les `metacritic_score` absents (`null`/`0`) doivent naturellement se retrouver en bas, ou être filtrés selon le contexte.

### Brief du Site Cible (à renseigner)
*   Nom de la marque et domaine principal.
*   Logo (PNG/SVG) et favicon.
*   Palette (couleurs principales/secondaires) et typographies.
*   Catégories prioritaires à afficher.
*   Sources de données (API, scraping, tables Supabase).
*   Ton du contenu (premium, gamer, minimal, etc.).
*   Liens légaux requis (CGV, privacy, cookies).

---

## 5. Price Panel & Administration

### Accès
*   Espace réservé aux rôles Discord autorisés.
*   Gestion centralisée via Supabase.

### Fonctionnalités
*   Visualisation et tri des deals.
*   Activation/désactivation rapide des offres.
*   Vérification des données d'affiliation et badges.

### Sécurité BDD : RLS Supabase + Staff via rôles Discord (Janvier 2026)
Le panel admin est une interface. La vraie sécurité doit être au niveau Supabase (PostgreSQL) via Row Level Security (RLS).

#### Principe
*   Lecture publique sur les tables “deals” : `SELECT` autorisé à `anon` + `authenticated`.
*   Écriture “staff only” : `INSERT/UPDATE/DELETE` autorisés uniquement à `authenticated` et uniquement si l’utilisateur est staff (selon ses rôles Discord synchronisés en base).

#### Tables support (contrôle d’accès)
*   `public.allowed_staff_roles` : liste blanche des rôles Discord autorisés (1 ligne par rôle).
*   `public.discord_user_roles` : rôles courants des users (1 ligne par user+role, alimentée par la synchro serveur).
*   `public.discord_users` : 1 ligne par user Discord (username + updated_at).
*   `public.discord_staff_overview` (view) : 1 ligne par user avec `role_ids[]` + `updated_at`.

#### Endpoint de synchro rôles (côté serveur)
*   `POST /api/discord/sync-roles`
*   Le front l’appelle avec `Authorization: Bearer <supabase_access_token>`.
*   La route utilise la Service Role Key Supabase (côté serveur) + un Bot Discord pour :
    1. identifier le user connecté (provider Discord)
    2. appeler Discord `GET /guilds/{GUILD_ID}/members/{DISCORD_ID}` pour récupérer ses rôles
    3. mettre à jour `discord_users` (upsert) et `discord_user_roles` (delete + insert)

#### Debug rapide (quand “je suis connecté mais je vois rien dans Supabase”)
*   Vérifier que la route a bien été appelée (réseau navigateur) : `/api/discord/sync-roles` doit répondre 200.
*   Vérifier les données :
    ```sql
    select * from public.discord_users order by updated_at desc limit 20;
    select * from public.discord_user_roles order by updated_at desc limit 50;
    select * from public.discord_staff_overview order by updated_at desc limit 50;
    ```
*   Si `discord_users` est vide : la route ne tourne pas / erreur serveur / variables manquantes.
*   Si `discord_users` est rempli mais `discord_user_roles` est vide : Discord renvoie `roles: []` (aucun rôle assigné hors @everyone).

---

## 6. Stratégie "Money Maker" (Affiliation)

### Principes
*   Tous les liens externes passent par un module d’affiliation.
*   Normalisation des URLs et ajout des tags partenaires.
*   Tracking basique pour mesurer la conversion par source.

### Bonnes pratiques
*   Identifier clairement les liens sponsorisés.
*   Prioriser les offres avec la meilleure marge.
*   Garder des temps de chargement bas pour éviter la perte de clic.

---

## 7. Gamification & Systèmes Clés

### Leviers
*   Statuts VIP et badges communautaires.
*   Alertes personnalisées sur les deals.
*   Système de tendances et de popularité.

### Objectif
*   Augmenter la rétention et la fréquence de visite.

---

## 8. Roadmap V2 - Horizon Février 2026

*   Mise en place d’une recherche globale cross-catégories.
*   Optimisation mobile (navigation, perf, hero).
*   Personnalisation des recommandations par profil.
*   Dashboard d’analytics des conversions affiliées.
*   Intégration Metacritic sur le site (score, affichage, tri/filtre).

---

## 9. Historique & Changelogs

### Refonte Price Panel Administration Ultimate (V3) - Février 2026 - **ACTUEL**
*   **Architecture & Core (AdminShell)** :
    *   Refonte complète SPA avec Sidebar rétractable et animations Framer Motion.
    *   Thème "Dark Premium" avec boutons transparents/glow.
    *   Intégration des métadonnées Discord réelles (Avatar/Pseudo) via Supabase Auth.
*   **Module Dashboard** :
    *   KPIs temps réel connectés à Supabase (`count` optimisé).
    *   Activity Feed live depuis la table `bot_deals`.
*   **Module Jeux (SmartDeals)** :
    *   Tableau avancé avec Recherche instantanée, Pagination, et Actions (Edit/Delete).
    *   Correction de l'affichage des images (support multi-domaines via balise standard).
*   **Module Hardware** :
    *   Navigation par onglets (Setup, Composants, etc.).
    *   Grid View responsive avec fallback d'images robuste.
*   **Settings & Users** :
    *   Gestion centralisée des paramètres (Maintenance, API Public, Bot Scanner).
    *   Vue Profil Admin connectée.

### Déploiement Hostinger & pages jeux (29 Janvier 2026)
*   Passage de la page détail jeux sur `/jeux?slug=<slug>` avec redirection `.htaccess` des anciennes URLs `/jeux/<slug>`.
*   Correction de la normalisation des slugs côté client (ignore `index.txt` et variantes).
*   Recherche plus robuste du jeu (fallback par titre) pour limiter les “Jeu introuvable”.
*   Alignement du slug sur `catalog_slug` quand disponible.
*   Rebuild statique + régénération du `gigaprice_static.zip` via `zip_export.py`.
*   **État actuel :** les pages jeux ne marchent toujours pas, Matteo s’en occupe demain.

### Logos pages Nouveauté & Informations (Janvier 2026)
*   **Branding ActuGame :**
    *   Unification du branding partenaire sur “ActuGame” (pages “Nouveauté de la semaine” et “Informations”).
    *   Ajustement des tailles en responsive pour garder des proportions harmonieuses.
*   **Alignement GigaPrice :**
    *   Logo et texte GigaPrice alignés côte à côte via un layout flex.
    *   Légère réduction des tailles pour un rendu plus équilibré.

### Refonte page Informations & suppression loader (Janvier 2026)
*   Refonte visuelle complète de `/informations` en conservant le contenu existant.
*   Suppression du loader historique sur la navigation (loader neutralisé).
*   Amélioration du style du bouton de navigation par mois (ex: “Janvier 2026”).

### Refonte UI & Intégration Supabase (Janvier 2026) - **ACTUEL**
*   **Intégration Supabase Complète :**
    *   Connexion des pages "Monnaies", "Abonnements", et "Cartes Cadeaux" à la table `digital_deals`.
    *   Abandon des données mockées (fictives) au profit de données réelles dynamiques.
    *   Utilisation du hook `useAuth` pour les appels clients sécurisés.
*   **Nouvelle Expérience Utilisateur (UX/UI) :**
    *   **Layout "Store" Premium :** Refonte totale des pages catégories avec Sidebar latérale, filtres par jeu/boutique, et tri dynamique.
    *   **Page Détails Produit :** Création d'une page dédiée `/deal/[id]` pour chaque offre.
        *   Affichage immersif avec background flouté.
        *   Déduction intelligente des métadonnées (Plateforme, Région) depuis le titre.
        *   Badges de confiance et instructions d'activation.
    *   **Composant `DigitalDealCard` :** Carte unifiée avec animations Framer Motion, badges de réduction, et effets de survol.
*   **Améliorations Techniques :**
    *   Gestion des états de chargement avec `Suspense` pour éviter les erreurs d'hydratation (CSR).
    *   Support du routing dynamique pour les pages de détails.

### Mise à jour CSS & Fixes (Janvier 2026)
*   **Design des Cartes Deals :**
    *   Réduction de la hauteur globale pour un aspect plus compact.
    *   Suppression des marges internes (padding) autour des images pour qu'elles remplissent complètement le cadre.
    *   Ajustement des polices et espacements verticaux.
    *   Largeur des cartes maintenue à 240px pour une lisibilité optimale.
*   **Optimisations Techniques :**
    *   Nettoyage des composants inutilisés (BackgroundAnimations).
    *   Correction des erreurs TypeScript et ESLint (Types `any`, imports inutilisés, `ReactNode`).
    *   Correction de l'intégration `AmazonLoader` et `Navbar`.
*   **Déploiement Hostinger :**
    *   Mise à jour du script `zip_export.py` pour inclure la documentation.
    *   Vérification de la compatibilité Linux (permissions 644, forward slashes).

---

## 10. Guide Développeur & Installation

### Configuration locale (Supabase)
Créez un fichier `.env.local` à la racine du projet avec :
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
DISCORD_BOT_TOKEN=...
DISCORD_GUILD_ID=...
```
Ces valeurs se trouvent dans votre projet Supabase.

⚠️ Ne jamais commiter `.env.local` (ni exposer `SUPABASE_SERVICE_ROLE_KEY` / `DISCORD_BOT_TOKEN`). Le dépôt doit rester propre et sans secrets.

### Lancer le serveur local
```bash
npm run dev
```
Si PowerShell bloque `npm`, utilisez :
```bash
npm.cmd run dev
```

### Création du Build Statique (Windows)
Pour générer le dossier `out` compatible avec Hostinger :

1.  Ouvrez un terminal dans `web-nextjs`.
2.  Lancez la commande :
    ```bash
    npm run build:static
    ```
3.  Une fois terminé, lancez le script Python pour créer l'archive ZIP :
    ```bash
    python zip_export.py
    ```
4.  Le fichier `gigaprice_static.zip` sera créé à la racine. C'est ce fichier qu'il faut uploader sur Hostinger.

### Commandes Utiles
*   `npm run dev` : Lancer le serveur de développement.
*   `npm run lint` : Vérifier les erreurs de code.
*   `npm run build:static` : Construire le site statique (Windows workaround).

---

## 11. Déploiement & Dépannage

### Déploiement sur Hostinger
Pour déployer la version statique du site sur Hostinger (ou tout hébergement partagé) :
1. Consultez le guide détaillé : [DEPLOY_INSTRUCTIONS.md](./DEPLOY_INSTRUCTIONS.md)
2. Utilisez le script `python zip_export.py` pour générer une archive compatible.

### Gestion des Erreurs
Une liste des erreurs courantes (Build, Lint, Runtime) et leurs solutions est maintenue dans :
*   [ERRORS.md](./ERRORS.md)

---

## 12. GitHub : push depuis un dossier “zip” (si `.git` manquant)
Si tu as récupéré le projet via un ZIP (donc sans historique Git), suis le guide :
*   `instructions_git_ia.md` (procédure “Re-init & Force Push”)

Objectif : faire du dossier local la source de vérité et pousser sur le dépôt GitHub.
