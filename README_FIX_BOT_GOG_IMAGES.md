# 🔧 Instructions pour le Bot Discord — Correction des URLs d'Images GOG

> **Document à destination de l'IA gérant le bot Discord GigaPrice**
> *Date : 2 Février 2026*

---

## 🚨 Problème Identifié

Lors de l'analyse du site web, nous avons découvert que **certaines images de jeux ne s'affichent pas** correctement. Après investigation, voici les causes identifiées :

### Cause Principale : URLs GOG Malformées (Double URL)

Certaines URLs d'images provenant de GOG sont **malformées**. Au lieu d'être :
```
https://images.gog.com/abc123def456.jpg
```

Elles sont stockées comme :
```
https://images.gog.com/https://images.gog.com/abc123def456.jpg
```

C'est une **double URL** — le préfixe `https://images.gog.com/` est répété deux fois, ce qui rend l'URL invalide.

---

## 📋 Ce Qui Doit Être Corrigé Côté Bot

### 1. Vérifier la Fonction de Construction des URLs GOG

Localiser le code qui construit les URLs d'images pour les jeux GOG et s'assurer qu'il ne concatène pas un préfixe de base avec une URL déjà complète.

**Exemple de code problématique :**
```python
# ❌ MAUVAIS — risque de double URL si image_path est déjà une URL complète
base_url = "https://images.gog.com/"
image_url = base_url + image_path
```

**Correction suggérée :**
```python
# ✅ BON — vérifier si c'est déjà une URL complète
def build_gog_image_url(image_path: str) -> str:
    if not image_path:
        return ""
    
    # Si c'est déjà une URL complète, la retourner telle quelle
    if image_path.startswith("http://") or image_path.startswith("https://"):
        return image_path
    
    # Sinon, ajouter le préfixe GOG
    base_url = "https://images.gog.com/"
    return base_url + image_path
```

### 2. Colonnes Concernées dans Supabase (`bot_deals`)

Les colonnes qui stockent des URLs d'images et qui doivent être vérifiées :

| Colonne | Description |
|---------|-------------|
| `image_url` | Image principale du jeu |
| `hero_image_url` | Image bannière/hero |
| `extra_images` | Images additionnelles (JSON array) |

### 3. Nettoyer les Données Existantes (Optionnel mais Recommandé)

Une requête SQL de nettoyage pourrait être exécutée pour corriger les URLs déjà stockées :

```sql
-- Identifier les URLs malformées (double URL)
SELECT id, title, image_url 
FROM bot_deals 
WHERE image_url LIKE '%https://%https://%';

-- Corriger les URLs malformées dans image_url
UPDATE bot_deals
SET image_url = REGEXP_REPLACE(image_url, '^https://images\.gog\.com/https://', 'https://')
WHERE image_url LIKE 'https://images.gog.com/https://%';

-- Corriger les URLs malformées dans hero_image_url
UPDATE bot_deals
SET hero_image_url = REGEXP_REPLACE(hero_image_url, '^https://images\.gog\.com/https://', 'https://')
WHERE hero_image_url LIKE 'https://images.gog.com/https://%';
```

> ⚠️ **Attention** : Tester d'abord avec un SELECT avant de faire l'UPDATE.

---

## 🔍 Comment Tester

### Avant Correction
1. Ouvrir Supabase → Table `bot_deals`
2. Filtrer sur `store = 'GOG'` ou similaire
3. Vérifier la colonne `image_url` — si elle contient `https://images.gog.com/https://`, c'est malformé

### Après Correction
1. Relancer le scraper sur quelques jeux GOG
2. Vérifier que les nouvelles URLs sont correctes :
   - `https://images.gog.com/abc123.jpg` ✅
   - `https://images.gog.com/https://images.gog.com/abc123.jpg` ❌

---

## 📝 Résumé des Actions

| # | Action | Priorité |
|---|--------|----------|
| 1 | Corriger la fonction de construction des URLs GOG dans le bot | 🔴 Haute |
| 2 | (Optionnel) Nettoyer les données existantes via SQL | 🟠 Moyenne |
| 3 | Tester avec quelques jeux GOG | 🟢 Vérification |

---

## ℹ️ Contexte Technique

- **Table concernée** : `public.bot_deals` (Supabase)
- **Source des images GOG** : API GOG ou scraping du site GOG.com
- **Format attendu** : URL complète commençant par `https://`
- **Colonnes images** : `image_url`, `hero_image_url`, `extra_images`

---

## ✅ Correction Côté Site Web (Déjà Faite)

Le site a été mis à jour pour reconnaître la colonne `hero_image_url` qui n'était pas prise en charge auparavant. 

Fichiers modifiés :
- `src/data/games.ts` — Ajout de `hero_image_url` dans la chaîne de fallback
- `src/data/games.server.ts` — Même correction côté serveur

---

*Document généré pour faciliter la passation d'informations entre le site web et le bot Discord.*

---

# 🎮 Amélioration des Pages de Jeux — Dates Officielles et Configuration PC

> **Nouvelles fonctionnalités à supporter côté bot**
> *Date : 2 Février 2026*

