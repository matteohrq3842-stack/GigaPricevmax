'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { getOrCreateUserUUID, enableTracking } from '@/utils/tracker';
import { useAuth } from '@/components/providers/SessionProvider';

type CookieConsentV1 = {
  version: 1;
  necessary: true;
  preferences: boolean;
  analytics: boolean;
  updatedAt: string;
};

const STORAGE_KEY = 'gp_cookie_consent_v1';
const COOKIE_NAME = 'gp_cookie_consent_v1';
const OPEN_SETTINGS_EVENT = 'gp:open-cookie-settings';
const CONSENT_CHANGED_EVENT = 'gp:cookie-consent-changed';

function safeParseConsent(raw: string | null): CookieConsentV1 | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<CookieConsentV1>;
    if (parsed?.version !== 1) return null;
    if (parsed?.necessary !== true) return null;
    if (typeof parsed?.preferences !== 'boolean') return null;
    if (typeof parsed?.analytics !== 'boolean') return null;
    if (typeof parsed?.updatedAt !== 'string') return null;
    return parsed as CookieConsentV1;
  } catch {
    return null;
  }
}

function writeConsent(consent: CookieConsentV1) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
  } catch { }

  try {
    const value = encodeURIComponent(JSON.stringify(consent));
    const maxAgeSeconds = 60 * 60 * 24 * 365;
    document.cookie = `${COOKIE_NAME}=${value}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax`;
  } catch { }

  try {
    window.dispatchEvent(new CustomEvent(CONSENT_CHANGED_EVENT, { detail: consent }));
  } catch { }
}

