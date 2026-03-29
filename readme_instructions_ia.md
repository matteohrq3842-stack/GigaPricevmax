## Instructions IA — GigaPrice (Web Next.js + Supabase + Discord)

### Objectif
- Maintenir un site Next.js connecté à Supabase (lecture publique des deals) avec un Price Panel réservé au staff Discord, sécurisé côté base via RLS.

### Commandes (Windows)
- Si PowerShell bloque `npm`, utiliser `npm.cmd` : `npm.cmd run dev`, `npm.cmd run lint`, `npm.cmd run build`.

### Variables d’environnement
- Public (front) : `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Serveur uniquement : `SUPABASE_SERVICE_ROLE_KEY`, `DISCORD_BOT_TOKEN`, `DISCORD_GUILD_ID`.
- Ne jamais exposer `SUPABASE_SERVICE_ROLE_KEY` / `DISCORD_BOT_TOKEN` côté client.
- Le dépôt ignore `.env*` via `.gitignore` (ne pas commit les secrets).

### Sécurité Supabase (RLS)
- Les tables “deals” doivent permettre `SELECT` public (`anon`, `authenticated`).
- Les écritures doivent être “staff only” (`authenticated` + condition staff).
- La condition staff doit s’appuyer sur des tables support synchronisées depuis Discord :
  - `public.allowed_staff_roles` (rôles autorisés)
  - `public.discord_user_roles` (user+role)
  - `public.discord_users` (1 ligne par user : `discord_id`, `username`, `updated_at`)
  - `public.discord_staff_overview` (view : 1 ligne par user, `role_ids[]`, `updated_at`)
- Éviter de référencer directement `auth.identities` dans les policies (risque `42501 permission denied`). Préférer une fonction `SECURITY DEFINER` si besoin.

### Synchro rôles Discord (serveur)
- Endpoint : `POST /api/discord/sync-roles`
- Entrée : header `Authorization: Bearer <supabase_access_token>`
- Rôle :
  - Identifier l’utilisateur via `admin.auth.getUser(accessToken)`
  - Récupérer `discord_id` via l’identité Discord (provider)
  - Appeler Discord `GET /guilds/{GUILD_ID}/members/{DISCORD_ID}` avec le token Bot
  - Upsert `public.discord_users` (discord_id, username/global_name, updated_at)
  - Remplacer `public.discord_user_roles` (delete + insert)

### Cache front (important)
- Le hook `useUserRoles()` utilise un cache local, mais doit continuer à appeler `/api/discord/sync-roles` en arrière-plan pour maintenir la DB à jour.

### Debug rapide
- Si “connecté mais rien dans Supabase” :
  - Vérifier que `/api/discord/sync-roles` répond 200 (Network).
  - SQL :
    - `select * from public.discord_users order by updated_at desc limit 20;`
    - `select * from public.discord_user_roles order by updated_at desc limit 50;`
    - `select * from public.discord_staff_overview order by updated_at desc limit 50;`
