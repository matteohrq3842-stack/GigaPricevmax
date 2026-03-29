# 🚨 IMPORTANT : PROCÉDURE DE DÉPLOIEMENT HOSTINGER 🚨

**À LIRE ABSOLUMENT AVANT CHAQUE DÉPLOIEMENT**

Ce projet est hébergé sur une offre **Hostinger Mutualisé (Shared Hosting)**.
❌ **IL N'Y A PAS DE SERVEUR NODE.JS.**
❌ **NE PAS UTILISER** le déploiement automatique ou l'outil "Site Web" de Hostinger.

ℹ️ Les pages jeux utilisent maintenant l’URL `https://<domaine>/jeux?slug=<slug>` et `.htaccess` redirige automatiquement les anciennes URLs `/jeux/<slug>` vers ce format.

## ✅ La seule procédure qui fonctionne :

### 1. Configuration requise (`next.config.ts`)
Vérifier que ces options sont toujours présentes :
```typescript
const nextConfig: NextConfig = {
  output: 'export',        // OBLIGATOIRE : Génère un site statique
  trailingSlash: true,     // OBLIGATOIRE : Crée des dossiers/index.html pour éviter les erreurs 403
  images: {
    unoptimized: true,     // OBLIGATOIRE : Pas de serveur d'optimisation d'images
    // ...
  },
};
```

### 2. Générer le site (Build)
Lancer la commande de build dans le terminal :
```bash
npm run build
```
*Si vous rencontrez une erreur de permission PowerShell sur Windows, utilisez cette commande alternative :*
```bash
node node_modules/next/dist/bin/next build
```

#### Vérification CRITIQUE : `index.html`
Après le build, vérifiez que ces fichiers existent :
- `out/index.html`
- `out/<chaque-page>/index.html` (ex: `out/abonnements/index.html`, `out/jeux/index.html`)
- `out/_next/` et `out/.htaccess`

Si `out/index.html` est absent :
1. Vérifiez que `next.config.ts` contient bien `output: 'export'` et `trailingSlash: true`.
2. Assurez-vous que la page d’accueil existe (`src/app/(site)/page.tsx`).
3. Supprimez `.next/` et `out/`, puis relancez le build.

### 3. Créer le ZIP (CRUCIAL)
⚠️ **NE JAMAIS ZIPPER LE DOSSIER À LA MAIN DEPUIS L'EXPLORATEUR WINDOWS.**
Windows utilise des `\` (antislashs) qui cassent le site sur les serveurs Linux de Hostinger.

Utilisez **TOUJOURS** le script Python fourni à la racine :
```bash
python zip_export.py
```
👉 Cela va créer un fichier **`gigaprice_static.zip`** parfaitement compatible (chemins Linux `/` + permissions 644).

#### Technique ZIP (à connaître)
- Le script prend le dossier `out` comme source.
- Il force les chemins Linux et les permissions 644 pour éviter les erreurs 403.
- Il ajoute aussi les fichiers de documentation utiles à la racine du ZIP.
- Si `out` n’existe pas, relancez d’abord la commande de build.

### 4. Uploader sur Hostinger
1.  Connectez-vous à Hostinger > **Gestionnaire de fichiers** (File Manager).
2.  Allez dans le dossier **`public_html`**.
3.  🗑️ **SUPPRIMEZ TOUT** ce qui s'y trouve (fichiers et dossiers). Le dossier doit être vide.
4.  Cliquez sur le bouton **Upload** (en haut à droite) et envoyez `gigaprice_static.zip`.
5.  Faites un **Clic Droit** sur le fichier zip > **Extract** (Extraire).
    *   *Assurez-vous d'extraire directement dans `public_html` (laissez le champ dossier vide ou mettez `.`).*
6.  Vérifiez que vous voyez bien `index.html` et le dossier `_next` directement dans `public_html`.
7.  Vérifiez que vous voyez aussi `.htaccess` directement dans `public_html` (il gère le cache et les redirections).
7.  Si `index.html` n’apparaît pas au **niveau racine**, c’est que le ZIP a été extrait dans un sous-dossier : remontez tous les fichiers à la racine de `public_html`.

---

**🤖 POUR LES IA FUTURES :**
Si l'utilisateur demande de déployer ou de corriger le déploiement :
1.  **NE CHERCHEZ PAS** à configurer un serveur Node, Docker ou PM2.
2.  **NE MODIFIEZ PAS** le `package.json` pour ajouter des scripts "start".
3.  Suivez scrupuleusement les étapes ci-dessus : **Build Statique -> Script Python ZIP -> Upload Manuel.**
