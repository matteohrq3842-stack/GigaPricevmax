# Contrat de données : Bot Discord ↔ Site (Supabase + CockroachDB)
Ce fichier décrit le contrat minimal des données **à lire côté site** et **à écrire côté bot**.

Changement majeur : le catalogue n’est plus dans Supabase.

## Architecture (nouvelle)
Le bot écrit dans 2 bases distinctes :
- **Supabase (Postgres)** : `public.bot_deals` (deals actifs, volatils, nettoyés).
- **CockroachDB (Postgres compatible)** : `games_catalog` (catalogue persistant : recherche/suggestions + pages `/jeux/[slug]`).

Conséquence côté site :
- Il faut **2 connexions** (Supabase + CockroachDB).
- Il n’y a **pas de JOIN SQL cross-base** possible : les “EN PROMO” se font par requêtes séparées + merge côté backend/site.

## Références code (bot)
- [DealsCog._ensure_games_catalog_for_deal](file:///c:/Users/matte/Downloads/archive-2026-01-23T164045Z/cogs/deals.py#L467-L660)
- [DealsCog._games_catalog_backfill_loop](file:///c:/Users/matte/Downloads/archive-2026-01-23T164045Z/cogs/deals.py#L1957-L2160)
- [Admin.catalog_focus](file:///c:/Users/matte/Downloads/archive-2026-01-23T164045Z/cogs/admin.py#L621-L705)
- [database.py (catalog helpers CockroachDB)](file:///c:/Users/matte/Downloads/archive-2026-01-23T164045Z/utils/database.py)
- [fetch_igdb_metadata](file:///c:/Users/matte/Downloads/archive-2026-01-23T164045Z/utils/metadata.py#L137-L310)
- [fetch_igdb_games_page](file:///c:/Users/matte/Downloads/archive-2026-01-23T164045Z/utils/metadata.py#L313-L377)
- [igdb_game_to_catalog_row](file:///c:/Users/matte/Downloads/archive-2026-01-23T164045Z/utils/metadata.py#L380-L478)

## 1) Supabase : bot_deals (volatil)
Table : `public.bot_deals`

Attendu par le site :
- Identité deal : `game_id`, `title`, `url`, `platform`, `store`
- Lien deal → jeu : `igdb_id` (priorité) et/ou `catalog_slug` (fallback)
- Prix : `current_price`, `original_price`, `discount`
- Média : `image_url`, `extra_images`, `hero_image_url`
- Texte : `description_fr`, `release_date`
- Trailers : `trailer_url` + champs dérivés (`trailer_provider`, `trailer_mp4_url`, `trailer_youtube_id`, `trailer_embed_url`)
- Score : `metacritic_score`
- Fraîcheur : `created_at`, `updated_at`
- Plateforme détaillée : `platform_exact`

Nettoyage :
- Les deals de plus de 3 jours sont supprimés automatiquement, donc `bot_deals` n’est pas un historique long terme.

### SQL (mise à niveau bot_deals)
```sql
alter table public.bot_deals
  add column if not exists igdb_id bigint,
  add column if not exists catalog_slug text,
  add column if not exists extra_images text[] default '{}'::text[],
  add column if not exists hero_image_url text,
  add column if not exists platform_exact text,
  add column if not exists description_fr text,
  add column if not exists config_minimum text,
  add column if not exists config_recommended text,
  add column if not exists release_date date,
  add column if not exists trailer_provider text,
  add column if not exists trailer_mp4_url text,
  add column if not exists trailer_youtube_id text,
  add column if not exists trailer_embed_url text,
  add column if not exists steam_last_updated text,
  add column if not exists steam_patchnotes_last_at text,
  add column if not exists steam_patchnotes_last_title text,
  add column if not exists steam_patchnotes_last_url text;

create index if not exists idx_bot_deals_igdb_id on public.bot_deals (igdb_id);
create index if not exists idx_bot_deals_catalog_slug on public.bot_deals (catalog_slug);
create index if not exists idx_bot_deals_created_at on public.bot_deals (created_at);
create index if not exists idx_bot_deals_updated_at on public.bot_deals (updated_at);
```

## 2) CockroachDB : games_catalog (persistant)
Table : `games_catalog` (dans CockroachDB)

Source de vérité : IGDB.

Règles :
- `igdb_id` est l’identifiant stable (clé primaire).
- `slug` est stable et unique (sert aux URLs du site : `/jeux/[slug]`).
- Le bot peut ré-upserter sans risque (upsert sur `igdb_id`).
- Les champs “listes” sont stockés en **JSON texte** (`'[]'`) pour rester simples côté bot et côté site.

### Schéma CockroachDB
```sql
create table if not exists games_catalog (
  igdb_id bigint primary key,
  slug string not null unique,
  igdb_slug string,
  name string not null,
  description_fr string,
  release_date string,
  trailer_url string,
  cover_image string,
  hero_image string,

  screenshots string not null default '[]',
  platforms string not null default '[]',
  genres string not null default '[]',
  keywords string not null default '[]',
  themes string not null default '[]',
  game_modes string not null default '[]',

  min_config_raw string,
  rec_config_raw string,
  match_confidence float8,
  updated_at string,
  last_update string
);

create index if not exists idx_games_catalog_slug on games_catalog (slug);
create index if not exists idx_games_catalog_name on games_catalog (name);
```

### Connexion (site)
Le site doit pouvoir lire `games_catalog` via une URL Postgres (stockée côté serveur) :
- `CATALOG_DATABASE_URL` (recommandé) ou `DATABASE_URL`
- Format : `postgresql://user:password@host:26257/defaultdb?...`

## 3) Pipeline bot (quand un deal est trouvé)
1. Normaliser le deal (prix, store, plateforme, images, texte).
2. Match IGDB (par titre + plateformes si possible) pour obtenir `igdb_id` + médias + tags/keywords.
3. Upsert `games_catalog` dans **CockroachDB** sur `igdb_id` (garantit qu’un jeu existe même hors promo).
4. Upsert `public.bot_deals` dans **Supabase** sur `game_id` en écrivant aussi `igdb_id` et `catalog_slug`.

## 4) Slug (stable/unique pour `/jeux/[slug]`)
Règles recommandées :
- Si un `slug` existe déjà pour un `igdb_id`, le réutiliser (stabilité).
- Sinon :
  - Base : `igdb_slug` si dispo, sinon slugify(`name`).
  - Normalisation : lowercase, tirets, suppression accents/ponctuation, trim.
  - Unicité : si collision, suffixer `-{igdb_id}`.

## 5) Recherche côté site (nouveau flow)
Objectif : suggestions (typeahead) + résultats qui mélangent “en promo” et “hors promo”.

Comme `bot_deals` est dans Supabase et `games_catalog` dans CockroachDB, il faut faire :
1. **Recherche principale dans CockroachDB** : `games_catalog` (par `name` et/ou `slug` + filtres côté backend si besoin).
2. **Récupérer l’état promo dans Supabase** :
   - priorité : `bot_deals.igdb_id IN (liste des igdb_id)`
   - fallback : `bot_deals.catalog_slug IN (liste des slug)` si `igdb_id` manquant
3. **Fusion côté backend** : marquer “EN PROMO” et injecter les champs deal (prix, store, etc.) si présent.

### Règle d’or (site)
Le site doit toujours considérer ces données comme 2 sources séparées :
- **Source A (CockroachDB)** : vérité “jeu” (`games_catalog`) → nom/slug/médias/tags/descriptions.
- **Source B (Supabase)** : vérité “promo” (`bot_deals`) → prix/discount/store/disponibilité actuelle.

Il ne faut pas chercher à “relier” les deux par SQL. Le lien se fait uniquement côté backend via des clés.

### Clés de rapprochement (merge)
1) **Clé principale** : `igdb_id`
- Le site doit privilégier `igdb_id` pour relier un deal à un jeu.
- Si `igdb_id` est présent, c’est la meilleure clé (stable).

2) **Clé fallback** : `catalog_slug`
- À utiliser seulement quand `igdb_id` n’est pas présent dans le deal.
- Le slug sert aussi aux URLs `/jeux/[slug]`.

### Merge recommandé (pseudo-flow)
Cas “recherche / suggestions / liste de jeux”
1) Requête CockroachDB : récupérer une liste de jeux (igdb_id, slug, name, images…).
2) Construire deux listes :
   - `ids = [igdb_id...]` non nuls
   - `slugs = [slug...]` non vides
3) Requête Supabase `bot_deals` :
   - priorité : `igdb_id IN ids`
   - fallback (uniquement pour les jeux sans igdb_id) : `catalog_slug IN slugs`
4) Construire un dictionnaire des deals :
   - `deals_by_igdb_id[igdb_id] = deal`
   - `deals_by_slug[slug] = deal` (fallback)
5) Pour chaque jeu de `games_catalog` :
   - si `igdb_id` match → marquer `is_on_sale=true` + injecter les champs deal (prix/store/discount/url)
   - sinon si `slug` match (fallback) → idem
   - sinon → `is_on_sale=false`

