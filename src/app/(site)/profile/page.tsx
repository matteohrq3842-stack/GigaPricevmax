'use client';

import { useAuth } from '@/components/providers/SessionProvider';
import { isSuperAdmin } from '@/lib/discord-roles';
import { useUserRoles } from '@/hooks/useUserRoles';
import Image from 'next/image';
import Link from 'next/link';
import { FaShieldAlt, FaHistory, FaBell, FaSignOutAlt, FaChevronLeft, FaSpinner } from 'react-icons/fa';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const { formattedRoles: userRoles, loading: loadingRoles, error: roleError } = useUserRoles();

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Non connecté</h1>
          <Link href="/" className="text-purple-400 hover:text-purple-300">
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    );
  }

  // Calcul des permissions basé sur les rôles récupérés
  const isUserSuperAdmin = isSuperAdmin(userRoles.map(r => r.id));
  const createdAt = user.created_at ? new Date(user.created_at) : null;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header / Retour */}
        <div className="flex items-center gap-4">
          <Link 
            href="/" 
            className="w-10 h-10 rounded-full bg-purple-900/20 flex items-center justify-center text-purple-400 hover:bg-purple-900/40 hover:text-white transition-colors"
          >
            <FaChevronLeft />
          </Link>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
            Mon Profil
          </h1>
        </div>

        {/* Carte Principale */}
        <div className="bg-[#13141f] rounded-2xl border border-purple-900/20 overflow-hidden shadow-2xl relative">
          {/* Bannière Décorative */}
          <div className="h-32 bg-gradient-to-r from-purple-900/40 to-indigo-900/40 w-full absolute top-0 left-0"></div>
          
          <div className="relative pt-16 px-8 pb-8 flex flex-col md:flex-row gap-8 items-start">
            
            {/* Avatar & Identité */}
            <div className="flex flex-col items-center gap-4 -mt-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-[#13141f] shadow-xl overflow-hidden bg-[#0a0a0f]">
                  {user.user_metadata?.avatar_url ? (
                    <Image
                      src={user.user_metadata.avatar_url}
                      alt="Avatar"
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-indigo-600 text-4xl font-bold">
                      {user.email?.[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-[#13141f]" title="En ligne"></div>
              </div>
              
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white">
                  {user.user_metadata?.full_name || user.email?.split('@')[0]}
                </h2>
                <p className="text-purple-400/60 text-sm">{user.email}</p>
              </div>

              <button 
                onClick={() => signOut()}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors text-sm font-medium border border-red-500/20 mt-2"
              >
                <FaSignOutAlt />
                Se déconnecter
              </button>
            </div>

            {/* Informations & Rôles */}
            <div className="flex-1 space-y-8 w-full">
              
              {/* Section Rôles */}
              <div>
                <h3 className="text-lg font-bold text-purple-200 mb-4 flex items-center gap-2">
                  <FaShieldAlt className="text-purple-500" />
                  Rôles Serveur
                  {loadingRoles && <FaSpinner className="animate-spin text-purple-400 text-sm" />}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {userRoles.map((role) => (
                    <span 
                      key={role.id}
                      className="px-3 py-1.5 rounded-lg text-sm font-semibold border border-white/5 flex items-center gap-2"
                      style={{ 
                        backgroundColor: `${role.color}15`, // 15 = opacity ~8%
                        color: role.color,
                        borderColor: `${role.color}30`
                      }}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: role.color }}></span>
                      {role.name}
                    </span>
                  ))}
                  {userRoles.length === 0 && !loadingRoles && (
                    <div className="text-gray-500 text-sm">
                      <p>Aucun rôle détecté ou synchronisation impossible.</p>
                      {roleError && <p className="text-red-400 mt-1 text-xs">{roleError}</p>}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Stats Alertes */}
                <div className="bg-[#0a0a0f] p-5 rounded-xl border border-purple-900/20">
                  <h4 className="text-gray-400 text-sm font-medium mb-1 flex items-center gap-2">
                    <FaBell className="text-yellow-500" />
                    Alertes Utilisées
                  </h4>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold text-white">2</span>
                    <span className="text-gray-500 mb-1">/ 5 gratuites</span>
                  </div>
                  <div className="w-full bg-gray-800 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div className="bg-yellow-500 h-full rounded-full" style={{ width: '40%' }}></div>
                  </div>
                </div>

                {/* Info Compte */}
                <div className="bg-[#0a0a0f] p-5 rounded-xl border border-purple-900/20">
                  <h4 className="text-gray-400 text-sm font-medium mb-1 flex items-center gap-2">
                    <FaHistory className="text-blue-500" />
                    Membre depuis
                  </h4>
                  <p className="text-xl font-bold text-white">
                    {createdAt
                      ? createdAt.toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : 'Date inconnue'}
                  </p>
                  <p className="text-xs text-green-400 mt-1">Compte vérifié</p>
                </div>
              </div>

              {/* Accès Staff */}
              {isUserSuperAdmin && (
                <div className="bg-gradient-to-r from-purple-900/20 to-indigo-900/20 p-4 rounded-xl border border-purple-500/30 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white">Accès Staff Autorisé</h4>
                    <p className="text-sm text-purple-300/70">Vous avez accès au Price Panel complet.</p>
                  </div>
                  <Link 
                    href="/price-panel"
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-purple-900/20"
                  >
                    Accéder au Panel
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
