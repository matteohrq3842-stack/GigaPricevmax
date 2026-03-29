"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { FaMicrochip, FaDesktop, FaHeadphones, FaKeyboard, FaMemory, FaSpinner, FaTrash, FaEdit, FaExternalLinkAlt, FaImage } from 'react-icons/fa';
import { useAdmin } from '../../hooks/useAdmin';
import HardwareEditor from './HardwareEditor';

interface HardwareDeal {
    id: number;
    title: string;
    price: string;
    old_price: string;
    url: string;
    image: string;
    category: string;
    description?: string;
    created_at: string;
}

export default function HardwareView() {
    const { addNotification } = useAdmin();

    const [activeCategory, setActiveCategory] = useState('composants');
    const [deals, setDeals] = useState<HardwareDeal[]>([]);
    const [loading, setLoading] = useState(false);
    const [editingDeal, setEditingDeal] = useState<HardwareDeal | null>(null);

    const categories = [
        { id: 'setup', label: 'Setup PC', icon: <FaDesktop /> },
        { id: 'composants', label: 'Composants', icon: <FaMicrochip /> },
        { id: 'peripheriques', label: 'Périphériques', icon: <FaKeyboard /> },
        { id: 'consoles', label: 'Consoles', icon: <FaHeadphones /> },
        { id: 'accessoires', label: 'Accessoires', icon: <FaMemory /> },
    ];

    const fetchHardware = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/panel/hardware?category=${encodeURIComponent(activeCategory)}`);
            const json = await res.json();
            if (!res.ok) throw new Error(json.error ?? 'Erreur');
            setDeals(json.deals ?? []);
        } catch (err) {
            console.error(err);
            addNotification('error', "Erreur chargement hardware");
        } finally {
            setLoading(false);
        }
    }, [activeCategory, addNotification]);

    useEffect(() => { fetchHardware(); }, [fetchHardware]);

    const handleDelete = async (id: number) => {
        if (!confirm("Êtes-vous sûr de supprimer ce matériel ?")) return;
        try {
            const res = await fetch(`/api/panel/hardware/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error();
            setDeals(prev => prev.filter(d => d.id !== id));
            addNotification('success', "Matériel supprimé");
        } catch {
            addNotification('error', "Erreur suppression");
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold text-white">Hardware</h2>
                    <p className="text-gray-400 mt-1">Gestion des composants et setups.</p>
                </div>
                <button onClick={() => addNotification('info', "Ajout bientôt disponible")} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold shadow-lg shadow-blue-900/20 transition-all font-sm">
                    + Ajouter
                </button>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 pb-4 border-b border-[#27272a]">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${activeCategory === cat.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'bg-[#181820] text-gray-400 hover:bg-[#20202a] hover:text-white'}`}
                    >
                        {cat.icon} {cat.label}
                    </button>
                ))}
            </div>

            {/* Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center p-20 gap-4">
                    <FaSpinner className="animate-spin text-3xl text-blue-500" />
                    <p className="text-gray-500 text-sm">Chargement du matos...</p>
                </div>
            ) : deals.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-20 text-gray-500 border border-dashed border-[#27272a] rounded-xl bg-[#13141f]">
                    <FaMicrochip className="text-4xl mb-2 opacity-20" />
                    <p>Aucun équipement trouvé dans {activeCategory}.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {deals.map(deal => (
                        <div key={deal.id} className="group bg-[#13141f] border border-[#27272a] rounded-xl overflow-hidden hover:border-blue-500/30 transition-all duration-300 flex flex-col">
                            <div className="relative aspect-video bg-[#0a0a0d] border-b border-[#27272a]">
                                {deal.image ? (
                                    <img src={deal.image} alt={deal.title} className="w-full h-full object-contain p-2 opacity-90 group-hover:opacity-100 transition-opacity"
                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-700 bg-[#18181b]">
                                        <FaImage size={24} className="mb-2 opacity-50" />
                                        <span className="text-xs">Image manquante</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                                    <a href={deal.url} target="_blank" className="p-3 bg-white/10 text-white rounded-full hover:bg-blue-600 hover:scale-110 transition-all border border-white/10" title="Voir le lien"><FaExternalLinkAlt /></a>
                                    <button onClick={() => setEditingDeal(deal)} className="p-3 bg-white/10 text-white rounded-full hover:bg-indigo-600 hover:scale-110 transition-all border border-white/10" title="Modifier"><FaEdit /></button>
                                    <button onClick={() => handleDelete(deal.id)} className="p-3 bg-white/10 text-white rounded-full hover:bg-red-600 hover:scale-110 transition-all border border-white/10" title="Supprimer"><FaTrash /></button>
                                </div>
                            </div>
                            <div className="p-4 flex-1 flex flex-col">
                                <div className="mb-2">
                                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 opacity-70">{deal.category}</div>
                                    <h3 className="font-bold text-white text-sm line-clamp-2 h-10 leading-snug" title={deal.title}>{deal.title}</h3>
                                </div>
                                <div className="mt-auto flex items-end justify-between border-t border-[#27272a] pt-3">
                                    <div>
                                        <div className="text-lg font-bold text-blue-400">{deal.price}</div>
                                        {deal.old_price && <div className="text-xs text-gray-500 line-through">{deal.old_price}</div>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {editingDeal && <HardwareEditor deal={editingDeal} onClose={() => setEditingDeal(null)} onSave={fetchHardware} />}
        </div>
    );
}