export default function CookieConsentModal() {
  const { user, supabase } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSettings, setIsSettings] = useState(false);
  const [canClose, setCanClose] = useState(false);
  const pathname = usePathname();
  const suppressModal = pathname === '/politique-cookies' || pathname === '/mentions-legales';
  const isVisible = isOpen && !suppressModal;

  const [preferences, setPreferences] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    async function checkRemoteConsent() {
      if (!user || !supabase) return;

      try {
        const { data } = await supabase
          .from('user_consents')
          .select('consent')
          .eq('user_id', user.id)
          .single();

        if (data?.consent) {
          const remoteConsent = data.consent as CookieConsentV1;
          const localConsent = safeParseConsent(localStorage.getItem(STORAGE_KEY));

          if (remoteConsent?.version === 1) {
            const localTime = localConsent ? new Date(localConsent.updatedAt).getTime() : 0;
            const remoteTime = new Date(remoteConsent.updatedAt).getTime();

            if (remoteTime > localTime) {
              writeConsent(remoteConsent);
              setPreferences(remoteConsent.preferences);
              setAnalytics(remoteConsent.analytics);
              if (remoteConsent.analytics) {
                enableTracking(getOrCreateUserUUID());
              }
              setIsOpen(false);
            }
          }
        }
      } catch {
      }
    }

    checkRemoteConsent();
  }, [user, supabase]);

  const syncToSupabase = async (consent: CookieConsentV1) => {
    if (!user || !supabase) return;
    try {
      const { error } = await supabase
        .from('user_consents')
        .upsert({
          user_id: user.id,
          consent: consent,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (err) {
      console.error('Error syncing consent to Supabase:', err);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const initialConsent = safeParseConsent(window.localStorage.getItem(STORAGE_KEY));
      if (initialConsent) {
        setPreferences(initialConsent.preferences);
        setAnalytics(initialConsent.analytics);
      } else {
        setIsOpen(true);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const onOpenSettings = () => {
      const existing = safeParseConsent(localStorage.getItem(STORAGE_KEY));
      if (existing) {
        setPreferences(existing.preferences);
        setAnalytics(existing.analytics);
        setCanClose(true);
      } else {
        setCanClose(false);
      }
      setIsOpen(true);
      setIsSettings(true);
    };

    window.addEventListener(OPEN_SETTINGS_EVENT, onOpenSettings);
    return () => window.removeEventListener(OPEN_SETTINGS_EVENT, onOpenSettings);
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isVisible]);

  const acceptAll = () => {
    const consent: CookieConsentV1 = {
      version: 1,
      necessary: true,
      preferences: true,
      analytics: true,
      updatedAt: new Date().toISOString(),
    };
    writeConsent(consent);
    syncToSupabase(consent);
    setPreferences(consent.preferences);
    setAnalytics(consent.analytics);
    if (consent.analytics) {
      enableTracking(getOrCreateUserUUID());
    }
    setIsOpen(false);
    setIsSettings(false);
    setCanClose(true);
  };

  const rejectAll = () => {
    const consent: CookieConsentV1 = {
      version: 1,
      necessary: true,
      preferences: false,
      analytics: false,
      updatedAt: new Date().toISOString(),
    };
    writeConsent(consent);
    syncToSupabase(consent);
    setPreferences(consent.preferences);
    setAnalytics(consent.analytics);
    setIsOpen(false);
    setIsSettings(false);
    setCanClose(true);
  };

  const saveChoices = () => {
    const consent: CookieConsentV1 = {
      version: 1,
      necessary: true,
      preferences,
      analytics,
      updatedAt: new Date().toISOString(),
    };
    writeConsent(consent);
    syncToSupabase(consent);
    if (analytics) {
      enableTracking(getOrCreateUserUUID());
    }
    setIsOpen(false);
    setIsSettings(false);
    setCanClose(true);
  };

  if (!isVisible) return null;
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="cookie-modal-backdrop" role="presentation">
      <div
        className="cookie-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-modal-title"
      >
        <div className="cookie-modal-header">
          <h2 id="cookie-modal-title" className="cookie-modal-title">
            {isSettings ? 'Paramètres des cookies' : 'Vos choix de confidentialité'}
          </h2>
          {canClose ? (
            <button
              type="button"
              className="cookie-modal-close"
              aria-label="Fermer"
              onClick={() => {
                setIsOpen(false);
                setIsSettings(false);
              }}
            >
              ✕
            </button>
          ) : null}
        </div>

        {!isSettings ? (
          <div className="cookie-modal-body">
            <p className="cookie-modal-text">
              GigaPrice utilise des cookies et technologies similaires pour assurer le bon fonctionnement du site
              et, selon vos choix, mémoriser certaines préférences et mesurer l&apos;audience afin d&apos;améliorer
              nos services.
            </p>
            <p className="cookie-modal-text cookie-modal-text-muted">
              Vous pouvez modifier votre choix à tout moment via “Gérer les cookies” dans le menu.{' '}
              <Link
                href="/politique-cookies"
                className="cookie-modal-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                En savoir plus
              </Link>
              .
            </p>

            <div className="cookie-modal-actions">
              <button
                type="button"
                className="cookie-btn cookie-btn-ghost"
                onClick={() => {
                  setIsSettings(true);
                  setCanClose(false);
                }}
              >
                Personnaliser
              </button>
              <button type="button" className="cookie-btn cookie-btn-secondary" onClick={rejectAll}>
                Tout refuser
              </button>
              <button type="button" className="cookie-btn cookie-btn-primary" onClick={acceptAll}>
                Tout accepter
              </button>
            </div>
          </div>
        ) : (
          <div className="cookie-modal-body">
            <p className="cookie-modal-text cookie-modal-text-muted">
              Activez ou désactivez les catégories ci-dessous. Les cookies strictement nécessaires sont toujours
              actifs.
            </p>

            <div className="cookie-category-list">
              <div className="cookie-category">
                <div className="cookie-category-main">
                  <div className="cookie-category-title">Strictement nécessaires</div>
                  <div className="cookie-category-desc">
                    Indispensables au fonctionnement du site (sécurité, affichage, navigation).
                  </div>
                </div>
                <div className="cookie-category-right">
                  <span className="cookie-pill">Toujours actif</span>
                </div>
              </div>

              <div className="cookie-category">
                <div className="cookie-category-main">
                  <div className="cookie-category-title">Préférences</div>
                  <div className="cookie-category-desc">
                    Permet de mémoriser certaines préférences (ex : thème, options d’affichage).
                  </div>
                </div>
                <div className="cookie-category-right">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={preferences}
                    className={`cookie-switch ${preferences ? 'on' : 'off'}`}
                    onClick={() => setPreferences((v) => !v)}
                  >
                    <span className="cookie-switch-knob" />
                  </button>
                </div>
              </div>

              <div className="cookie-category">
                <div className="cookie-category-main">
                  <div className="cookie-category-title">Mesure d’audience</div>
                  <div className="cookie-category-desc">
                    Permet de mesurer l’utilisation du site (pages vues, performance) afin d’améliorer
                    l’expérience.
                  </div>
                </div>
                <div className="cookie-category-right">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={analytics}
                    className={`cookie-switch ${analytics ? 'on' : 'off'}`}
                    onClick={() => setAnalytics((v) => !v)}
                  >
                    <span className="cookie-switch-knob" />
                  </button>
                </div>
              </div>
            </div>

            <div className="cookie-modal-actions cookie-modal-actions-settings">
              <button type="button" className="cookie-btn cookie-btn-primary" onClick={saveChoices}>
                Enregistrer mes choix
              </button>
              <button
                type="button"
                className="cookie-btn cookie-btn-secondary"
                onClick={() => {
                  setIsSettings(false);
                  setCanClose(false);
                }}
              >
                Retour
              </button>
              <button type="button" className="cookie-btn cookie-btn-ghost" onClick={rejectAll}>
                Tout refuser
              </button>
            </div>
          </div>
        )}
        <div className="cookie-modal-legal">
          <Link
            href="/politique-cookies"
            className="cookie-legal-link"
            onClick={() => {
              setIsSettings(false);
              setCanClose(false);
            }}
          >
            Politique de confidentialité
          </Link>
          <Link
            href="/mentions-legales"
            className="cookie-legal-link"
            onClick={() => {
              setIsSettings(false);
              setCanClose(false);
            }}
          >
            Mentions légales
          </Link>
        </div>
      </div>
    </div>,
    document.body,
  );
}
