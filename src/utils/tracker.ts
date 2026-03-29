
/**
 * GigaPrice User Tracker
 * Gère l'identifiant unique anonyme pour le système de recommandation.
 */

export function getOrCreateUserUUID(): string {
  if (typeof window === 'undefined') return '';

  const STORAGE_KEY = 'gp_user_uuid';
  let uuid = localStorage.getItem(STORAGE_KEY);

  // Vérifier si le cookie existe déjà (pour synchro cross-tab/session)
  if (!uuid) {
    const match = document.cookie.match(new RegExp('(^| )' + STORAGE_KEY + '=([^;]+)'));
    if (match) {
      uuid = match[2];
      localStorage.setItem(STORAGE_KEY, uuid); // Restaurer dans localStorage
    }
  }

  // Si toujours pas d'UUID, on en génère un nouveau
  if (!uuid) {
    // Fallback si crypto.randomUUID n'est pas dispo (vieux navigateurs)
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      uuid = crypto.randomUUID();
    } else {
      uuid = 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    }

    // Sauvegarde (Note: Le cookie réel sera set par le composant de consentement pour respecter la loi)
  }

  return uuid;
}

/**
 * Active le tracking (set le cookie persistant)
 * À appeler UNIQUEMENT après consentement.
 */
export function enableTracking(uuid: string) {
  if (typeof document === 'undefined') return;

  const STORAGE_KEY = 'gp_user_uuid';
  const date = new Date();
  date.setTime(date.getTime() + (395 * 24 * 60 * 60 * 1000)); // 13 mois

  document.cookie = `${STORAGE_KEY}=${uuid}; expires=${date.toUTCString()}; path=/; SameSite=Lax`;
  localStorage.setItem(STORAGE_KEY, uuid);
}

export function rewriteAffiliateUrl(rawUrl: string): string {
  if (!rawUrl) return rawUrl;

  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return rawUrl;
  }

  const host = url.hostname.replace(/^www\./, '').toLowerCase();

  if (host === 'instant-gaming.com') {
    if (!url.searchParams.has('igr')) {
      url.searchParams.set('igr', 'gigapricev1xyz');
    }
    return url.toString();
  }

  if (host === 'eneba.com') {
    const enebaId = process.env.NEXT_PUBLIC_ENEBA_AFFILIATE_ID;
    if (enebaId && !url.searchParams.has('af_id')) {
      url.searchParams.set('af_id', enebaId);
    }
    return url.toString();
  }

  if (host === 'cdkeys.com') {
    const cdkeysId = process.env.NEXT_PUBLIC_CDKEYS_AFFILIATE_ID;
    if (cdkeysId && !url.searchParams.has('mw_aref')) {
      url.searchParams.set('mw_aref', cdkeysId);
    }
    return url.toString();
  }

  return rawUrl;
}
