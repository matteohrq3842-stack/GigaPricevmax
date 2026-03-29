# 🎥 Trailers “instantanés” au survol (comme Instant Gaming)

## Objectif
Faire apparaître une vidéo de preview quasi instantanément au survol d’une carte produit, sans spinner perceptible.

## Conclusion (important)
Le délai au survol vient quasi toujours du site :
- Le bot ne fait que stocker des champs de trailer en base (`trailer_url` + champs dérivés).
- La vitesse perçue dépend du player côté front (YouTube iframe vs fichier vidéo) + optimisations réseau (CDN, preconnect, cache).

## Ce que fait Instant Gaming (pattern)
Dans le HTML de leur home :
- `preconnect` vers leur CDN vidéo
- un `<video>` présent dans la carte (pas créé au hover)
- une source légère en `video/webm` (preview)

Extraits :
```html
<link rel="preconnect" href="https://gaming-cdn.com" crossorigin>
<video preload="none" loop muted playsinline>
  <source src="https://gaming-cdn.com/videos/.../preview.webm" type="video/webm" />
</video>
```

## Prérequis côté données (Supabase / bot_deals)
Pour un rendu réellement “instant”, il faut privilégier une source jouable dans un `<video>` :

1) `trailer_mp4_url` (meilleur pour simplicité)  
2) `webm` (meilleur pour le poids, si tu en as)  
3) `trailer_embed_url` (YouTube) en fallback seulement (player lourd = délai)

Champs utiles déjà existants côté bot :
- `trailer_url`
- `trailer_provider`
- `trailer_mp4_url`
- `trailer_youtube_id`
- `trailer_embed_url`

## Implémentation recommandée (React / Next.js)
### Règle d’or
Ne pas “monter/démonter” le player au hover. Le `<video>` doit être déjà dans le DOM, et on le rend visible au survol.

### Chargement en avance (prime)
Deux options efficaces :
- Prime quand la carte entre dans le viewport (IntersectionObserver)
- Prime dès le premier mouvement de souris sur la grille (si desktop-first)

### Exemple de logique (survol)
```tsx
import { useRef } from 'react'

export function DealCard({ deal }: { deal: any }) {
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const srcMp4 = (deal.trailer_mp4_url || '').trim()
  const canVideo = Boolean(srcMp4)

  const prime = () => {
    const v = videoRef.current
    if (!v) return
    v.preload = 'metadata'
    v.load()
  }

  const play = async () => {
    const v = videoRef.current
    if (!v) return
    try {
      await v.play()
    } catch {}
  }

  const stop = () => {
    const v = videoRef.current
    if (!v) return
    v.pause()
    v.currentTime = 0
  }

  return (
    <article
      onMouseEnter={() => { if (canVideo) { prime(); void play() } }}
      onMouseLeave={() => { if (canVideo) stop() }}
      style={{ position: 'relative' }}
    >
      <img src={deal.image_url} alt={deal.title} />
      {canVideo ? (
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          preload="none"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0,
            transition: 'opacity 120ms ease',
            pointerEvents: 'none',
          }}
        >
          <source src={srcMp4} type="video/mp4" />
        </video>
      ) : null}
    </article>
  )
}
```

À faire côté CSS/UI : au hover, passer l’opacité du `<video>` à 1 (ex: via classe `is-hovered`).

## Optimisations réseau (gros gain sur le “premier hover”)
Si tes vidéos viennent souvent des mêmes hôtes, ajoute du preconnect/dns-prefetch dans le `<head>` :

### Steam (très courant si `trailer_mp4_url` vient de Steam)
```html
<link rel="dns-prefetch" href="//cdn.akamai.steamstatic.com">
<link rel="preconnect" href="https://cdn.akamai.steamstatic.com" crossorigin>
```

### YouTube (fallback)
```html
<link rel="preconnect" href="https://www.youtube-nocookie.com" crossorigin>
<link rel="preconnect" href="https://i.ytimg.com" crossorigin>
```

## Checklist de validation
- Le `<video>` est dans le DOM avant hover
- Sur desktop : `muted + playsInline` (autoplay policy)
- Au hover : pas de création d’iframe, juste `play()`
- Le 1er hover est fluide (preconnect + prime), les suivants instantanés (cache)

## Limite importante
Un rendu “comme Instant Gaming” à 100% implique des previews courtes (3–8s) hébergées sur un CDN en webm/mp4. Avec YouTube en iframe, il restera toujours un délai perceptible.

