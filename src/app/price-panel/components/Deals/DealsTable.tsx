"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { FaEdit, FaTrash, FaExternalLinkAlt, FaSpinner, FaSearch } from 'react-icons/fa';
import { useAuth } from '@/components/providers/SessionProvider';
import DealFormModal from './DealFormModal';

interface Deal {
    id: number;
    slug: string;
    title: string;
    price: string;
    old_price: string;
    discount: string;
    store: string;
    image_url: string;
    created_at: string;
    status?: string; // Si existe dans la BDD
}

export default function DealsTable() {
    const { supabase } = useAuth();
    const [deals, setDeals] = useState<Deal[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
    const ITEMS_PER_PAGE = 20;

    const fetchDeals = useCallback(async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('bot_deals')
                .select('*', { count: 'exact' })
                .order('created_at', { ascending: false });

            if (search) {
                query = query.ilike('title', `%${search}%`);
            }

            const from = (page - 1) * ITEMS_PER_PAGE;
            const to = from + ITEMS_PER_PAGE - 1;

            const { data, error, count } = await query.range(from, to);

            if (error) throw error;

            setDeals(data as Deal[] || []);
            if (count) {
                setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));
            }
        } catch (err) {
            console.error('Error fetching deals:', err);
        } finally {
            setLoading(false);
        }
    }, [supabase, page, search]);

    useEffect(() => {
        // Debounce search
        const timer = setTimeout(() => {
            fetchDeals();
        }, 500);
        return () => clearTimeout(timer);
    }, [fetchDeals]);

    const handleDelete = async (id: number) => {
        if (!confirm('Supprimer cette offre ?')) return;
        try {
            const { error } = await supabase.from('bot_deals').delete().eq('id', id);
            if (error) throw error;
            setDeals(prev => prev.filter(d => d.id !== id));
        } catch (err) {
            alert("Erreur lors de la suppression");
            console.error(err);
        }
    };

    return (
        <div className="space-y-6">
            {/* Barre de recherche */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-purple-900/10 p-4 rounded-xl border border-purple-500/20">
                <div className="relative w-full max-w-md">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-300/40" />
                    <input
                        type="text"
                        placeholder="Rechercher par titre..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1); // Reset page on search
                        }}
                        className="w-full bg-[#13141f] border border-purple-500/20 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-purple-500 transition-colors"
                    />
                </div>
                <div className="text-sm text-purple-300/60">
                    Page {page} sur {totalPages}
                </div>
            </div>

            {/* Tableau */}
            <div className="bg-[#13141f] rounded-xl border border-purple-900/20 overflow-hidden shadow-xl">
                {loading ? (
                    <div className="p-12 flex justify-center">
                        <FaSpinner className="animate-spin text-3xl text-purple-500" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-purple-900/20 border-b border-purple-900/20 text-purple-200 text-sm uppercase tracking-wider">
                                    <th className="p-4">Image</th>
                                    <th className="p-4">Titre</th>
                                    <th className="p-4">Prix</th>
                                    <th className="p-4">Remise</th>
                                    <th className="p-4">Date</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-purple-900/10">
                                {deals.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-gray-500">Aucune offre trouvée.</td>
                                    </tr>
                                ) : (
                                    deals.map((deal) => (
                                        <tr key={deal.id} className="hover:bg-purple-900/5 transition-colors group">
                                            <td className="p-4 w-16">
                                                <div className="w-12 h-12 relative bg-white/5 rounded overflow-hidden">
                                                    {deal.image_url ? (
                                                        <Image src={deal.image_url} alt="" fill className="object-cover" sizes="48px" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">IMG</div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4 max-w-xs truncate font-medium text-white" title={deal.title}>
                                                {deal.title}
                                                <div className="text-xs text-purple-400/50">{deal.slug}</div>
                                            </td>
                                            <td className="p-4 font-mono text-green-400">
                                                {deal.price}
                                                {deal.old_price && <span className="ml-2 text-xs text-gray-500 line-through">{deal.old_price}</span>}
                                            </td>
                                            <td className="p-4 text-sm font-bold text-purple-300">
                                                {deal.discount}
                                            </td>
                                            <td className="p-4 text-sm text-gray-400">
                                                {new Date(deal.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    {/* Boutons d'action */}
                                                    <button
                                                        onClick={() => setEditingDeal(deal)}
                                                        className="p-2 bg-blue-500/10 text-blue-400 rounded hover:bg-blue-500 hover:text-white transition-colors"
                                                        title="Éditer"
                                                    >
                                                        <FaEdit size={14} />
                                                    </button>
                                                    <a
                                                        href={`/jeux?slug=${deal.slug}`}
                                                        target="_blank"
                                                        className="p-2 bg-purple-500/10 text-purple-400 rounded hover:bg-purple-500 hover:text-white transition-colors"
                                                        title="Voir sur le site"
                                                    >
                                                        <FaExternalLinkAlt size={14} />
                                                    </a>
                                                    <button
                                                        onClick={() => handleDelete(deal.id)}
                                                        className="p-2 bg-red-500/10 text-red-400 rounded hover:bg-red-500 hover:text-white transition-colors"
                                                        title="Supprimer"
                                                    >
                                                        <FaTrash size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination */}
            <div className="flex justify-center gap-2 pt-4">
                <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 bg-purple-900/20 text-white rounded-lg disabled:opacity-50 hover:bg-purple-900/40"
                >
                    Précédent
                </button>
                <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 bg-purple-900/20 text-white rounded-lg disabled:opacity-50 hover:bg-purple-900/40"
                >
                    Suivant
                </button>
            </div>

            {/* Modal d'édition */}
            {editingDeal && (
                <DealFormModal
                    deal={editingDeal}
                    onClose={() => setEditingDeal(null)}
                    onSave={() => fetchDeals()}
                />
            )}
        </div>
    );
}
