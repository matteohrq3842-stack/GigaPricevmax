# 🚀 Projet GigaPrice Desktop App (Horizon Septembre 2026+)

> **Document de Vision Technique**
> Ce document décrit l'architecture et la faisabilité de la future application de bureau GigaPrice.
> *Date cible estimée : Septembre 2026*

---

## 1. Le Concept : "Plus qu'un site, un Compagnon"

L'objectif est de créer une application Windows (`.exe`) installable qui servira de **Launcher** et de hub central pour les joueurs. Elle ne remplacera pas le site web, elle le complétera pour fidéliser les utilisateurs.

### Pourquoi une App ?
*   **Notifications Bureau :** "🔔 Elden Ring à -50% !" directement dans le coin de l'écran (Windows Toast).
*   **Fluidité :** Pas besoin d'ouvrir un navigateur, l'app tourne en fond (System Tray).
*   **Intégration Système :** Capacité à lancer Steam ou installer des jeux directement.

---

## 2. Architecture : "Le Cerveau Unique"

L'application ne sera **pas** un système séparé. Elle sera connectée exactement à la même source de données que le site web et le bot Discord.

*   **Base de Données (Le Cerveau) :** Stocke tous les jeux, prix, et liens affiliés.
*   **Price Panel (La Télécommande) :** Tu gères les promos ici.
*   **Les Vitrines :**
    *   🌐 Site Web (Pour le SEO / Google).
    *   🤖 Discord (Pour la Communauté).
    *   💻 **Desktop App** (Pour les Power Users / Fidélisation).

**Avantage :** Quand tu valides un deal sur le Price Panel, il apparaît **instantanément** sur l'Application. Zéro maintenance supplémentaire.

---

## 3. Parcours d'Achat & Affiliation (Le Défi Technique)

Comment gagner de l'argent (Affiliation) tout en gardant l'utilisateur dans l'application ?

### Le Problème
On ne peut pas encaisser l'argent directement (Stripe) puis payer Instant Gaming nous-mêmes (Impossible techniquement et légalement pour l'affiliation).

### La Solution "WebView" (Navigateur Intégré)
1.  L'utilisateur voit la fiche du jeu dans l'App GigaPrice.
2.  Il clique sur **"Acheter (Prix GigaPrice)"**.
3.  L'application ouvre une fenêtre interne (comme un mini-Chrome sans barre d'adresse) affichant le site du partenaire (Instant Gaming, Eneba).
4.  **Le Cookie Affilié est posé.**
5.  L'utilisateur se connecte et paie sur le site partenaire (en toute sécurité).
6.  GigaPrice touche la commission.

---

## 4. Les "Super-Pouvoirs" de l'Application (Features Exclusives)

C'est ici que l'App dépasse le site web grâce à l'accès au système Windows.

### A. Auto-Activation Steam 🪄
Une fois que l'utilisateur a acheté sa clé (sur Instant Gaming par exemple) :
1.  Il copie la clé (`CTRL+C`).
2.  Il clique sur un bouton **"Activer le produit"** dans l'App GigaPrice.
3.  L'App lance la commande `steam://open/activateproduct?key=XXXX`.
4.  La fenêtre Steam s'ouvre avec le code **déjà rempli**. L'utilisateur n'a qu'à valider.

### B. Auto-Installation 💾
L'App sait quel jeu l'utilisateur regarde.
1.  Bouton **"Installer via Steam"**.
2.  L'App lance la commande `steam://install/<STEAM_APP_ID>`.
3.  Steam se lance et démarre le téléchargement immédiatement.

---

## 5. Stack Technique Envisagée

*   **Framework :** [Electron](https://www.electronjs.org/) (Technologie utilisée par Discord, VS Code, Twitch App).
    *   *Avantage :* On peut réutiliser 90% du code React/Next.js du site web actuel !
*   **Langage :** TypeScript / React.
*   **Backend :** Le même que le site actuel (Supabase).

---

## 📅 Roadmap Prévisionnelle

Ce projet est ambitieux et nécessite d'abord que le site Web et le Price Panel soient parfaitement stables et rentables.

*   **Phase 1 (Maintenant - Juin 2026) :** Consolidation du Site Web, SEO, et croissance de la communauté Discord.
*   **Phase 2 (Été 2026) :** Étude de maquette pour l'App Desktop.
*   **Phase 3 (Septembre 2026) :** Lancement du développement "GigaPrice Launcher V1".
