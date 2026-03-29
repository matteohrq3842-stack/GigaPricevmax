"use client";

import React from 'react';

interface DataPoint {
    label: string;
    value: number;
}

interface SimpleLineChartProps {
    data: DataPoint[];
    color?: string;
    height?: number;
}

export default function SimpleLineChart({ data, color = "#8b5cf6", height = 200 }: SimpleLineChartProps) {
    if (!data || data.length === 0) return <div className="h-full flex items-center justify-center text-gray-500">No data</div>;

    const maxVal = Math.max(...data.map(d => d.value)) * 1.1; // +10% padding
    const minVal = 0;

    // Normaliser les coordonnées
    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 100 - ((d.value - minVal) / (maxVal - minVal)) * 100;
        return `${x},${y}`;
    }).join(' ');

    // Area Path (pour le gradient de remplissage)
    const areaPath = `${points} 100,100 0,100`;

    return (
        <div className="w-full relative" style={{ height }}>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                <defs>
                    <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Grille de fond optionnelle */}
                <line x1="0" y1="25" x2="100" y2="25" stroke="#ffffff" strokeOpacity="0.05" strokeWidth="0.5" />
                <line x1="0" y1="50" x2="100" y2="50" stroke="#ffffff" strokeOpacity="0.05" strokeWidth="0.5" />
                <line x1="0" y1="75" x2="100" y2="75" stroke="#ffffff" strokeOpacity="0.05" strokeWidth="0.5" />

                {/* Zone remplie */}
                <path d={`M0,100 ${areaPath}`} fill={`url(#gradient-${color})`} />

                {/* Ligne */}
                <polyline
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    points={points}
                    vectorEffect="non-scaling-stroke"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Points interactifs (simple dots pour l'instant) */}
                {data.map((d, i) => {
                    const x = (i / (data.length - 1)) * 100;
                    const y = 100 - ((d.value - minVal) / (maxVal - minVal)) * 100;
                    return (
                        <circle key={i} cx={x} cy={y} r="0" className="group-hover:r-1 transition-all" fill="white" />
                    );
                })}
            </svg>

            {/* Labels Axe X */}
            <div className="flex justify-between text-[10px] text-gray-500 mt-2 px-1">
                {data.filter((_, i) => i % Math.ceil(data.length / 5) === 0).map((d, i) => (
                    <span key={i}>{d.label}</span>
                ))}
                {/* Toujours afficher le dernier */}
                <span className="hidden sm:inline">{data[data.length - 1].label}</span>
            </div>
        </div>
    );
}
