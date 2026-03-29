"use client";

import React, { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { FaEdit, FaTrash, FaUser, FaSpinner, FaExternalLinkAlt, FaTimes, FaSave } from 'react-icons/fa';
import { useAuth } from '@/components/providers/SessionProvider';
import { rewriteAffiliateUrl } from '@/utils/tracker';

interface HardwareDeal {
  id: string;
  name: string;
  title?: string; // Fallback
  product_name?: string; // Fallback
  price: number;
  new_price?: number; // Fallback
  old_price: number | null;
  url: string;
  link?: string; // Fallback
  amazon_url?: string; // Fallback
  image_url: string | null;
  image?: string | null;
  description?: string; // New field
  extra_images?: string[]; // New field
  category: string;
  status: 'pending' | 'validated' | 'rejected';
  posted_by: string | null;
  created_at: string;
}

interface HardwareDealsProps {
  category: string;
}

export default function HardwareDeals({ category }: HardwareDealsProps) {
  const { supabase } = useAuth();
  const [deals, setDeals] = useState<HardwareDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingDeal, setEditingDeal] = useState<HardwareDeal | null>(null);
  const [saving, setSaving] = useState(false);

  const getErrorMessage = (err: unknown) => {
    if (!err) return 'Erreur inconnue';
    if (typeof err === 'string') return err;
    if (err instanceof Error) return err.message;
    if (typeof err === 'object') {
      const e = err as Record<string, unknown>;
      const message = typeof e.message === 'string' ? e.message : '';
      const details = typeof e.details === 'string' ? e.details : '';
      const hint = typeof e.hint === 'string' ? e.hint : '';
      const code = typeof e.code === 'string' ? e.code : '';
      const parts = [message, details, hint, code ? `code:${code}` : ''].filter(Boolean);
      return parts.join(' | ') || 'Erreur inconnue';
    }
    return 'Erreur inconnue';
  };

  const fetchDeals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('hardware_deals')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        // Debug logs removed for production
      }

      if (error) throw error;
      setDeals(data || []);
    } catch (err: unknown) {
      console.error('Error fetching deals:', err);
      setError('Impossible de charger les offres.');
    } finally {
      setLoading(false);
    }
  }, [category, supabase]);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) return;

    try {
      const { error } = await supabase
        .from('hardware_deals')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setDeals(deals.filter(d => d.id !== id));
    } catch (err: unknown) {
      console.error('Error deleting deal:', err);
      alert(`Erreur lors de la suppression: ${getErrorMessage(err)}`);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDeal) return;

    setSaving(true);
    try {
      // Find original deal to check for valid columns
      const originalDeal = deals.find(d => d.id === editingDeal.id);
      if (!originalDeal) throw new Error("Original deal not found");

      const updates: Partial<HardwareDeal> = {};

      // Update fields only if they exist in the original deal (schema)

      // Price
      // Use new_price if defined, otherwise keep existing price
      const finalPrice = editingDeal.new_price !== undefined ? editingDeal.new_price : editingDeal.price;
      if ('price' in originalDeal) updates.price = finalPrice;

      // Old Price
      if ('old_price' in originalDeal) updates.old_price = editingDeal.old_price;

      // URL
      const finalUrl = editingDeal.url || editingDeal.link;
      if ('url' in originalDeal) updates.url = finalUrl;
      else if ('link' in originalDeal) updates.link = finalUrl;

      // Image
      if ('image_url' in originalDeal) updates.image_url = editingDeal.image_url;
      else if ('image' in originalDeal) updates.image = editingDeal.image_url;

      // Status
      if ('status' in originalDeal) updates.status = editingDeal.status;

      // Description & Extra Images (New columns)
      if ('description' in originalDeal) updates.description = editingDeal.description;
      if ('extra_images' in originalDeal) updates.extra_images = editingDeal.extra_images;

      // Name
      const finalName = editingDeal.name; // This contains the edited name from input
      if ('name' in originalDeal) updates.name = finalName;
      else if ('title' in originalDeal) updates.title = finalName;
      else if ('product_name' in originalDeal) updates.product_name = finalName;

      const { error } = await supabase
        .from('hardware_deals')
        .update(updates)
        .eq('id', editingDeal.id);

      if (error) throw error;

      setDeals(deals.map(d => d.id === editingDeal.id ? { ...d, ...updates } : d));
      setEditingDeal(null);
    } catch (err: unknown) {
      console.error('Error updating deal:', err);
      const msg = getErrorMessage(err);
      const rlsBlocked =
        msg.toLowerCase().includes('row-level security') ||
        msg.toLowerCase().includes('violates row-level security') ||
        msg.toLowerCase().includes('rls');
      alert(
        rlsBlocked
          ? `Mise à jour bloquée par la sécurité Supabase (RLS): ${msg}`
          : `Erreur lors de la mise à jour: ${msg}`
      );
    } finally {
      setSaving(false);
    }
  };

  const getCategoryTitle = (cat: string) => {
    switch (cat) {
      case 'setup': return 'Setup PC';
      case 'composants': return 'Composants';
      case 'peripheriques': return 'Périphériques';
      case 'consoles': return 'Consoles';
      case 'accessoires': return 'Accessoires';
      default: return 'Hardware';
    }
  };

  if (loading) return <div className="flex justify-center p-12"><FaSpinner className="animate-spin text-purple-500 text-3xl" /></div>;
  if (error) return <div className="text-red-400 p-4">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">{getCategoryTitle(category)}</h2>
          <p className="text-purple-300/60">Gestion des offres pour la catégorie {getCategoryTitle(category)}.</p>
        </div>
        {/* Ajout manuel optionnel si besoin */}
        {/* <button className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors font-medium shadow-lg shadow-purple-900/20">
          + Ajouter une offre
        </button> */}
      </div>

      <div className="bg-[#13141f] rounded-xl border border-purple-900/20 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-purple-900/20 border-b border-purple-900/20 text-purple-200 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold">Produit</th>
                <th className="p-4 font-semibold">Prix</th>
                <th className="p-4 font-semibold">Posté par</th>
                <th className="p-4 font-semibold">Statut</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-900/10">
              {deals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">Aucune offre disponible pour cette catégorie.</td>
                </tr>
              ) : (
                deals.map((deal) => (
                  <tr key={deal.id} className="hover:bg-purple-900/5 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-lg p-1 flex-shrink-0 flex items-center justify-center overflow-hidden relative">
                          {deal.image_url ? (
                            <Image
                              src={deal.image_url}
                              alt={deal.name}
                              width={48}
                              height={48}
                              className="w-full h-full object-contain"
                              sizes="48px"
                            />
                          ) : (
                            <div className="text-xs text-gray-500 font-bold">IMG</div>
                          )}
                        </div>
                        <div>
                          <a href={rewriteAffiliateUrl(deal.url || '#')} target="_blank" rel="noopener noreferrer" className="font-medium text-white group-hover:text-purple-300 transition-colors hover:underline flex items-center gap-1">
                            {deal.name || deal.title || deal.product_name || 'Sans nom'} <FaExternalLinkAlt className="text-xs opacity-50" />
                          </a>
                          <div className="text-sm text-purple-400/50 flex items-center gap-2">
                            <span>{new Date(deal.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-white">{deal.price}€</div>
                      {deal.old_price && <div className="text-sm text-purple-400/40 line-through">{deal.old_price}€</div>}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold border border-purple-400/30 overflow-hidden">
                          <FaUser size={10} />
                        </div>
                        <span className="text-purple-200 text-sm font-medium">{deal.posted_by || 'Discord User'}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${deal.status === 'validated' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                        deal.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                          'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                        }`}>
                        {deal.status === 'validated' ? 'Publié' :
                          deal.status === 'rejected' ? 'Rejeté' : 'En attente'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2 opacity-100">
                        {/* Edit Button */}
                        <button
                          onClick={() => setEditingDeal({
                            ...deal,
                            name: deal.name || deal.title || deal.product_name || ''
                          })}
                          className="px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500 text-purple-400 hover:text-white rounded-lg transition-all duration-200 flex items-center gap-2 text-sm font-medium border border-purple-500/20 group/btn"
                          title="Éditer"
                        >
                          <FaEdit size={14} />
                          <span className="hidden xl:inline">Éditer</span>
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDelete(deal.id)}
                          className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition-all duration-200 flex items-center gap-2 text-sm font-medium border border-red-500/20 group/btn"
                          title="Supprimer"
                        >
                          <FaTrash size={14} />
                          <span className="hidden xl:inline">Supprimer</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingDeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#13141f] rounded-xl border border-purple-900/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-200">
            <form onSubmit={handleSave} className="p-6 space-y-6">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold text-white">Éditer l&apos;offre</h3>
                <button
                  type="button"
                  onClick={() => setEditingDeal(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Nom du produit</label>
                    <input
                      type="text"
                      value={editingDeal.name || ''}
                      onChange={e => setEditingDeal({ ...editingDeal, name: e.target.value })}
                      className="w-full bg-[#0B0C15] border border-purple-900/20 rounded-lg px-4 py-2.5 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Prix actuel (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingDeal.new_price || editingDeal.price || ''}
                      onChange={e => setEditingDeal({ ...editingDeal, new_price: parseFloat(e.target.value) })}
                      className="w-full bg-[#0B0C15] border border-purple-900/20 rounded-lg px-4 py-2.5 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Ancien prix (€) (Optionnel)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingDeal.old_price || ''}
                      onChange={e => setEditingDeal({ ...editingDeal, old_price: e.target.value ? parseFloat(e.target.value) : null })}
                      className="w-full bg-[#0B0C15] border border-purple-900/20 rounded-lg px-4 py-2.5 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                    />
                  </div>

                  {/* Merchant field removed as it is not in schema */}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Lien du produit</label>
                    <input
                      type="url"
                      value={editingDeal.url || ''}
                      onChange={e => setEditingDeal({ ...editingDeal, url: e.target.value })}
                      className="w-full bg-[#0B0C15] border border-purple-900/20 rounded-lg px-4 py-2.5 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">URL de l&apos;image</label>
                    <input
                      type="url"
                      value={editingDeal.image_url || ''}
                      onChange={e => setEditingDeal({ ...editingDeal, image_url: e.target.value })}
                      className="w-full bg-[#0B0C15] border border-purple-900/20 rounded-lg px-4 py-2.5 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                    />
                    {editingDeal.image_url && (
                      <div className="mt-2 h-20 w-20 bg-white rounded-lg p-1 overflow-hidden relative">
                        <Image
                          src={editingDeal.image_url}
                          alt="Preview"
                          width={80}
                          height={80}
                          sizes="80px"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Statut</label>
                    <select
                      value={editingDeal.status}
                      onChange={e => setEditingDeal({ ...editingDeal, status: e.target.value as HardwareDeal['status'] })}
                      className="w-full bg-[#0B0C15] border border-purple-900/20 rounded-lg px-4 py-2.5 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                    >
                      <option value="pending">En attente</option>
                      <option value="validated">Validé</option>
                      <option value="rejected">Rejeté</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-purple-900/20">
                <h4 className="text-lg font-semibold text-white">Détails de la page produit</h4>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                  <textarea
                    rows={4}
                    value={editingDeal.description || ''}
                    onChange={e => setEditingDeal({ ...editingDeal, description: e.target.value })}
                    className="w-full bg-[#0B0C15] border border-purple-900/20 rounded-lg px-4 py-2.5 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                    placeholder="Description détaillée du produit..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Images supplémentaires (URLs séparées par des virgules)</label>
                  <textarea
                    rows={3}
                    value={editingDeal.extra_images?.join(', ') || ''}
                    onChange={e => {
                      const val = e.target.value;
                      const images = val.split(',').map(s => s.trim()).filter(Boolean);
                      setEditingDeal({ ...editingDeal, extra_images: images });
                    }}
                    className="w-full bg-[#0B0C15] border border-purple-900/20 rounded-lg px-4 py-2.5 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                    placeholder="https://..., https://..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-purple-900/20">
                <button
                  type="button"
                  onClick={() => setEditingDeal(null)}
                  className="px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 rounded-lg transition-colors font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors font-medium shadow-lg shadow-purple-900/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
