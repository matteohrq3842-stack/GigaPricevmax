"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaTimes, FaSave, FaSpinner, FaGlobe } from 'react-icons/fa';
import { Deal } from './SmartDealsTable';
import { useAdmin } from '../../hooks/useAdmin';
import { motion } from 'framer-motion';

interface DealEditorProps {
    deal: Deal;
    onClose: () => void;
    onSave: () => void;
}

export default function DealEditor({ deal, onClose, onSave }: DealEditorProps) {
    const { addNotification } = useAdmin();
    const [formData, setFormData] = useState<Partial<Deal>>({ ...deal });
    const [saving, setSaving] = useState(false);

    useEffect(() => { setFormData({ ...deal }); }, [deal]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch(`/api/panel/deals/${deal.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: formData.title,
                    price: formData.price,
                    old_price: formData.old_price,
                    discount: formData.discount,
                    store: formData.store,
                    image_url: formData.image_url,
                }),
            });

            if (!res.ok) throw new Error();
            addNotification('success', "Jeu mis à jour avec succès");
            onSave();
            onClose();
        } catch (err) {
            console.error(err);
            addNotification('error', "Échec de la mise à jour");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#13141f] w-full max-w-4xl h-[80vh] rounded-2xl border border-[#27272a] shadow-2xl overflow-hidden flex flex-col md:flex-row"
            >
                {/* LEFT: Form */}
                <div className="w-full md:w-1/2 flex flex-col h-full border-r border-[#27272a] bg-[#0f0f13]">
                    <div className="p-6 border-b border-[#27272a] flex justify-between items-center">
                        <h3 className="text-xl font-bold text-white">Éditer le jeu</h3>
                        <div className="md:hidden"><button onClick={onClose}><FaTimes /></button></div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin scrollbar-thumb-purple-900">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Titre du jeu</label>
                            <input name="title" value={formData.title || ''} onChange={handleChange} className="w-full bg-[#1a1a20] border border-[#27272a] rounded px-3 py-2 text-white focus:border-purple-500 transition-colors" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Prix Actuel</label>
                                <input name="price" value={formData.price || ''} onChange={handleChange} className="w-full bg-[#1a1a20] border border-[#27272a] rounded px-3 py-2 text-white font-mono text-green-400 focus:border-purple-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Ancien Prix</label>
                                <input name="old_price" value={formData.old_price || ''} onChange={handleChange} className="w-full bg-[#1a1a20] border border-[#27272a] rounded px-3 py-2 text-gray-400 font-mono focus:border-purple-500" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Remise</label>
                                <input name="discount" value={formData.discount || ''} onChange={handleChange} className="w-full bg-[#1a1a20] border border-[#27272a] rounded px-3 py-2 text-purple-400 font-bold focus:border-purple-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Boutique</label>
                                <input name="store" value={formData.store || ''} onChange={handleChange} className="w-full bg-[#1a1a20] border border-[#27272a] rounded px-3 py-2 text-white focus:border-purple-500" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">URL Image</label>
                            <div className="flex gap-2">
                                <input name="image_url" value={formData.image_url || ''} onChange={handleChange} className="w-full bg-[#1a1a20] border border-[#27272a] rounded px-3 py-2 text-gray-400 text-sm focus:border-purple-500" />
                                <button type="button" className="p-2 bg-[#27272a] rounded hover:bg-white hover:text-black transition-colors" title="Vérifier"><FaGlobe /></button>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-t border-[#27272a] flex justify-between items-center bg-[#13141f]">
                        <button type="button" onClick={onClose} className="text-gray-400 hover:text-white transition-colors">Annuler</button>
                        <button onClick={handleSubmit} disabled={saving} className="px-6 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-white font-bold flex items-center gap-2 transition-transform active:scale-95 disabled:opacity-50">
                            {saving ? <FaSpinner className="animate-spin" /> : <FaSave />} Enregistrer
                        </button>
                    </div>
                </div>

                {/* RIGHT: Preview */}
                <div className="w-1/2 hidden md:flex flex-col items-center justify-center bg-[#09090b] p-8 border-l border-[#27272a] relative">
                    <div className="absolute top-4 right-4 text-xs text-gray-500 uppercase tracking-widest font-bold">Aperçu en direct</div>
                    <div className="w-[300px] bg-[#13141f] rounded-xl border border-[#27272a] overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-300">
                        <div className="relative aspect-[3/4] bg-gray-800">
                            {formData.image_url ? (
                                <Image src={formData.image_url} alt="Preview" fill className="object-cover" unoptimized />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-600">No Image</div>
                            )}
                            {formData.discount && (
                                <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded">{formData.discount}</div>
                            )}
                        </div>
                        <div className="p-4">
                            <div className="text-xs text-purple-400 font-bold mb-1 uppercase tracking-wide">{formData.store || 'Store'}</div>
                            <h3 className="text-white font-bold text-lg leading-tight mb-2 line-clamp-2">{formData.title || 'Titre du jeu'}</h3>
                            <div className="flex items-end gap-2">
                                <div className="text-2xl font-bold text-white">{formData.price || '0€'}</div>
                                {formData.old_price && <div className="text-sm text-gray-500 line-through mb-1">{formData.old_price}</div>}
                            </div>
                        </div>
                    </div>
                    <p className="mt-8 text-gray-500 text-sm max-w-xs text-center">
                        Voici à quoi ressemblera la carte sur le site public.
                    </p>
                    <button onClick={onClose} className="absolute top-4 left-4 text-gray-500 hover:text-white"><FaTimes /></button>
                </div>
            </motion.div>
        </div>
    );
}
