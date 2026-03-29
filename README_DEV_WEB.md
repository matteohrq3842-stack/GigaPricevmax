# 💻 GUIDE D'IMPLÉMENTATION - SITE WEB GIGAPRICE
> **Destinataire :** Développeur Web
> **Objectif :** Maximiser la rentabilité du projet via l'affiliation et le SEO.

## 1. Stratégie de Monétisation (PRIORITÉ ABSOLUE)
Le site n'est pas juste une vitrine, c'est une **machine à générer des clics affiliés**.
Toute sortie d'utilisateur vers une boutique externe (Instant Gaming, Eneba, CDKeys) DOIT être tracée.

### A. Transformation Automatique des Liens (Affiliation)
Tous les boutons "Acheter" ou "Voir l'offre" doivent passer par un script qui ajoute les IDs affiliés.
Ne jamais mettre de lien brut vers Steam ou Instant Gaming.

**Logique à implémenter sur tous les liens sortants :**

1.  **Instant Gaming** (Partenaire Principal) :
    *   Ajouter `?igr=gamer-09739a3` à la fin de l'URL.
    *   *Exemple :* `https://www.instant-gaming.com/fr/jeux/123-jeu` devient `https://www.instant-gaming.com/fr/jeux/123-jeu?igr=gamer-09739a3`
2.  **Eneba** :
    *   Ajouter `?af_id=VOTRE_ID_ENEBA` (ID à demander à Nicolas).
3.  **CDKeys** :
    *   Ajouter `?mw_aref=VOTRE_ID_CDKEYS` (ID à demander à Nicolas).

### B. La "Cookie Planting Strategy"
L'objectif est de poser le cookie affilié dans le navigateur du visiteur le plus tôt possible.
*   Si l'utilisateur clique sur un lien, le cookie est valide 30 jours.
*   S'il achète n'importe quoi d'autre 20 jours plus tard, **on touche la commission**.

---

## 2. Architecture SEO : "Le Puits à Pétrole" 🛢️
Le site doit capter le trafic Google sur les requêtes "Jeu X pas cher".

### Structure des Pages Dynamiques
Il faut une page unique par jeu (générée dynamiquement).
*   **URL :** `gigaprice.fr/prix/nom-du-jeu-optimise-seo`
*   **Contenu de la page :**
    1.  **Titre H1 :** "Acheter [Nom du Jeu] au meilleur prix - Comparateur"
    2.  **Tableau de prix en temps réel :** Afficher Steam (prix barré) vs Instant Gaming / Eneba (Prix vert).
    3.  **Graphique d'historique :** "Voir l'évolution du prix sur 30 jours" (Donne de la crédibilité et retient l'utilisateur).
    4.  **Call to Action (CTA) :** Gros bouton vert "Voir l'offre sur Instant Gaming" (Lien affilié).

---

## 3. Intégration Discord <-> Web (La Boucle)
Le site et le bot doivent se renvoyer la balle pour fidéliser l'utilisateur.

*   **Sur le Site :**
    *   Ajouter un bouton "🔔 Créer une alerte prix" sur chaque page de jeu.
    *   Ce bouton redirige vers l'invitation Discord : `https://discord.gg/.....`
    *   *Argument :* "Rejoignez 15+ membres et recevez une notif quand le prix baisse !"
*   **Connexion Utilisateur (Optionnel mais recommandé) :**
    *   "Se connecter avec Discord" (OAuth2).
    *   Permet de synchroniser les alertes du site avec le bot.

---

## 4. Checklist Technique pour le Dev
- [ ] Script global de réécriture des URLs (Affiliate Rewrite).
- [ ] Pages produits dynamiques (SEO Friendly).
- [ ] Intégration des APIs partenaires (ou lecture de la DB du bot) pour les prix en temps réel.
- [ ] Bannière "Partenaires" (Instant Gaming, etc.) en footer.
- [ ] Optimisation Mobile (80% du trafic viendra de TikTok/Discord sur mobile).

---

## 5. Sécurité BDD : RLS Supabase + Permissions basées sur rôles Discord

### Objectif
Les deals sont affichés publiquement sur le site (lecture ouverte), mais la modification/creation/suppression des deals doit être réservée aux rôles Discord suivants :

- Fondateur : `1446582422744469602`
- Cofondateur : `1446582422744469600`
- Web management : `1446582422719303728`
- Hardware management : `1458905435401752640`
- Sécurité : `1458902669300207707`

Le point important : cacher le panel admin dans le front ne protège pas la base. La protection doit être faite au niveau Supabase (PostgreSQL) via RLS.

### Pourquoi RLS ne peut pas lire les rôles Discord “tout seul”
Une policy RLS sur Supabase a accès à :

