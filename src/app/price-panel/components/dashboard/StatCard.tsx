"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: string;
    trendUp?: boolean;
    color: string; // Tailwind color class parsing logic or hex
    delay?: number;
}

export default function StatCard({ title, value, icon, trend, trendUp = true, color, delay = 0 }: StatCardProps) {
    // Mapping simple pour les gradients basés sur le nom de couleur (ex: "purple" -> from-purple-500)
    const getGradient = (c: string) => {
        switch (c) {
            case 'purple': return 'from-purple-500 to-indigo-600';
            case 'blue': return 'from-blue-500 to-cyan-600';
            case 'green': return 'from-emerald-500 to-teal-600';
            case 'orange': return 'from-orange-500 to-red-600';
            default: return 'from-gray-500 to-gray-700';
        }
    };

    const getBgColor = (c: string) => {
        switch (c) {
            case 'purple': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
            case 'blue': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'green': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'orange': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
            default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay }}
            className="relative overflow-hidden bg-[#13141f] border border-[#27272a] p-6 rounded-2xl group hover:border-opacity-50 transition-all duration-300"
        >
            <div className={`absolute -right-6 -top-6 w-32 h-32 bg-gradient-to-br ${getGradient(color)} opacity-[0.08] rounded-full blur-2xl group-hover:opacity-[0.15] transition-opacity duration-500`} />

            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={`p-3 rounded-xl border ${getBgColor(color)}`}>
                    {icon}
                </div>
                {trend && (
                    <div className={`px-2 py-1 rounded-full text-xs font-bold border ${trendUp ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                        {trend}
                    </div>
                )}
            </div>

            <div className="relative z-10">
                <h3 className="text-gray-400 font-medium text-sm mb-1">{title}</h3>
                <div className="text-3xl font-bold text-white tracking-tight">{value}</div>
            </div>
        </motion.div>
    );
}
