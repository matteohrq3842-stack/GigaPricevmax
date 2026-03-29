"use client";

import React, { useEffect, useState } from 'react';
import { FaGamepad, FaMicrochip, FaUsers, FaSearchDollar } from 'react-icons/fa';
import StatCard from './StatCard';
import SimpleLineChart from './SimpleLineChart';

export default function DashboardView() {
    const [stats, setStats] = useState({ games: 0, hardware: 0, loading: true });
    const [recentActivity, setRecentActivity] = useState<{ id: number; title: string; created_at: string }[]>([]);

    const mockChartData = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return {
            label: d.toLocaleDateString('fr-FR', { weekday: 'short' }),
            value: Math.floor(Math.random() * 50) + 1200,
        };
    });

    useEffect(() => {
        async function loadStats() {
            try {
                const res = await fetch('/api/panel/dashboard');
                const json = await res.json();
                setStats({ games: json.games ?? 0, hardware: json.hardware ?? 0, loading: false });
                setRecentActivity(json.recentActivity ?? []);
            } catch (e) {
                console.error('Dashboard Load Error', e);
                setStats(s => ({ ...s, loading: false }));
            }
        }
        loadStats();
    }, []);

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        Dashboard
                    </h2>
                    <p className="text-gray-400 mt-1">Vue d&apos;ensemble de l&apos;écosystème GigaPrice.</p>
                </div>
                <div className="text-sm text-gray-500 font-mono bg-[#13141f] px-3 py-1 rounded border border-[#27272a]">
                    v3.0.0-stable
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Jeux Référencés" value={stats.loading ? "..." : stats.games} icon={<FaGamepad size={20} />} color="purple" trend="+12 sem." delay={0} />
                <StatCard title="Offres Hardware" value={stats.loading ? "..." : stats.hardware} icon={<FaMicrochip size={20} />} color="blue" trend="+5 new" delay={0.1} />
                <StatCard title="Utilisateurs" value="Active" icon={<FaUsers size={20} />} color="green" delay={0.2} trendUp={true} />
                <StatCard title="Scan Cycles" value="24 / 24h" icon={<FaSearchDollar size={20} />} color="orange" delay={0.3} trend="Actif" />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-[#13141f] border border-[#27272a] rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-6">Activité des Scanners</h3>
                    <div className="h-[300px]">
                        <SimpleLineChart data={mockChartData} color="#8b5cf6" height={300} />
                    </div>
                </div>

                <div className="bg-[#13141f] border border-[#27272a] rounded-2xl p-6 flex flex-col">
                    <h3 className="text-lg font-bold text-white mb-4">Activité Récente (Live)</h3>
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-purple-900 scrollbar-track-transparent">
                        {recentActivity.length === 0 ? (
                            <div className="text-gray-500 text-sm">Aucune activité récente.</div>
                        ) : (
                            recentActivity.map((item) => (
                                <div key={item.id} className="flex gap-3 text-sm border-b border-[#27272a] pb-3 last:border-0 last:pb-0">
                                    <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0 animate-pulse" />
                                    <div>
                                        <p className="text-gray-300 font-medium line-clamp-1">{item.title}</p>
                                        <p className="text-gray-500 text-xs">
                                            Nouveau Deal • {new Date(item.created_at).toLocaleDateString()} {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="mt-4 pt-4 border-t border-[#27272a]">
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div> Bot Actif
                            <div className="w-2 h-2 rounded-full bg-blue-500 ml-2"></div> Système OK
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
