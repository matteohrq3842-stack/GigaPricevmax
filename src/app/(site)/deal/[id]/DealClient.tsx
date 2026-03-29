'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/SessionProvider';
import { motion } from 'framer-motion';
import { FaShoppingCart, FaGlobe, FaGamepad, FaDesktop, FaCheckCircle, FaArrowLeft, FaShieldAlt, FaBolt, FaInfoCircle } from 'react-icons/fa';
import Link from 'next/link';
import { rewriteAffiliateUrl } from '@/utils/tracker';

type Deal = {
  id: string;
  title: string;
  price: string;
  old_price: string;
  url: string;
  image_url: string;
  category: string;
};

export default function DealClient({ id }: { id: string }) {
  const router = useRouter();
  const { supabase } = useAuth();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDeal() {
      if (!id) return;
      
      try {
        const { data, error } = await supabase
          .from('digital_deals')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setDeal(data);
      } catch (err) {
        console.error('Error fetching deal:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDeal();
  }, [id, supabase, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center text-white">
        <h1 className="text-2xl font-bold mb-4">Offre introuvable</h1>
        <Link href="/" className="text-purple-400 hover:text-purple-300">Retour à l&apos;accueil</Link>
      </div>
    );
  }

  // Logic to infer details from title
  const getPlatform = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('xbox')) return { name: 'Xbox', icon: <FaGamepad /> };
    if (t.includes('playstation') || t.includes('psn') || t.includes('ps4') || t.includes('ps5')) return { name: 'PlayStation', icon: <FaGamepad /> };
    if (t.includes('nintendo') || t.includes('switch')) return { name: 'Nintendo', icon: <FaGamepad /> };
    if (t.includes('steam') || t.includes('pc')) return { name: 'PC (Steam)', icon: <FaDesktop /> };
    return { name: 'Tout Support', icon: <FaDesktop /> };
  };

  const getRegion = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('global') || t.includes('monde')) return 'Global (Monde)';
    if (t.includes('eu') || t.includes('europe')) return 'Europe';
    if (t.includes('us') || t.includes('usa')) return 'États-Unis';
    if (t.includes('fr') || t.includes('france')) return 'France';
    return 'Global';
  };

  const platform = getPlatform(deal.title);
  const region = getRegion(deal.title);
  const price = parseFloat(deal.price || '0');
  const oldPrice = parseFloat(deal.old_price || '0');
  const discount = oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;
  const partnerUrl = rewriteAffiliateUrl(deal.url);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100 font-sans selection:bg-purple-500/30">
      
      {/* Background Blur Effect */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-purple-900/10 blur-[120px]" />
        <div className="absolute top-[40%] -right-[10%] w-[60%] h-[60%] rounded-full bg-blue-900/10 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        
        {/* Breadcrumb / Back */}
        <div className="mb-8">
            <button onClick={() => router.back()} className="flex items-center text-gray-400 hover:text-white transition-colors group">
                <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
                Retour aux offres
            </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Image */}
          <div className="lg:col-span-5">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-[#13131a] border border-white/10 shadow-2xl shadow-purple-900/20"
            >
                {deal.image_url ? (
                    <Image
                        src={deal.image_url}
                        alt={deal.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 40vw"
                        className="object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/10 text-6xl font-bold">GP</div>
                )}
                
                {discount > 0 && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white font-bold px-3 py-1 rounded-full shadow-lg">
                        -{discount}%
                    </div>
                )}
            </motion.div>

            {/* Trust Badges */}
            <div className="mt-8 grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center text-center p-4 rounded-xl bg-white/5 border border-white/5">
                    <FaBolt className="text-yellow-400 text-2xl mb-2" />
                    <span className="text-xs text-gray-300 font-medium">Livraison Immédiate</span>
                </div>
                <div className="flex flex-col items-center text-center p-4 rounded-xl bg-white/5 border border-white/5">
                    <FaShieldAlt className="text-green-400 text-2xl mb-2" />
                    <span className="text-xs text-gray-300 font-medium">Paiement Sécurisé</span>
                </div>
                <div className="flex flex-col items-center text-center p-4 rounded-xl bg-white/5 border border-white/5">
                    <FaCheckCircle className="text-blue-400 text-2xl mb-2" />
                    <span className="text-xs text-gray-300 font-medium">Vendeur Vérifié</span>
                </div>
            </div>
          </div>

          {/* Right Column: Details */}
          <div className="lg:col-span-7 flex flex-col">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
            >
                <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider border border-purple-500/20">
                        {deal.category}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${region.includes('Global') ? 'bg-green-500/20 text-green-300 border-green-500/20' : 'bg-blue-500/20 text-blue-300 border-blue-500/20'}`}>
                        {region}
                    </span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-6">
                    {deal.title}
                </h1>

                {/* Key Info Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="p-4 rounded-xl bg-[#1a1a20] border border-white/5">
                        <span className="block text-gray-500 text-xs uppercase font-bold mb-1">Plateforme</span>
                        <div className="flex items-center text-white font-medium gap-2">
                            {platform.icon}
                            {platform.name}
                        </div>
                    </div>
                    <div className="p-4 rounded-xl bg-[#1a1a20] border border-white/5">
                        <span className="block text-gray-500 text-xs uppercase font-bold mb-1">Région</span>
                        <div className="flex items-center text-white font-medium gap-2">
                            <FaGlobe />
                            {region}
                        </div>
                    </div>
                </div>

                {/* Price Action */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1a1a20] to-[#13131a] border border-white/10 mb-8">
                    <div className="flex items-end gap-4 mb-6">
                        <span className="text-5xl font-extrabold text-white">{price.toFixed(2)}€</span>
                        {oldPrice > 0 && (
                            <div className="flex flex-col mb-2">
                                <span className="text-gray-500 line-through text-lg">{oldPrice.toFixed(2)}€</span>
                                <span className="text-green-400 text-sm font-bold">Économisez {(oldPrice - price).toFixed(2)}€</span>
                            </div>
                        )}
                    </div>

                    <a 
                        href={partnerUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-full bg-white text-black hover:bg-gray-200 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg shadow-white/5"
                    >
                        <FaShoppingCart className="mr-2" />
                        Voir l&apos;offre sur le site partenaire
                    </a>
                    <p className="mt-3 text-center text-xs text-gray-500">
                        Redirection sécurisée vers notre partenaire officiel.
                    </p>
                </div>

                {/* Description / Instructions */}
                <div className="space-y-6">
                    <div className="border-t border-white/10 pt-6">
                        <h3 className="flex items-center text-lg font-bold text-white mb-3">
                            <FaInfoCircle className="mr-2 text-purple-400" />
                            À propos de ce produit
                        </h3>
                        <p className="text-gray-400 leading-relaxed">
                            Profitez de cette offre exceptionnelle pour <strong>{deal.title}</strong>. 
                            Ce produit est sous forme de code numérique (clé CD ou lien d&apos;activation) 
                            à activer sur la plateforme <strong>{platform.name}</strong>. 
                            Une fois acheté, vous recevrez votre produit instantanément par email.
                        </p>
                    </div>
                    
                    <div className="border-t border-white/10 pt-6">
                         <h3 className="text-lg font-bold text-white mb-3">Comment activer ?</h3>
                         <ul className="list-disc list-inside text-gray-400 space-y-2">
                            <li>Achetez le produit sur le site partenaire.</li>
                            <li>Recevez votre code unique par email.</li>
                            <li>Connectez-vous à votre compte {platform.name}.</li>
                            <li>Entrez le code dans la section &quot;Activer un produit&quot; ou &quot;Utiliser un code&quot;.</li>
                            <li>Téléchargez et profitez de votre contenu !</li>
                         </ul>
                    </div>
                </div>

            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
