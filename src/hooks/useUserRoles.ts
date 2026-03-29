import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/SessionProvider';
import { getUserRolesDisplay } from '@/lib/discord-roles';

const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

export function useUserRoles() {
  const { user, session } = useAuth();
  const [roleIds, setRoleIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setRoleIds([]);
      return;
    }

    const CACHE_KEY = `discord_roles_${user.id}`;

    const fetchRoles = async () => {
      // 1. Try cache
      const cached = localStorage.getItem(CACHE_KEY);
      let cachedRoles: string[] | null = null;
      let isCacheValid = false;

      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          cachedRoles = parsed.roles;
          if (Date.now() - parsed.timestamp < CACHE_DURATION) {
            isCacheValid = true;
          }
        } catch {
          localStorage.removeItem(CACHE_KEY);
        }
      }

      if (cachedRoles) setRoleIds(cachedRoles);
      if (isCacheValid) return;

      if (!session?.access_token) return;

      setLoading(true);
      setError(null);

      try {
        const identity = user.identities?.find((i) => i.provider === 'discord');
        const identityData = (identity?.identity_data ?? {}) as Record<string, unknown>;
        const discordId = String(
          identityData.sub ?? identityData.id ?? (user.user_metadata as Record<string, unknown> | null)?.sub ?? ''
        ).trim();

        if (!discordId) return;

        const res = await fetch(`/api/panel/user-roles?discord_id=${encodeURIComponent(discordId)}`);
        if (!res.ok) {
          setError('Impossible de récupérer les rôles.');
          return;
        }

        const json = await res.json();
        const roles: string[] = Array.isArray(json.roles) ? json.roles : [];

        setRoleIds(roles);
        localStorage.setItem(CACHE_KEY, JSON.stringify({ roles, timestamp: Date.now() }));
      } catch {
        setError('Erreur de connexion.');
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, [user, session]);

  const formattedRoles = getUserRolesDisplay(roleIds);
  return { roleIds, formattedRoles, loading, error };
}