---

## 📅 Dates Officielles des Jeux

### Problème Actuel
Les dates affichées sur la page d'un jeu (`Date de sortie`, `Dernière mise à jour`) sont probablement les dates de création/modification du deal dans la BDD, pas les vraies dates officielles du jeu.

### Colonnes Recommandées à Ajouter

| Colonne | Type | Description |
|---------|------|-------------|
| `official_release_date` | `TIMESTAMP` | Date de sortie officielle du jeu |
| `game_release_date` | `TIMESTAMP` | Alternative : date de sortie |
| `official_last_update` | `TIMESTAMP` | Date de la dernière mise à jour majeure |
| `last_major_update` | `TIMESTAMP` | Alternative : date de MAJ |

### Comment Récupérer Ces Données

**Pour les jeux Steam :**
```python
import requests

def get_steam_game_info(app_id: int):
    url = f"https://store.steampowered.com/api/appdetails?appids={app_id}"
    response = requests.get(url)
    data = response.json()
    
    if data[str(app_id)]["success"]:
        game_data = data[str(app_id)]["data"]
        return {
            "release_date": game_data.get("release_date", {}).get("date"),
            "last_update": game_data.get("last_modified"),  # Si disponible
        }
    return None
```

**Pour les jeux GOG :**
L'API GOG ne fournit pas directement les dates, il faudra peut-être scraper la page du jeu.

---

## 🖥️ Configuration Système PC

### Colonnes Recommandées

| Colonne | Type | Description |
|---------|------|-------------|
| `min_config` | `JSONB` | Configuration minimum requise |
| `rec_config` | `JSONB` | Configuration recommandée |

### Structure JSON Attendue

```json
{
  "os": "Windows 10 or later (64-bit)",
  "processor": "i5-3570K 3.4 GHz 4 Core",
  "memory": "16 GB RAM",
  "graphics": "GeForce GTX 1050 (2GB)",
  "storage": "40 GB available space",
  "additional": "Internet connection required for multiplayer"
}
```

### Comment Récupérer Depuis Steam

```python
def get_steam_requirements(app_id: int):
    url = f"https://store.steampowered.com/api/appdetails?appids={app_id}"
    response = requests.get(url)
    data = response.json()
    
    if data[str(app_id)]["success"]:
        game_data = data[str(app_id)]["data"]
        
        # Steam renvoie du HTML, il faut le parser
        pc_requirements = game_data.get("pc_requirements", {})
        
        return {
            "minimum": parse_steam_requirements(pc_requirements.get("minimum", "")),
            "recommended": parse_steam_requirements(pc_requirements.get("recommended", ""))
        }
    return None

def parse_steam_requirements(html_string: str) -> dict:
    """
    Parse le HTML des requirements Steam pour extraire les specs.
    Steam renvoie du HTML comme:
    <strong>OS:</strong> Windows 10<br>
    <strong>Processor:</strong> Intel Core i5<br>
    etc.
    """
    from bs4 import BeautifulSoup
    
    soup = BeautifulSoup(html_string, 'html.parser')
    result = {}
    
    for strong in soup.find_all('strong'):
        label = strong.get_text().strip().rstrip(':').lower()
        value = strong.next_sibling
        if value:
            value = str(value).strip()
            
            mapping = {
                'os': 'os',
                'processor': 'processor',
                'memory': 'memory',
                'graphics': 'graphics',
                'storage': 'storage',
                'directx': 'additional',
                'network': 'additional'
            }
            
            if label in mapping:
                result[mapping[label]] = value
    
    return result
```

---

## 📋 Résumé des Actions pour le Bot

| # | Action | Priorité | Impact Site |
|---|--------|----------|-------------|
| 1 | Ajouter colonnes `min_config` et `rec_config` (JSONB) | 🔴 Haute | Affichage Config Système |
| 2 | Ajouter colonne `official_release_date` (TIMESTAMP) | 🟠 Moyenne | Date de sortie correcte |
| 3 | Ajouter colonne `official_last_update` (TIMESTAMP) | 🟡 Basse | Date MAJ correcte |
| 4 | Récupérer les infos Steam lors de l'ajout d'un jeu | 🔴 Haute | Données complètes |

---

## 🔧 Script SQL pour Ajouter les Colonnes

```sql
-- Ajouter les colonnes de configuration système
ALTER TABLE bot_deals 
ADD COLUMN IF NOT EXISTS min_config JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS rec_config JSONB DEFAULT NULL;

-- Ajouter les colonnes de dates officielles
ALTER TABLE bot_deals 
ADD COLUMN IF NOT EXISTS official_release_date TIMESTAMP DEFAULT NULL,
ADD COLUMN IF NOT EXISTS official_last_update TIMESTAMP DEFAULT NULL;

-- Index pour améliorer les performances de recherche
CREATE INDEX IF NOT EXISTS idx_bot_deals_official_release ON bot_deals(official_release_date);
```

---

*Le site web est déjà configuré pour chercher ces colonnes. Dès qu'elles seront remplies par le bot, les informations s'afficheront automatiquement.*