Cas “page jeu /jeux/[slug]”
1) Requête CockroachDB : `SELECT * FROM games_catalog WHERE slug = $slug LIMIT 1`
2) Si trouvé : récupérer `igdb_id` puis requêter Supabase :
   - `bot_deals.igdb_id = igdb_id` (priorité)
   - sinon `bot_deals.catalog_slug = slug` (fallback)
3) Merge et afficher “EN PROMO” si un deal actif existe.

Notes :
- `metacritic_score` peut être `NULL`/`0` = “inconnu” : ne pas bloquer la recherche, juste trier plus bas.
- Les champs JSON (platforms/genres/…) dans `games_catalog` sont du texte JSON : à parser côté backend si tu veux filtrer/afficher proprement.

## 6) Backfill catalogue (focus IGDB)
- Crawler IGDB par `igdb_id` croissant : `where id > after_id`, `order id asc`, `limit N`.
- Stocker un curseur `after_id` pour reprise.
- Recommandation : `page_size` 200–500, concurrence 4–8, pause légère entre pages.

## 7) Sécurité (site)
- Les identifiants CockroachDB (user/password dans l’URL) doivent rester côté serveur (backend / API).
- Ne jamais exposer cette URL (ni le password) dans le frontend.

## 8) Checklist (validation rapide)
- 1. Supabase OK : `bot_deals` existe et reçoit des deals.
- 2. CockroachDB OK : `games_catalog` existe et reçoit des lignes (igdb_id/slug/name).
- 3. Un deal crée/maj une ligne `games_catalog` (CockroachDB) + `bot_deals` (Supabase).
- 4. Le backfill `games_catalog` progresse (curseur `igdb_id` qui monte).
- 5. `bot_deals` se nettoie (deals > 3 jours supprimés).
- 6. La recherche/suggestions renvoient des jeux hors promo (depuis CockroachDB).
- 7. Le badge “EN PROMO” apparaît via merge (Supabase) sur `igdb_id` / fallback `catalog_slug`.
