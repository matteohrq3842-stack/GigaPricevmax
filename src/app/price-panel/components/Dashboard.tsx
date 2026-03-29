"use client";

import React, { useEffect, useState } from 'react';
import { FaGamepad, FaMicrochip, FaUsers, FaChartLine, FaServer, FaExclamationTriangle } from 'react-icons/fa';
import { useAuth } from '@/components/providers/SessionProvider';

export default function Dashboard() {
  const { supabase } = useAuth();
  const [stats, setStats] = useState({
    games: 0,
    hardware: 0,
    users: 0, // Placeholder si pas d'accès users
    loading: true
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const { count: gamesCount } = await supabase.from('bot_deals').select('*', { count: 'exact', head: true });
        const { count: hardwareCount } = await supabase.from('hardware_deals').select('*', { count: 'exact', head: true });
        // const { count: usersCount } = await supabase.from('users').select('*', { count: 'exact', head: true }); // Si table users accessible

        setStats({
          games: gamesCount || 0,
          hardware: hardwareCount || 0,
          users: 0,
          loading: false
        });
      } catch (e) {
        console.error("Erreur chargement stats", e);
        setStats(s => ({ ...s, loading: false }));
      }
    }
    loadStats();
  }, [supabase]);

  const cards = [
    {
      title: "Jeux Référencés",
      value: stats.loading ? "..." : stats.games,
      icon: <FaGamepad size={24} />,
      color: "from-purple-500 to-indigo-500",
      desc: "Offres actives dans la base"
    },
    {
      title: "Offres Hardware",
      value: stats.loading ? "..." : stats.hardware,
      icon: <FaMicrochip size={24} />,
      color: "from-blue-500 to-cyan-500",
      desc: "Composants et périphériques"
    },
    {
      title: "Utilisateurs",
      value: "N/A",
      icon: <FaUsers size={24} />,
      color: "from-emerald-500 to-teal-500",
      desc: "Comptes inscrits (Géré par Supabase Auth)"
    },
    {
      title: "Status Bot",
      value: "Actif",
      icon: <FaServer size={24} />,
      color: "from-green-500 to-emerald-500",
      desc: "Scanner opérationnel"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <div key={index} className="bg-[#13141f] p-6 rounded-xl border border-purple-500/20 relative overflow-hidden group hover:border-purple-500/40 transition-all duration-300">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${card.color} opacity-10 rounded-bl-full transform group-hover:scale-110 transition-transform duration-500`}></div>

            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-lg bg-gradient-to-br ${card.color} bg-opacity-20 text-white shadow-lg`}>
                {card.icon}
              </div>
              {/* <span className="text-xs font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded">+12%</span> */}
            </div>

            <div className="relative z-10">
              <h3 className="text-gray-400 text-sm font-medium mb-1">{card.title}</h3>
              <div className="text-3xl font-bold text-white mb-2">{card.value}</div>
              <p className="text-xs text-purple-300/40">{card.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#13141f] p-6 rounded-xl border border-purple-500/20">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FaChartLine className="text-purple-500" />
            Activité Récente
          </h3>
          <div className="text-gray-500 text-sm text-center py-8">
            Les logs d&apos;activité seront disponibles prochainement.
          </div>
        </div>

        <div className="bg-[#13141f] p-6 rounded-xl border border-purple-500/20">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FaExclamationTriangle className="text-yellow-500" />
            Alertes Système
          </h3>
          <div className="space-y-4">
            <div className="bg-yellow-500/10 border-l-4 border-yellow-500 p-4 rounded-r-lg">
              <p className="text-yellow-200 text-sm font-medium">Le système de tracking d&apos;intérêt est actif.</p>
              <p className="text-yellow-200/60 text-xs mt-1">Vérifiez les logs régulièrement.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
