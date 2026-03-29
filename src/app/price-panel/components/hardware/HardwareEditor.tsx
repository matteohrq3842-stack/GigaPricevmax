"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaTimes, FaSave, FaSpinner } from 'react-icons/fa';
import { useAdmin } from '../../hooks/useAdmin';
import { motion } from 'framer-motion';

interface HardwareDeal {
    id: number;
    title: string;
    price: string;
    old_price: string;
    url: string;
    image: string;
    category: string;
    description?: string;
}

interface HardwareEditorProps {
    deal: HardwareDeal;
    onClose: () => void;
    onSave: () => void;
}

export default function HardwareEditor({ deal, onClose, onSave }: HardwareEditorProps) {
    const { addNotification } = useAdmin();
    const [formData, setFormData] = useState<Partial<HardwareDeal>>({ ...deal });
    const [saving, setSaving] = useState(false);

    useEffect(() => { setFormData({ ...deal }); }, [deal]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch(`/api/panel/hardware/${deal.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: formData.title,
                    price: formData.price,
                    old_price: formData.old_price,
                    url: formData.url,
                    image: formData.image,
                    category: formData.category,
                    description: formData.description,
                }),
            });

            if (!res.ok) throw new Error();
            addNotification('success', "Hardware mis à jour");
            onSave();
            onClose();
        } catch (err) {
            console.error(err);
            addNotification('error', "Erreur mise à jour hardware");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#13141f] w-full max-w-4xl h-[85vh] rounded-2xl border border-[#27272a] shadow-2xl overflow-hidden flex flex-col md:flex-row"
            >
                <div className="w-full md:w-1/2 flex flex-col h-full border-r border-[#27272a] bg-[#0f0f13]">
                    <div className="p-6 border-b border-[#27272a] flex justify-between items-center">
                        <h3 className="text-xl font-bold text-white">Éditer Hardware</h3>
                        <button onClick={onClose}><FaTimes /></button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin">
                        <div>
                            <label className="label-xs">Produit</label>
                            <input name="title" value={formData.title || ''} onChange={handleChange} className="input-dark" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="label-xs">Prix</label>
                                <input name="price" value={formData.price || ''} onChange={handleChange} className="input-dark text-green-400 font-mono" />
                            </div>
                            <div>
                                <label className="label-xs">Ancien Prix</label>
                                <input name="old_price" value={formData.old_price || ''} onChange={handleChange} className="input-dark text-gray-400 font-mono" />
                            </div>
                        </div>
                        <div>
                            <label className="label-xs">Catégorie</label>
                            <select name="category" value={formData.category || 'setup'} onChange={handleChange} className="input-dark">
                                <option value="setup">Setup PC</option>
                                <option value="composants">Composants</option>
                                <option value="peripheriques">Périphériques</option>
                                <option value="consoles">Consoles</option>
                                <option value="accessoires">Accessoires</option>
                            </select>
                        </div>
                        <div>
                            <label className="label-xs">URL Image</label>
                            <input name="image" value={formData.image || ''} onChange={handleChange} className="input-dark text-xs" />
                        </div>
                        <div>
                            <label className="label-xs">Lien Boutique</label>
                            <input name="url" value={formData.url || ''} onChange={handleChange} className="input-dark text-xs text-blue-400" />
                        </div>
                        <div>
                            <label className="label-xs">Description</label>
                            <textarea name="description" value={formData.description || ''} onChange={handleChange} className="input-dark h-24 resize-none" />
                        </div>
                    </div>

                    <div className="p-6 border-t border-[#27272a] flex justify-between bg-[#13141f]">
                        <button type="button" onClick={onClose} className="text-gray-400 hover:text-white">Annuler</button>
                        <button onClick={handleSubmit} disabled={saving} className="btn-primary flex gap-2 items-center">
                            {saving ? <FaSpinner className="animate-spin" /> : <FaSave />} Enregistrer
                        </button>
                    </div>
                </div>

                {/* Preview */}
                <div className="w-1/2 hidden md:flex flex-col items-center justify-center bg-[#09090b] p-8">
                    <div className="w-[320px] bg-[#13141f] rounded-xl border border-[#27272a] overflow-hidden shadow-2xl">
                        <div className="relative aspect-video bg-gray-900">
                            {formData.image ? <Image src={formData.image} alt="" fill className="object-cover" unoptimized /> : null}
                            <div className="absolute top-2 right-2 bg-blue-600 text-xs font-bold px-2 py-1 rounded text-white capitalize">{formData.category}</div>
                        </div>
                        <div className="p-4">
                            <h3 className="text-white font-bold text-sm mb-2 line-clamp-2">{formData.title || 'Produit'}</h3>
                            <div className="text-xl font-bold text-blue-400">{formData.price || '0€'}</div>
                        </div>
                    </div>
                    <p className="mt-4 text-xs text-gray-500">Aperçu Hardware</p>
                </div>
            </motion.div>

            <style jsx>{`
        .label-xs { display: block; font-size: 0.75rem; font-weight: 600; color: #6b7280; text-transform: uppercase; margin-bottom: 0.25rem; }
        .input-dark { width: 100%; background-color: #1a1a20; border: 1px solid #27272a; border-radius: 0.375rem; padding: 0.5rem 0.75rem; color: white; transition: border-color 0.2s; }
        .input-dark:focus { border-color: #8b5cf6; outline: none; }
        .btn-primary { padding: 0.5rem 1.5rem; background-color: #7c3aed; color: white; font-weight: bold; border-radius: 0.5rem; transition: background-color 0.2s; }
        .btn-primary:hover { background-color: #6d28d9; }
        .btn-primary:disabled { opacity: 0.5; }
      `}</style>
        </div>
    );
}
