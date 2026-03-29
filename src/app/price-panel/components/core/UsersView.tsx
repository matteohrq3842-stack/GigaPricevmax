"use client";

import React from 'react';
import { useAuth } from '@/components/providers/SessionProvider';
import { FaUserShield, FaEnvelope, FaFingerprint, FaClock } from 'react-icons/fa';

export default function UsersView() {
    const { user } = useAuth();

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold text-white">Utilisateurs</h2>
                    <p className="text-gray-400 mt-1">Gestion des accès et des rôles.</p>
                </div>
                <div className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-sm font-bold">
                    Système d&apos;authentification Actif
                </div>
            </div>

            {/* Current User Card */}
            <div className="bg-[#13141f] border border-[#27272a] rounded-2xl p-8 max-w-2xl">
                <div className="flex items-start gap-6">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl font-bold text-white shadow-2xl">
                        {user?.email?.[0].toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 space-y-4">
                        <div>
                            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                                {user?.email?.split('@')[0]}
                                <FaUserShield className="text-purple-400 text-lg" title="Super Admin" />
                            </h3>
                            <p className="text-gray-500">Compte Administrateur Principal</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-[#1a1a20] p-3 rounded-lg border border-[#27272a] flex items-center gap-3">
                                <FaEnvelope className="text-gray-500" />
                                <div className="text-sm text-gray-300 truncate">{user?.email}</div>
                            </div>
                            <div className="bg-[#1a1a20] p-3 rounded-lg border border-[#27272a] flex items-center gap-3">
                                <FaFingerprint className="text-gray-500" />
                                <div className="text-sm text-gray-300 font-mono text-xs">{user?.id}</div>
                            </div>
                        </div>

                        <div className="bg-[#1a1a20] p-3 rounded-lg border border-[#27272a] flex items-center gap-3">
                            <FaClock className="text-gray-500" />
                            <div className="text-sm text-gray-300">Dernière connexion : {new Date().toLocaleDateString()} (Session active)</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Warning/Info Box */}
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-200 text-sm max-w-2xl">
                <strong>Note :</strong> La gestion avancée des utilisateurs (invitations, rôles) se fait directement via la console Supabase pour des raisons de sécurité. Cette vue affiche votre profil actuel.
            </div>
        </div>
    );
}
