'use client';

import { createClient, type Session, type SupabaseClient, type User } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type AuthContextValue = {
  supabase: SupabaseClient;
  session: Session | null;
  user: User | null;
  loading: boolean;
  signInWithDiscord: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within SessionProvider');
  }
  return ctx;
}

export default function SessionProvider({ children }: { children: React.ReactNode }) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

  const supabase = useMemo(() => {
    const url = isSupabaseConfigured ? supabaseUrl! : 'http://localhost:54321';
    const key = isSupabaseConfigured ? supabaseAnonKey! : 'anon';
    return createClient(url, key, {
      auth: {
        flowType: 'pkce',
        detectSessionInUrl: false,
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }, [isSupabaseConfigured, supabaseAnonKey, supabaseUrl]);

  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(() => (isSupabaseConfigured ? true : false));

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, [isSupabaseConfigured, supabase]);

  const value: AuthContextValue = useMemo(() => {
    const signInWithDiscord = async () => {
      if (!isSupabaseConfigured) {
        alert(
          "Supabase n’est pas configuré. Ajoute NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY dans .env.local, puis redémarre le serveur."
        );
        return;
      }

      const redirectTo = `${window.location.origin}/auth/callback`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: { 
          redirectTo,
          scopes: 'identify email'
        },
      });
      if (error) {
        alert(error.message);
      }
    };

    const signOut = async () => {
      if (!isSupabaseConfigured) {
        setSession(null);
        setUser(null);
        return;
      }

      const { error } = await supabase.auth.signOut();
      if (error) {
        alert(error.message);
      }
    };

    return {
      supabase,
      session,
      user,
      signInWithDiscord,
      signOut,
      loading,
    };
  }, [isSupabaseConfigured, loading, session, supabase, user]);

  return (
    <AuthContext.Provider value={value}>
      {!isSupabaseConfigured ? (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0,0,0,0.85)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <div style={{ maxWidth: 760, width: '100%' }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Configuration requise</h2>
            <p style={{ marginBottom: 12, lineHeight: 1.5 }}>
              Le site essaie d’initialiser Supabase, mais les variables d’environnement sont manquantes.
            </p>
            <pre
              style={{
                whiteSpace: 'pre-wrap',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                fontSize: 13,
              }}
            >
              {`# .env.local (à créer à la racine)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx`}
            </pre>
            <p style={{ marginBottom: 0, lineHeight: 1.5, opacity: 0.9 }}>
              Une fois ajouté, relance <code>npm run dev</code>.
            </p>
          </div>
        </div>
      ) : null}
      {children}
    </AuthContext.Provider>
  );
}
