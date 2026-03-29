'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/SessionProvider';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { supabase, user } = useAuth();
  const [error, setError] = useState<string | null>(null);

  // Si l'utilisateur est déjà connecté, on redirige direct
  useEffect(() => {
    if (user) {
      router.replace('/');
    }
  }, [user, router]);

  useEffect(() => {
    if (user) return; // Ne rien faire si déjà connecté

    const redirectUrl = `${window.location.origin}/auth/callback`;
    const formatError = (raw: string) => {
      const msg = raw.trim();
      const lower = msg.toLowerCase();

      if (lower.includes('redirect') && (lower.includes('url') || lower.includes('uri'))) {
        return `URL de redirection non autorisée côté Supabase. Ajoute "${redirectUrl}" dans Supabase > Authentication > URL Configuration > Redirect URLs, puis réessaie.`;
      }

      if (lower.includes('invalid_grant') || lower.includes('code verifier') || lower.includes('pkce')) {
        return "Session OAuth invalide (PKCE). Relance la connexion Discord depuis le site (ne pas ouvrir le callback manuellement).";
      }

      return msg;
    };

    const params = new URLSearchParams(window.location.search);
    const errorDescription = params.get('error_description') ?? params.get('error');
    if (errorDescription) {
      Promise.resolve().then(() => setError(formatError(errorDescription)));
      return;
    }

    const code = params.get('code');
    if (!code) {
      router.replace('/');
      return;
    }

    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) {
        Promise.resolve().then(() => setError(formatError(error.message)));
        return;
      }
      router.replace('/');
    });
  }, [router, supabase, user]);

  return (
    <main style={{ paddingTop: '160px', paddingBottom: '80px' }}>
      <section className="suggestions-header">
        <h2>{error ? 'Connexion Discord impossible' : 'Connexion en cours…'}</h2>
        {error ? <p style={{ color: '#ccc' }}>{error}</p> : null}
      </section>
    </main>
  );
}
