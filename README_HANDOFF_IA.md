# README — Passation IA (état du projet / travail réalisé)

Ce document sert à mettre à jour une autre IA / dev sur ce qui a été fait, pourquoi, et ce qu’il reste à faire, en suivant les principes du fichier [README_DEV_WEB.md](./README_DEV_WEB.md).

## Objectif (rappel)

Deux priorités du projet web :
1) **Monétisation** : tous les liens sortants vers les partenaires doivent être transformés en liens affiliés automatiquement.
2) **Sécurité Supabase** : l’admin/panel doit être protégé **au niveau DB** via **RLS**, avec permissions basées sur **les rôles Discord**, synchronisés dans la DB.

## Résultat : ce qui est déjà “OK”

### 1) Synchro rôles Discord (faite proprement côté serveur)

Avant : le front récupérait les rôles Discord directement côté navigateur via `session.provider_token` et les poussait dans `user_metadata.roles` (c’était pratique mais **pas conforme** à l’approche recommandée dans `README_DEV_WEB.md` pour la sécurité “réelle”).

Maintenant : une **route serveur Next.js** fait la synchro en suivant le flow du README :
- Elle lit le user connecté via Supabase (à partir de son `access_token`).
- Elle récupère son `discord_id` via l’identité Discord (`identity_data.sub`).
- Elle appelle l’API Discord (endpoint guild member) avec le token Bot (serveur).
- Elle écrit dans la table `public.discord_user_roles` en DB (delete + insert).

