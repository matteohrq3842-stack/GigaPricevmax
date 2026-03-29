# 🛠️ GUIDE DE DÉVELOPPEMENT LOCAL (GigaPrice)

Pour travailler sur le projet en local (`localhost:3000`) sans être redirigé vers le site de production lors de la connexion Discord.

## 1. Configuration Supabase (OBLIGATOIRE)
Par défaut, Supabase redirige vers le site de production si l'URL locale n'est pas autorisée.

1.  Allez sur votre projet Supabase.
2.  Menu de gauche : **Authentication** > **URL Configuration**.
3.  Dans la section **Redirect URLs**, cliquez sur **Add URL**.
4.  Ajoutez exactement :
    ```
    http://localhost:3000/auth/callback
    ```
5.  Cliquez sur **Save**.

## 2. Fonctionnement du Code
Le code est déjà prévu pour s'adapter automatiquement :
- Fichier : `src/components/SessionProvider.tsx`
- Il utilise `window.location.origin`, donc :
    - Sur votre PC, il enverra `http://localhost:3000/...`
    - En ligne, il enverra `https://gigaprice.fr/...`

✅ **Vous n'avez rien à changer dans le code pour passer du local à la production.**

---

# 🚀 RAPPEL DÉPLOIEMENT (Hostinger)
Voir le fichier `DEPLOY_INSTRUCTIONS.md` pour la procédure complète.
Résumé :
1. `npm run build` (ou `node node_modules/next/dist/bin/next build`)
2. `python zip_export.py`
3. Upload manuel du ZIP dans `public_html`.