- `auth.uid()` : l’identifiant Supabase de l’utilisateur connecté (UUID)
- `auth.identities.identity_data` : les infos du provider OAuth. Avec Discord, `identity_data->>'sub'` correspond à l’ID Discord (snowflake)
- Les tables SQL de ta base

Une policy RLS ne peut pas appeler l’API Discord. Donc si tu veux autoriser “par rôle Discord”, il faut que les rôles Discord soient déjà stockés dans ta DB.

### Modèle de données recommandé
On met en place 2 tables :

1) Une table “liste blanche” des rôles autorisés (config)  
2) Une table “rôles des utilisateurs” (données synchronisées depuis Discord)

### SQL à exécuter dans Supabase (une fois)
Colle ça dans Supabase > SQL editor.

```sql
create table if not exists public.allowed_staff_roles (
  role_id text primary key
);

create table if not exists public.discord_user_roles (
  discord_id text not null,
  role_id text not null,
  updated_at timestamptz not null default now(),
  primary key (discord_id, role_id)
);

alter table public.allowed_staff_roles enable row level security;
alter table public.discord_user_roles enable row level security;

insert into public.allowed_staff_roles (role_id) values
  ('1446582422744469602'),
  ('1446582422744469600'),
  ('1446582422719303728'),
  ('1458905435401752640'),
  ('1458902669300207707')
on conflict (role_id) do nothing;
```

Note : activer RLS sur ces 2 tables évite que n’importe qui puisse lire/écrire les rôles. La Service Role key (côté serveur) contourne RLS, donc le serveur pourra quand même les mettre à jour.

### Policies RLS sur `public.bot_deals`
Objectif :

- Lecture publique : `anon` et `authenticated` peuvent `SELECT`
- Écriture : seulement `authenticated` et seulement si l’utilisateur a un rôle autorisé (selon les tables ci-dessus)

```sql
alter table public.bot_deals enable row level security;

drop policy if exists bot_deals_public_read on public.bot_deals;
create policy bot_deals_public_read
on public.bot_deals
for select
to anon, authenticated
using (true);

drop policy if exists bot_deals_staff_insert on public.bot_deals;
create policy bot_deals_staff_insert
on public.bot_deals
for insert
to authenticated
with check (
  exists (
    select 1
    from auth.identities i
    join public.discord_user_roles ur
      on ur.discord_id = (i.identity_data->>'sub')
    join public.allowed_staff_roles ar
      on ar.role_id = ur.role_id
    where i.user_id = auth.uid()
      and i.provider = 'discord'
  )
);

drop policy if exists bot_deals_staff_update on public.bot_deals;
create policy bot_deals_staff_update
on public.bot_deals
for update
to authenticated
using (
  exists (
    select 1
    from auth.identities i
    join public.discord_user_roles ur
      on ur.discord_id = (i.identity_data->>'sub')
    join public.allowed_staff_roles ar
      on ar.role_id = ur.role_id
    where i.user_id = auth.uid()
      and i.provider = 'discord'
  )
)
with check (
  exists (
    select 1
    from auth.identities i
    join public.discord_user_roles ur
      on ur.discord_id = (i.identity_data->>'sub')
    join public.allowed_staff_roles ar
      on ar.role_id = ur.role_id
    where i.user_id = auth.uid()
      and i.provider = 'discord'
  )
);

drop policy if exists bot_deals_staff_delete on public.bot_deals;
create policy bot_deals_staff_delete
on public.bot_deals
for delete
to authenticated
using (
  exists (
    select 1
    from auth.identities i
    join public.discord_user_roles ur
      on ur.discord_id = (i.identity_data->>'sub')
    join public.allowed_staff_roles ar
      on ar.role_id = ur.role_id
    where i.user_id = auth.uid()
      and i.provider = 'discord'
  )
);
```

### Ce qui a changé par rapport à “avant”
Avant, le site pouvait modifier directement `bot_deals` depuis le navigateur avec une clé trop permissive (ou sans RLS).

Maintenant :

- Le site peut toujours afficher les deals (SELECT public)
- Le panel admin ne pourra écrire que si :
  1) l’utilisateur est connecté (Supabase Auth)
  2) ses rôles Discord ont été synchronisés en DB
  3) il a au moins 1 rôle présent dans `allowed_staff_roles`

### La synchronisation des rôles (ce qu’il faut implémenter maintenant)
Tu dois créer un moment serveur (“backend”) qui met à jour `public.discord_user_roles`.

Un endroit simple :

- Une route API serveur dans le site (Next.js) appelée au login, ou au chargement du panel admin, ou via un bouton “refresh roles”.