Fichier ajouté :
- [route.ts](file:///c:/Users/Nicolas/Downloads/GigaPricevmax-main%20(7)/GigaPricevmax-main/src/app/api/discord/sync-roles/route.ts)

Fichiers modifiés pour utiliser cette route :
- [useUserRoles.ts](file:///c:/Users/Nicolas/Downloads/GigaPricevmax-main%20(7)/GigaPricevmax-main/src/hooks/useUserRoles.ts) : appelle `POST /api/discord/sync-roles` au lieu d’appeler Discord directement.
- [price-panel/page.tsx](file:///c:/Users/Nicolas/Downloads/GigaPricevmax-main%20(7)/GigaPricevmax-main/src/app/price-panel/page.tsx) : le panel utilise `useUserRoles()` pour décider l’accès (plus `user_metadata.roles`).
- [Sidebar.tsx](file:///c:/Users/Nicolas/Downloads/GigaPricevmax-main%20(7)/GigaPricevmax-main/src/app/price-panel/components/Sidebar.tsx) : pareil.

Nettoyage :
- [SessionProvider.tsx](file:///c:/Users/Nicolas/Downloads/GigaPricevmax-main%20(7)/GigaPricevmax-main/src/components/providers/SessionProvider.tsx) : suppression de l’ancienne synchro roles côté client.

### Variables d’environnement nécessaires (serveur uniquement)

À configurer (comme dans le README) :
- `SUPABASE_SERVICE_ROLE_KEY`
- `DISCORD_BOT_TOKEN`
- `DISCORD_GUILD_ID`

Important : ne jamais exposer ces variables au navigateur.

### 2) Réécriture automatique des liens affiliés (en place)

Une fonction centrale a été ajoutée pour transformer les URLs de partenaires :
- Instant Gaming : ajout de `igr=gigapricev1xyz`
- Eneba : ajout de `af_id=<NEXT_PUBLIC_ENEBA_AFFILIATE_ID>` si la variable existe
- CDKeys : ajout de `mw_aref=<NEXT_PUBLIC_CDKEYS_AFFILIATE_ID>` si la variable existe

Code :
- [rewriteAffiliateUrl](file:///c:/Users/Nicolas/Downloads/GigaPricevmax-main%20(7)/GigaPricevmax-main/src/utils/tracker.ts#L55) dans [tracker.ts](file:///c:/Users/Nicolas/Downloads/GigaPricevmax-main%20(7)/GigaPricevmax-main/src/utils/tracker.ts)

Liens déjà branchés :
- Page détail d’un deal (bouton “Voir l’offre”) :
  - [DealClient.tsx](file:///c:/Users/Nicolas/Downloads/GigaPricevmax-main%20(7)/GigaPricevmax-main/src/app/(site)/deal/%5Bid%5D/DealClient.tsx)
- Lien externe dans le panel hardware :
  - [HardwareDeals.tsx](file:///c:/Users/Nicolas/Downloads/GigaPricevmax-main%20(7)/GigaPricevmax-main/src/app/price-panel/components/HardwareDeals.tsx)
- Catalogue hardware (bouton “Voir le lien”) :
  - [AmazonAffiliateCatalog.tsx](file:///c:/Users/Nicolas/Downloads/GigaPricevmax-main%20(7)/GigaPricevmax-main/src/components/hardware/AmazonAffiliateCatalog.tsx)

Variables d’environnement (public) optionnelles :
- `NEXT_PUBLIC_ENEBA_AFFILIATE_ID`
- `NEXT_PUBLIC_CDKEYS_AFFILIATE_ID`

Note : si ces variables ne sont pas définies, la fonction ne casse rien, elle laisse l’URL telle quelle (sauf Instant Gaming qui ajoute toujours `igr`).

### 3) Qualité : lint / typecheck / build OK

Vérifications réalisées :
- `npm.cmd install`
- `npm.cmd run lint` (OK)
- `node node_modules/typescript/bin/tsc --noEmit` (OK)
- `npm.cmd run build` (OK)

Note Windows : `npm` peut être bloqué par l’execution policy PowerShell, donc utilisation de `npm.cmd`.

## Ce qu’il reste à faire (prochaines étapes)

### A) Appliquer le SQL Supabase (tables + policies RLS)

Le code suppose que ces tables existent (cf. `README_DEV_WEB.md`) :
- `public.allowed_staff_roles`
- `public.discord_user_roles`

Et que `public.bot_deals` (ou la/les table(s) réellement utilisées par le panel) a RLS activé + policies :
- `SELECT` public (anon/authenticated)
- `INSERT/UPDATE/DELETE` réservé au staff via join `auth.identities` -> `discord_user_roles` -> `allowed_staff_roles`

À faire : copier-coller le SQL fourni dans [README_DEV_WEB.md](./README_DEV_WEB.md) dans Supabase SQL editor.

### B) Vérifier quelle(s) table(s) le panel doit protéger

Le README donne l’exemple `public.bot_deals`.
Dans ce dépôt, le site utilise déjà :
- `digital_deals` (pages catégories + `/deal/[id]`)
- `hardware_deals` (hardware + panel)

À décider : appliquer la même stratégie RLS sur `digital_deals` / `hardware_deals` si le panel modifie ces tables-là (recommandé).

### C) Ajouter un “Refresh roles” (UX)

Techniquement les rôles se synchronisent dès qu’on appelle `useUserRoles()` (panel/Sidebar).
Mais ajouter un bouton “Rafraîchir mes rôles” dans le panel peut aider quand Discord change un rôle.

### D) Couvrir plus de liens sortants (si besoin)

La réécriture affiliée est branchée sur les principaux boutons sortants (deal + hardware + panel).
Si d’autres pages ont des liens directs vers des stores (Instant/Eneba/CDKeys), les brancher sur `rewriteAffiliateUrl`.

## Notes techniques rapides

- L’endpoint `POST /api/discord/sync-roles` attend un header `Authorization: Bearer <supabase_access_token>`.
- La route utilise Supabase admin (`SUPABASE_SERVICE_ROLE_KEY`) pour :
  - `auth.getUser(accessToken)` (trouver le user)
  - écrire dans `discord_user_roles` (delete + insert)
- L’API Discord utilisée :
  - `GET https://discord.com/api/v10/guilds/{GUILD_ID}/members/{DISCORD_ID}`
  - `Authorization: Bot <DISCORD_BOT_TOKEN>`

