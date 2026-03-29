"use client";

import React, { useState, useEffect } from 'react';
import { FaToggleOn, FaToggleOff, FaSave, FaGlobe, FaRobot, FaCookie } from 'react-icons/fa';
import { useAdmin } from '../../hooks/useAdmin';

export default function SettingsView() {
    const { addNotification } = useAdmin();
    const [settings, setSettings] = useState({
        maintenanceMode: false,
        botScanner: true,
        publicApi: false,
        analytics: true
    });

    // Load from localStorage
    useEffect(() => {
        const stored = localStorage.getItem('gp_admin_settings');
        if (stored) {
            setSettings(JSON.parse(stored));
        }
    }, []);

    const toggle = (key: keyof typeof settings) => {
        const newSettings = { ...settings, [key]: !settings[key] };
        setSettings(newSettings);
        localStorage.setItem('gp_admin_settings', JSON.stringify(newSettings));
        addNotification('info', `Paramètre ${key} mis à jour`);
    };

    return (
        <div className="animate-fade-in space-y-8 max-w-4xl">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold text-white">Paramètres</h2>
                    <p className="text-gray-400 mt-1">Configuration globale de l&apos;application GigaPrice.</p>
                </div>
                <button disabled className="px-4 py-2 bg-[#27272a] text-gray-500 rounded-lg cursor-not-allowed">
                    Sauvegarde Auto
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6">

                {/* Section Système */}
                <div className="bg-[#13141f] border border-[#27272a] rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-[#27272a] bg-[#181820]">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <FaGlobe className="text-blue-500" /> Système & Accessibilité
                        </h3>
                    </div>
                    <div className="divide-y divide-[#27272a]">

                        <div className="p-6 flex items-center justify-between hover:bg-[#1a1a20] transition-colors">
                            <div>
                                <div className="font-medium text-white">Mode Maintenance</div>
                                <div className="text-sm text-gray-500">Rend le site inaccessible au public (Page de maintenance).</div>
                            </div>
                            <button onClick={() => toggle('maintenanceMode')} className={`text-4xl transition-colors ${settings.maintenanceMode ? 'text-purple-500' : 'text-gray-700'}`}>
                                {settings.maintenanceMode ? <FaToggleOn /> : <FaToggleOff />}
                            </button>
                        </div>

                        <div className="p-6 flex items-center justify-between hover:bg-[#1a1a20] transition-colors">
                            <div>
                                <div className="font-medium text-white">API Publique</div>
                                <div className="text-sm text-gray-500">Autoriser les requêtes externes sur les deals.</div>
                            </div>
                            <button onClick={() => toggle('publicApi')} className={`text-4xl transition-colors ${settings.publicApi ? 'text-green-500' : 'text-gray-700'}`}>
                                {settings.publicApi ? <FaToggleOn /> : <FaToggleOff />}
                            </button>
                        </div>

                    </div>
                </div>

                {/* Section Bot */}
                <div className="bg-[#13141f] border border-[#27272a] rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-[#27272a] bg-[#181820]">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <FaRobot className="text-orange-500" /> Automation & Bot
                        </h3>
                    </div>
                    <div className="divide-y divide-[#27272a]">

                        <div className="p-6 flex items-center justify-between hover:bg-[#1a1a20] transition-colors">
                            <div>
                                <div className="font-medium text-white">Scanner Actif</div>
                                <div className="text-sm text-gray-500">Désactiver pour arrêter la recherche automatique de deals.</div>
                            </div>
                            <button onClick={() => toggle('botScanner')} className={`text-4xl transition-colors ${settings.botScanner ? 'text-green-500' : 'text-gray-700'}`}>
                                {settings.botScanner ? <FaToggleOn /> : <FaToggleOff />}
                            </button>
                        </div>

                        <div className="p-6 flex items-center justify-between hover:bg-[#1a1a20] transition-colors">
                            <div>
                                <div className="font-medium text-white">Analytics / Tracking</div>
                                <div className="text-sm text-gray-500">Collecte des statistiques d&apos;utilisation (Interne).</div>
                            </div>
                            <button onClick={() => toggle('analytics')} className={`text-4xl transition-colors ${settings.analytics ? 'text-blue-500' : 'text-gray-700'}`}>
                                {settings.analytics ? <FaToggleOn /> : <FaToggleOff />}
                            </button>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}