### Démarrage rapide (manuel) pour tester avant la synchro
Tant que la synchro automatique n’est pas en place, personne n’aura accès à l’écriture, car `discord_user_roles` sera vide.

Pour débloquer un test (ex: ton compte), tu peux insérer à la main une ligne `discord_id -> role_id` :

```sql
delete from public.discord_user_roles
where discord_id = '828886405547425822';

insert into public.discord_user_roles (discord_id, role_id) values
('828886405547425822', '1446582422744469602')
on conflict do nothing;
```

Cette méthode sert uniquement à tester le panel. Elle ne remplace pas la synchro automatique (sinon il faudra gérer les accès à la main pour chaque nouveau staff).

Le flow exact à implémenter :

1) L’utilisateur se connecte via OAuth Discord (Supabase Auth)
2) Côté serveur, récupérer son `discord_id` :
   - soit via `user.identities` renvoyé par Supabase
   - soit via une requête SQL service-role sur `auth.identities`
3) Côté serveur, appeler l’API Discord pour obtenir ses rôles dans TON serveur :
   - `GET https://discord.com/api/v10/guilds/{GUILD_ID}/members/{DISCORD_ID}`
   - Header : `Authorization: Bot <DISCORD_BOT_TOKEN>`
4) Remplacer ses rôles en DB :
   - `delete from public.discord_user_roles where discord_id = '<DISCORD_ID>'`
   - `insert into public.discord_user_roles (discord_id, role_id) values ...`

Il ne faut jamais faire cette écriture depuis le navigateur avec la clé publique Supabase.

### Est-ce que l’accès devient automatique pour un nouveau fondateur ?
Oui, mais uniquement si la synchro automatique est implémentée.

- Avec synchro : un nouveau fondateur se connecte via Discord, la route serveur récupère ses rôles, écrit dans `discord_user_roles`, et l’accès write est accordé automatiquement par RLS.
- Sans synchro : rien ne s’écrit dans `discord_user_roles`, donc il n’aura pas l’accès tant que tu n’ajoutes pas ses rôles manuellement en SQL.

En résumé :

- RLS + policies seules ne donnent l’accès à personne, elles vérifient uniquement ce qui est en DB.
- L’accès devient automatique uniquement quand un code serveur maintient `discord_user_roles` à jour.

Définition “automatique” dans ce contexte :

- Un staff obtient l’accès sans action manuelle si, à sa connexion (ou à l’ouverture du panel), le serveur :
  1) récupère ses rôles Discord dans ton serveur
  2) écrit ces rôles dans `public.discord_user_roles`
  3) et au moins un de ces rôles est dans `public.allowed_staff_roles`

### Variables d’environnement nécessaires côté serveur (site)
- `SUPABASE_SERVICE_ROLE_KEY` (serveur uniquement)
- `DISCORD_BOT_TOKEN` (serveur uniquement)
- `DISCORD_GUILD_ID` (ton serveur Discord)

### Pseudo-code de la route serveur (Next.js)
Le but est que la route tourne côté serveur, avec la Service Role key, et mette à jour `discord_user_roles`.

```ts
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const guildId = process.env.DISCORD_GUILD_ID!
  const discordBotToken = process.env.DISCORD_BOT_TOKEN!

  const admin = createClient(supabaseUrl, serviceKey)

  // 1) récupérer l'utilisateur connecté (via cookies/session) avec ton client "server"
  // 2) extraire discord_id depuis son identité Discord (identity_data.sub)
  // 3) appeler Discord API pour récupérer member.roles
  // 4) delete + insert dans public.discord_user_roles
  // 5) return ok
}
```

Le détail exact dépend de la façon dont ton site gère la session Supabase (app router / pages router). Le principe reste identique.

### Tests et debug (très important)
Si tu fais :

```sql
select * from public.discord_user_roles where discord_id = '828886405547425822';
```

et que ça affiche “No rows returned”, c’est normal tant que la synchro n’a pas écrit les rôles.

Checklist de validation :

1) L’utilisateur se connecte au site avec Discord
2) La route de synchro s’exécute
3) La table `discord_user_roles` contient des lignes pour son ID Discord
4) Si au moins un de ses roles est dans `allowed_staff_roles`, alors :
   - insert/update/delete sur `bot_deals` fonctionne
5) Si tu retires le rôle sur Discord, au prochain refresh de synchro :
   - les lignes disparaissent, et l’écriture est refusée automatiquement par RLS

### Notes importantes (sécurité)
- Ne jamais exposer `SUPABASE_SERVICE_ROLE_KEY` ou `DISCORD_BOT_TOKEN` au navigateur.
- La visibilité du panel admin doit être un confort UX, pas une sécurité.
- La sécurité “réelle” doit être assurée par RLS.
