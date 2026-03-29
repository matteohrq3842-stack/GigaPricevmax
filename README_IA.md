# 🤖 README IA — App PC GigaPrice (Guidelines Claires)

Ce document explique **ce que l’IA doit construire** pour l’application PC **en se basant sur le site existant**. Il sert de cahier des charges opérationnel : l’app doit **réutiliser l’UI/UX du site**, la même base de données, et respecter les contraintes techniques actuelles.

---

## 1. Objectif Produit
Créer une **application Windows** installable (`setup.exe`) qui :
- **Affiche le site GigaPrice** (même design, mêmes pages, mêmes données).
- Ajoute **des fonctions desktop** impossibles sur navigateur (notifications, tray, Steam).
- Reste **connectée à Supabase** comme le site (pas de nouvelle base).

L’app ne remplace pas le site, elle **le prolonge**.

---

## 2. Ce que l’app doit contenir (reprendre le site)
L’IA doit **reprendre toutes les pages principales** déjà existantes dans `src/app/(site)` :

### ✅ Pages obligatoires (mêmes routes, même UI)
- **Accueil** `/` : recherche, recommandations, tendances.
- **Catégories deals** :
  - `/monnaies-jeu`
  - `/abonnements`
  - `/cartes-cadeaux`
- **Promos & tendances** :
  - `/promotions`
  - `/tendances`
- **Jeux** :
  - `/jeux/[slug]`
  - `/jeux-gratuits`
- **Hardware** :
  - `/hardware/consoles`
  - `/hardware/composants`
  - `/hardware/peripheriques`
  - `/hardware/setup-pc`
  - `/hardware/product/[id]`
- **Pages légales** :
  - `/cgv`
  - `/mentions-legales`
  - `/privacy`
  - `/politique-cookies`

### ✅ Cartes & composants à réutiliser
L’app doit **utiliser le même design** que le site :
- `DigitalDealCard`
- `ImmersiveCategory`
- `Navbar` / `Footer`
- `HeroBanner`, `GameCardGrid`, carousels

---

## 3. Source de données (ne pas inventer)
L’app doit **se connecter aux mêmes tables Supabase** que le site.

### Tables existantes déjà utilisées
- `digital_deals`
- `hardware_deals`
- `games`

### Champs critiques à respecter
Les champs ajoutés par le bot sont indispensables :
- `min_config` / `rec_config` (JSON specs PC)
- `tags` (recommandations)
- `last_update` (fraîcheur des prix)

---

## 4. Architecture recommandée (app PC)
### ✅ Choix prioritaire : Electron
L’IA doit créer une app Electron car :
- Réutilisation massive du front Next.js.
- Build Windows simple (setup.exe).

### Structure technique attendue
1. **Build statique du site**
   - `npm run build:static`
2. **Inclure le dossier `out/` dans l’app Electron**
3. **Servir `out/` localement** (via un mini serveur local intégré)
4. **Ouvrir la fenêtre Electron sur `http://localhost:<port>`**

Cette approche garde **le routing intact** et évite les bugs de `file://`.

---

## 5. Fonctionnalités Desktop à ajouter
L’app doit garder le site intact, mais ajouter des bonus Windows :

### A. Notifications
Quand un deal tombe sous X% :
- Notification native Windows.

### B. System Tray
- L’app tourne en arrière-plan.
- Raccourcis rapides (ouvrir / fermer / favoris).

### C. Steam Actions
Sur les pages `/jeux/[slug]` :
- Bouton **Activer une clé** → `steam://open/activateproduct?key=XXXX`
- Bouton **Installer via Steam** → `steam://install/<APP_ID>`

---

## 6. Packaging Windows
L’IA doit produire :
- **setup.exe**
- App installée dans `Program Files`

### Outil recommandé
- `electron-builder`

### Pipeline recommandé
1. Build Next.js statique (`out/`)
2. Copier `out/` dans les ressources de l’app
3. Builder l’exécutable Windows

---

## 7. Ce que l’IA ne doit PAS faire
- Ne pas créer une nouvelle base ou API.
- Ne pas inventer une nouvelle UI.
- Ne pas convertir le site en une SPA différente.
- Ne pas supprimer les routes existantes.

---

## 8. Résumé en 1 phrase
**Construire une app Windows qui affiche le site GigaPrice tel quel, ajoute des super-pouvoirs desktop, et reste connectée à la même base Supabase.**

