# 🎬 Intégration Vidéo Hover - Guide Développeur Front-End

## Objectif
Afficher un aperçu vidéo au survol des cartes jeux, exactement comme Instant Gaming.

---

## ⚠️ IMPORTANT : Format des vidéos

Les vidéos sont en **format 16:9 (paysage)** mais vos cartes sont en **format portrait**.

**Le site DOIT gérer cela côté CSS avec `object-fit: cover`** pour que la vidéo remplisse la carte en coupant les côtés.

---

## Données disponibles dans `bot_deals`

| Champ | Type | Description |
|-------|------|-------------|
| `trailer_url` | string \| null | URL directe du fichier vidéo MP4 |
| `image_url` | string | Image de couverture (format portrait) |
| `hero_img` | string | Image héro/bannière (format paysage) |

**Format des URLs vidéo :**
```
https://gigaprice.fr/videos/nom-du-jeu.mp4
```

**Qualité :** 480p, max 15 Mo par vidéo

---

## Requête Supabase

```javascript
// Fetch les deals avec vidéo
const { data } = await supabase
  .from('bot_deals')
  .select('game_id, title, url, trailer_url, image_url, current_price, original_price, discount')
  .not('trailer_url', 'is', null);
```

---

## Composant React - Carte avec Vidéo Hover

```jsx
import { useState, useRef } from 'react';

function GameCard({ game }) {
  const [showVideo, setShowVideo] = useState(false);
  const videoRef = useRef(null);
  
  const handleMouseEnter = () => {
    setShowVideo(true);
    // Précharger et démarrer la vidéo
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };
  
  const handleMouseLeave = () => {
    setShowVideo(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };
  
  const hasVideo = game.trailer_url && game.trailer_url.trim() !== '';
  
  return (
    <div 
      className="game-card"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Image de couverture - TOUJOURS présente */}
      <img 
        src={game.image_url} 
        alt={game.title}
        className={`cover ${showVideo && hasVideo ? 'hidden' : ''}`}
        loading="lazy"
      />
      
      {/* Vidéo au hover - seulement si trailer_url existe */}
      {hasVideo && (
        <video
          ref={videoRef}
          src={game.trailer_url}
          muted
          loop
          playsInline
          preload="none"
          className={`video-preview ${showVideo ? 'visible' : ''}`}
        />
      )}
      
      {/* Overlay avec infos prix */}
      <div className="card-overlay">
        <h3>{game.title}</h3>
        <span className="price">{game.current_price}€</span>
      </div>
    </div>
  );
}
```

---

## CSS - CRITIQUE pour le format portrait

```css
/* Carte en format PORTRAIT (comme vos cartes actuelles) */
.game-card {
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  /* Format portrait - ajustez selon vos cartes */
  aspect-ratio: 3/4;  /* ou 2/3, selon votre design */
  background: #1a1a2e;
}

/* Image de couverture */
.game-card .cover {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;  /* CRITIQUE : remplit la carte, coupe les bords */
  transition: opacity 0.3s ease;
  z-index: 1;
}

.game-card .cover.hidden {
  opacity: 0;
}

/* Vidéo preview */
.game-card .video-preview {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;  /* CRITIQUE : la vidéo 16:9 remplit la carte portrait */
  object-position: center;  /* Centre la vidéo (coupe les côtés) */
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 2;
}

.game-card .video-preview.visible {
  opacity: 1;
}

/* Overlay infos */
.game-card .card-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background: linear-gradient(transparent, rgba(0,0,0,0.8));
  z-index: 10;
}
```

---

## Attributs vidéo OBLIGATOIRES

| Attribut | Pourquoi |
|----------|----------|
| `muted` | **OBLIGATOIRE** pour autoplay (politique navigateur) |
| `loop` | Boucle infinie |
| `playsInline` | Évite le plein écran sur mobile |
| `preload="none"` | Ne charge pas la vidéo avant hover |
| **PAS de `controls`** | Aucune barre de contrôle visible |
| **PAS de `autoplay`** | On démarre manuellement au hover |

---

## Gestion des erreurs

```javascript
// Si la vidéo ne charge pas, on affiche l'image
<video
  onError={(e) => {
    console.warn('Vidéo non disponible:', game.trailer_url);
    setShowVideo(false);
  }}
  // ...
/>
```

---

## Fallback si pas de vidéo

```javascript
const hasVideo = game.trailer_url && 
                 game.trailer_url.trim() !== '' && 
                 game.trailer_url.includes('gigaprice.fr');

// Si pas de vidéo, la carte affiche juste l'image
// Aucun élément vidéo n'est ajouté au DOM
```

---

## Commandes Bot Admin

| Commande | Description |
|----------|-------------|
| `/sync_videos mode:stats` | Voir les statistiques (avec/sans vidéo) |
| `/sync_videos mode:scan limit:50` | Traiter 50 jeux sans vidéo |
| `/sync_videos mode:scan limit:0` | Traiter TOUS les jeux |
| `/sync_videos mode:reset` | Supprimer les anciens trailers YouTube |

---

## Sources des vidéos (ordre de priorité)

1. **Instant Gaming** - Vidéos 480p optimisées
2. **Steam API** - Trailers officiels
3. **Steam CDN** - Fallback direct
4. **Algolia IG** - Recherche par titre
5. **IGDB + YouTube** - Téléchargement via yt-dlp

Toutes les vidéos sont uploadées sur **Hostinger** (`gigaprice.fr/videos/`).

---

## Nettoyage automatique

Les vidéos orphelines (deals expirés) sont supprimées de Hostinger toutes les **6 heures** via `cleanup_deals_task`.

---

## Checklist développeur front-end

- [ ] CSS `object-fit: cover` sur la vidéo
- [ ] CSS `object-position: center` pour centrer
- [ ] Démarrer la vidéo au `mouseenter`, pas en autoplay
- [ ] Arrêter la vidéo au `mouseleave`
- [ ] `preload="none"` pour ne pas précharger
- [ ] Gestion d'erreur si vidéo indisponible
- [ ] Fallback image si `trailer_url` est null
