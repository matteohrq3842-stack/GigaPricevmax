"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  FaChartLine, 
  FaGamepad, 
  FaUsers, 
  FaGavel, 
  FaBook, 
  FaCog, 
  FaSignOutAlt, 
  FaGlobe, 
  FaDesktop
} from 'react-icons/fa';
import { useAuth } from '@/components/providers/SessionProvider';
import { isSuperAdmin } from '@/lib/discord-roles';
import { useUserRoles } from '@/hooks/useUserRoles';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const { signOut, user } = useAuth();
  const { roleIds } = useUserRoles();
  const isSuper = isSuperAdmin(roleIds);
  const mainItems = [
    { id: 'dashboard', label: 'Vue d\'ensemble', icon: <FaChartLine /> },
    { id: 'deals', label: 'Offres & Jeux', icon: <FaGamepad /> },
    { id: 'hardware_setup', label: 'Hardware', icon: <FaDesktop /> }, // Redirige vers la vue Hardware par défaut
    { id: 'users', label: 'Utilisateurs', icon: <FaUsers /> },
  ];

  const resourceItems = [
    { id: 'docs', label: 'Documentation', icon: <FaBook /> }, // Visible mais Read-Only (géré dans le composant)
  ];

  // Only add restricted items if Super Admin
  if (isSuper) {
    resourceItems.push(
      { id: 'legal', label: 'Juridique', icon: <FaGavel /> },
      { id: 'settings', label: 'Paramètres', icon: <FaCog /> }
    );
  } else {
    // Staff restricted can see Documentation but not Settings/Legal
    // Already handled by initial push of 'docs'
  }

  const renderMenuItem = (item: { id: string; label: string; icon: React.ReactNode }) => (
    <button
      key={item.id}
      onClick={() => setActiveTab(item.id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
        activeTab === item.id
          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25 border border-purple-500/20'
          : 'bg-purple-900/5 text-purple-300/60 hover:bg-purple-900/20 hover:text-purple-100 border border-transparent hover:border-purple-500/10'
      }`}
    >
      <span className={`text-lg transition-transform duration-200 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`}>
        {item.icon}
      </span>
      <span className="font-medium tracking-wide">{item.label}</span>
      {activeTab === item.id && (
        <span className="ml-auto w-2 h-2 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"></span>
      )}
    </button>
  );

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-[#0f1016] border-r border-purple-900/20 flex flex-col z-50">
      {/* Logo Area */}
      <div className="p-6 border-b border-purple-900/20 flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center font-bold text-white text-lg shadow-lg shadow-purple-500/20">
          GP
        </div>
        <div>
          <h1 className="font-bold text-white tracking-wide">GigaPrice</h1>
          <p className="text-xs text-purple-400 font-medium">ADMIN PANEL</p>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 mx-4 mt-4 mb-2 bg-purple-900/10 rounded-xl border border-purple-500/20 flex items-center gap-3">
        {user?.user_metadata?.avatar_url ? (
          <Image
            src={user.user_metadata.avatar_url}
            alt="Avatar"
            width={40}
            height={40}
            className="w-10 h-10 rounded-full border-2 border-purple-500/30"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-300 font-bold border border-purple-500/30">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="overflow-hidden">
          <p className="text-sm font-bold text-white truncate">{user?.user_metadata?.full_name || 'Admin'}</p>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <p className="text-xs text-green-400 font-medium">En ligne</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
        {mainItems.map(renderMenuItem)}

        <div className="pt-2">
          <div className="w-full h-px bg-purple-900/20 mb-4"></div>
          <div className="space-y-2">
            {resourceItems.map(renderMenuItem)}
          </div>
        </div>
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-purple-900/20 space-y-3">
        <Link 
          href="/"
          className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-purple-300/60 hover:text-white hover:bg-purple-900/20 transition-colors"
        >
          <FaGlobe />
          <span>Retour au site</span>
        </Link>
        <button 
          onClick={() => signOut()}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-400 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/20 transition-all"
        >
          <FaSignOutAlt />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}
