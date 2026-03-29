# Intégration Site Web GigaPrice (Documentation Technique)

Ce document explique comment le Site Web doit utiliser les données fournies par le Bot Discord (via Supabase).

## 1. Tables de Données Principales

### Table `bot_deals` (Promotions Actives)
C'est la table principale pour l'affichage des bons plans.
- **Identifiants** : `game_id` (UUID), `title`, `url` (Lien affilié).
- **Prix** : `current_price`, `original_price`, `discount` (%).
- **Visuels Premium** :
    - `image_url` : Image de couverture standard.
    - `hero_image_url` : Grande bannière (Hero) HD pour le fond de page.
    - `logo_url` : Logo transparent du jeu.
    - `extra_images` : **JSON Array** de liens pour galerie/slider.
- **Données Techniques** (Enrichies) :
    - `metacritic_score` : Note 0-100.
    - `official_release_date` : Date de sortie ISO.
    - `min_config` / `rec_config` : **JSONB Objects** (`os`, `processor`, `memory`, `graphics`, `storage`).
    - `platform_exact` : Nom précis (ex: "PlayStation 5").

### Table `games_catalog` (Référentiel Complet)
Contient 350k+ jeux (même sans promo) avec descriptions traduites par DeepL (`description_fr`).

---

## 2. Logique des Pages & Flux

### A. Page "Nouveautés" (Flux Mixte)
Combiner `bot_deals` (bons plans récents) et `games_catalog` (nouveaux ajouts).
- **Critère** : `release_date` ou `official_release_date` < 30 jours.
- **Badge "NOUVEAU"** : Visible pendant 30 jours après `created_at`.
- **Fallback Mots-clés** : Si date manquante, chercher : *"Sortie", "Dispo", "New", "Launch"*.

### B. "Jeux à Venir" / "Précommandes"
- **Source** : `bot_deals`.
- **Filtre** : `official_release_date` > Date du jour.
- **Tri** : `official_release_date ASC` (Le plus proche en premier).
- **Badge "PRÉCOMMANDE"** : Tant que la date est dans le futur.
- **Fallback Mots-clés** : *"Précommande", "Pre-order", "Bientôt disponible", "Coming Soon"*.

### C. "Sorties du Mois" (Day One)
- **Filtre** : `official_release_date` < Maintenant ET > (Maintenant - 30 Jours).
- **Tri** : `official_release_date DESC`.
- **Badge "NOUVELLE SORTIE"** : Pendant 30 jours après la sortie.

---

## 3. Gestion des Médias (Optimisation)

### Vidéos (Trailers)
*   **Vidéos FTP (`trailer_url` contient `gigaprice.fr`)** : Vidéos optimisées hébergées sur Hostinger. Utiliser `<video controls>`.
*   **Vidéos Externes** : Liens YouTube/IGDB. Utiliser un Iframe.

### Nettoyage Automatique
Le bot supprime les vidéos orphelines du FTP tous les 3 jours pour économiser de l'espace. Le site ne doit jamais stocker de vidéos localement, il doit lire celles du FTP pointées par la DB.

---

## 4. News & Maintenance

*   **News** : Table `actu_gaming` (Titre, Desc, Image, Source, Date). Tri par `published_at DESC`.
*   **Maintenance Bot** : 
    - `/admin_catalog_sync` : Pour les nouveautés et traductions.
    - `/catalog_focus` : Pour les configurations PC et scores Metacritic.
    - `/admin_unlock_scan` : Pour forcer le déblocage du scan en cas de freeze.

---
*Dernière mise à jour : 04/02/2026 (Logiciel v2.5 - Full Logic & Enrichment)*
