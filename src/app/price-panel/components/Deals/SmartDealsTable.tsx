"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { FaSearch, FaFilter, FaTrash, FaEdit, FaExternalLinkAlt, FaSpinner } from 'react-icons/fa';
import { useAdmin } from '../../hooks/useAdmin';
import DealEditor from './DealEditor';

export interface Deal {
    id: number;
    slug: string;
    title: string;
    price: string;
    old_price: string;
    discount: string;
    store: string;
    image_url: string;
    created_at: string;
    link?: string;
}

export default function SmartDealsTable() {
    const { addNotification } = useAdmin();

    const [deals, setDeals] = useState<Deal[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [editingDeal, setEditingDeal] = useState<Deal | null>(null);

    const ITEMS_PER_PAGE = 25;

    const fetchDeals = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: String(page) });
            if (search) params.set('search', search);

            const res = await fetch(`/api/panel/deals?${params.toString()}`);
            const json = await res.json();
            if (!res.ok) throw new Error(json.error ?? 'Erreur');

            setDeals(json.deals ?? []);
            const total = json.total ?? 0;
            setTotalPages(Math.max(1, Math.ceil(total / ITEMS_PER_PAGE)));
        } catch (err) {
            console.error(err);
            addNotification('error', "Impossible de charger les offres");
        } finally {
            setLoading(false);
        }
    }, [page, search, addNotification]);

    useEffect(() => {
        const timer = setTimeout(() => fetchDeals(), 500);
        return () => clearTimeout(timer);
    }, [fetchDeals]);

    const handleDelete = async (id: number) => {
        if (!confirm("Supprimer définitivement cette offre ?")) return;
        try {
            const res = await fetch(`/api/panel/deals/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error();
            setDeals(prev => prev.filter(d => d.id !== id));
            addNotification('success', "Offre supprimée");
        } catch {
            addNotification('error', "Erreur suppression");
        }
    };

    const handleBulkDelete = async () => {
        if (!selectedIds.length) return;
        if (!confirm(`Supprimer ${selectedIds.length} offres ?`)) return;
        try {
            const res = await fetch('/api/panel/deals', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: selectedIds }),
            });
            if (!res.ok) throw new Error();
            setDeals(prev => prev.filter(d => !selectedIds.includes(d.id)));
            setSelectedIds([]);
            addNotification('success', `${selectedIds.length} offres supprimées`);
        } catch {
            addNotification('error', "Erreur suppression groupée");
        }
    };

    const handleSelect = (id: number) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleSelectAll = () => {
        setSelectedIds(selectedIds.length === deals.length ? [] : deals.map(d => d.id));
    };

    return (
        <>
            <div className="bg-[#13141f] border border-[#27272a] rounded-2xl overflow-hidden shadow-xl animate-fade-in">
                {/* Toolbar */}
                <div className="p-4 border-b border-[#27272a] bg-[#181820] flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full sm:w-96">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Rechercher par titre..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-[#0a0a0d] border border-[#27272a] rounded-lg py-2 pl-10 pr-4 text-white placeholder-gray-600 focus:border-purple-500 transition-colors focus:outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        {selectedIds.length > 0 && (
                            <button onClick={handleBulkDelete} className="flex items-center gap-2 px-3 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500 hover:text-white transition-colors text-sm font-medium">
                                <FaTrash size={12} /> Supprimer ({selectedIds.length})
                            </button>
                        )}
                        <div className="h-8 w-[1px] bg-[#27272a] mx-2 hidden sm:block"></div>
                        <button className="flex items-center gap-2 px-3 py-2 bg-[#27272a] text-gray-300 rounded-lg hover:bg-[#32323a] transition-colors text-sm">
                            <FaFilter size={12} /> Filtres
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto min-h-[400px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-64 text-purple-500">
                            <FaSpinner className="animate-spin text-3xl mb-2" />
                            <span className="text-sm">Chargement des offres...</span>
                        </div>
                    ) : deals.length === 0 ? (
                        <div className="flex items-center justify-center h-64 text-gray-500">Aucune offre trouvée.</div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#111116] text-xs uppercase text-gray-500 font-semibold tracking-wider border-b border-[#27272a]">
                                    <th className="p-4 w-10 text-center">
                                        <input type="checkbox" onChange={handleSelectAll} checked={deals.length > 0 && selectedIds.length === deals.length} className="rounded bg-[#27272a] border-gray-600 focus:ring-purple-500 text-purple-600" />
                                    </th>
                                    <th className="p-4">Jeu</th>
                                    <th className="p-4">Prix</th>
                                    <th className="p-4">Remise</th>
                                    <th className="p-4">Date</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#27272a]">
                                {deals.map(deal => (
                                    <tr key={deal.id} className={`group hover:bg-[#1a1a24] transition-colors ${selectedIds.includes(deal.id) ? 'bg-purple-900/10' : ''}`}>
                                        <td className="p-4 text-center">
                                            <input type="checkbox" checked={selectedIds.includes(deal.id)} onChange={() => handleSelect(deal.id)} className="rounded bg-[#27272a] border-gray-600 focus:ring-purple-500 text-purple-600" />
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded bg-[#27272a] relative overflow-hidden flex-shrink-0">
                                                    {deal.image_url ? (
                                                        <img src={deal.image_url} alt="" className="w-full h-full object-cover" />
                                                    ) : <div className="w-full h-full flex items-center justify-center text-xs text-gray-600">N/A</div>}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-medium text-white truncate max-w-[200px] sm:max-w-xs" title={deal.title}>{deal.title}</div>
                                                    <div className="text-xs text-purple-400/60 truncate">{deal.store}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-mono text-emerald-400 font-bold">{deal.price}</div>
                                            {deal.old_price && <div className="text-xs text-gray-500 line-through">{deal.old_price}</div>}
                                        </td>
                                        <td className="p-4">
                                            {deal.discount ? (
                                                <span className="px-2 py-0.5 rounded text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">{deal.discount}</span>
                                            ) : <span className="text-gray-600 text-xs">-</span>}
                                        </td>
                                        <td className="p-4 text-sm text-gray-500">{new Date(deal.created_at).toLocaleDateString()}</td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <a href={`/jeux?slug=${deal.slug}`} target="_blank" className="p-2 text-gray-400 hover:text-white hover:bg-[#27272a] rounded"><FaExternalLinkAlt size={12} /></a>
                                                <button onClick={() => setEditingDeal(deal)} className="p-2 text-blue-400 hover:text-white hover:bg-blue-600 rounded"><FaEdit size={12} /></button>
                                                <button onClick={() => handleDelete(deal.id)} className="p-2 text-red-400 hover:text-white hover:bg-red-600 rounded"><FaTrash size={12} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-[#27272a] bg-[#181820] flex justify-between items-center text-sm text-gray-500">
                    <div>Page {page} sur {totalPages}</div>
                    <div className="flex gap-2">
                        <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-1 bg-[#27272a] rounded hover:bg-[#32323a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Précédent</button>
                        <button disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="px-3 py-1 bg-[#27272a] rounded hover:bg-[#32323a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Suivant</button>
                    </div>
                </div>
            </div>

            {editingDeal && <DealEditor deal={editingDeal} onClose={() => setEditingDeal(null)} onSave={fetchDeals} />}
        </>
    );
}
