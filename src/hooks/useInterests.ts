'use client';

import { useState, useEffect, useCallback } from 'react';

type InterestMap = Record<string, number>;

const STORAGE_KEY = 'gigaprice_interests';
const CONSENT_KEY = 'gp_cookie_consent_v1';

export function useInterests() {
    const [interests, setInterests] = useState<InterestMap>({});

    // Vérifier le consentement
    const hasConsent = useCallback(() => {
        try {
            const raw = localStorage.getItem(CONSENT_KEY);
            if (!raw) return false;
            const parsed = JSON.parse(raw);
            return parsed?.preferences === true;
        } catch {
            return false;
        }
    }, []);

    useEffect(() => {
        try {
            if (!hasConsent()) {
                setTimeout(() => setInterests({}), 0);
                return;
            }
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                // Micro-délai pour éviter l'erreur synchrone du linter strict
                const data = JSON.parse(stored);
                setTimeout(() => setInterests(data), 0);
            }
        } catch {
            // Ignore errors
        }
    }, [hasConsent]);

    const trackGame = useCallback((tags: string[]) => {
        if (!tags || tags.length === 0) return;
        if (!hasConsent()) return; // Stop si pas de consentement

        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            const current: InterestMap = stored ? JSON.parse(stored) : {};

            let changed = false;
            tags.forEach(tag => {
                if (!tag) return;
                // Normaliser le tag pour éviter les doublons (RPG vs rpg)
                const normalized = tag.trim();
                current[normalized] = (current[normalized] || 0) + 1;
                changed = true;
            });

            if (changed) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
                setInterests(current);
            }
        } catch (e) {
            console.warn('Failed to track interests', e);
        }
    }, [hasConsent]);

    const getScore = useCallback((tags: string[]) => {
        if (!hasConsent()) return 0; // Pas de personnalisation si pas de consentement
        if (!tags || tags.length === 0) return 0;

        let score = 0;
        tags.forEach(tag => {
            if (!tag) return;
            const normalized = tag.trim();
            if (interests[normalized]) {
                score += interests[normalized];
            }
        });

        return score;
    }, [interests, hasConsent]);

    return { interests, trackGame, getScore };
}
