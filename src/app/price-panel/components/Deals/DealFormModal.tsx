"use client";

import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaSpinner } from 'react-icons/fa';
import Image from 'next/image';
import { useAuth } from '@/components/providers/SessionProvider';

interface Deal {
    id: number;
    slug: string;
    title: string;
    price: string;
    old_price: string;
    discount: string;
    store: string;
    image_url: string;
    link?: string; // colonne 'link' probable, à vérifier, sinon on utilisera slug pour déduire
}

interface DealFormModalProps {
    deal: Deal;
    onClose: () => void;
    onSave: () => void;
}

export default function DealFormModal({ deal, onClose, onSave }: DealFormModalProps) {
    const { supabase } = useAuth();
    const [formData, setFormData] = useState<Partial<Deal>>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setFormData({ ...deal });
    }, [deal]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { error } = await supabase
                .from('bot_deals')
                .update({
                    title: formData.title,
                    price: formData.price,
                    old_price: formData.old_price,
                    discount: formData.discount,
                    store: formData.store,
                    image_url: formData.image_url,
                    // link: formData.link // Si la colonne existe
                })
                .eq('id', deal.id);

            if (error) throw error;
            onSave(); // Trigger refresh parent
            onClose();
        } catch (err) {
            console.error("Erreur update deal:", err);
            alert("Erreur lors de la mise à jour.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#13141f] rounded-xl border border-purple-500/20 w-full max-w-2xl shadow-2xl overflow-hidden">
                <form onSubmit={handleSubmit} className="flex flex-col max-h-[90vh]">
                    {/* Header */}
                    <div className="p-6 border-b border-purple-500/10 flex justify-between items-center bg-purple-900/10">
                        <h3 className="text-xl font-bold text-white">Éditer le jeu</h3>
                        <button type="button" onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                            <FaTimes size={20} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 overflow-y-auto space-y-6">
                        <div className="flex gap-6">
                            {/* Image Preview */}
                            <div className="w-1/3 space-y-2">
                                <div className="aspect-[2/3] bg-black/40 rounded-lg overflow-hidden border border-purple-500/20 relative">
                                    {formData.image_url ? (
                                        <Image src={formData.image_url} alt="Preview" fill className="object-cover" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-600">No Image</div>
                                    )}
                                </div>
                            </div>

                            {/* Fields */}
                            <div className="w-2/3 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Titre</label>
                                    <input
                                        name="title"
                                        value={formData.title || ''}
                                        onChange={handleChange}
                                        className="w-full bg-[#0B0C15] border border-purple-500/20 rounded px-3 py-2 text-white focus:border-purple-500"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Prix</label>
                                        <input
                                            name="price"
                                            value={formData.price || ''}
                                            onChange={handleChange}
                                            className="w-full bg-[#0B0C15] border border-purple-500/20 rounded px-3 py-2 text-white focus:border-purple-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Ancien Prix</label>
                                        <input
                                            name="old_price"
                                            value={formData.old_price || ''}
                                            onChange={handleChange}
                                            className="w-full bg-[#0B0C15] border border-purple-500/20 rounded px-3 py-2 text-white focus:border-purple-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Remise</label>
                                        <input
                                            name="discount"
                                            value={formData.discount || ''}
                                            onChange={handleChange}
                                            className="w-full bg-[#0B0C15] border border-purple-500/20 rounded px-3 py-2 text-white focus:border-purple-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Boutique</label>
                                        <input
                                            name="store"
                                            value={formData.store || ''}
                                            onChange={handleChange}
                                            className="w-full bg-[#0B0C15] border border-purple-500/20 rounded px-3 py-2 text-white focus:border-purple-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">URL Image</label>
                                    <input
                                        name="image_url"
                                        value={formData.image_url || ''}
                                        onChange={handleChange}
                                        className="w-full bg-[#0B0C15] border border-purple-500/20 rounded px-3 py-2 text-xs text-gray-300 focus:border-purple-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-purple-500/10 bg-purple-900/10 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 hover:bg-white/5 rounded text-gray-300 transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded shadow-lg shadow-purple-900/20 flex items-center gap-2"
                        >
                            {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                            Enregistrer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
