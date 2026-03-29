'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/providers/SessionProvider';
import { FaArrowLeft, FaShoppingCart, FaStar, FaShieldAlt, FaTruck, FaBoxOpen } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface ProductDetail {
  id: string;
  name: string;
  title?: string;
  product_name?: string;
  price: number;
  new_price?: number;
  old_price: number | null;
  url: string;
  link?: string;
  amazon_url?: string;
  image_url: string | null;
  description?: string;
  extra_images?: string[]; // Array of URLs
  category: string;
  created_at: string;
}

export default function ProductClient({ id }: { id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { supabase } = useAuth();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const productId = searchParams.get('id') ?? id;

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      if (!productId) {
        setProduct(null);
        setLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('hardware_deals')
          .select('*')
          .eq('id', productId)
          .single();

        if (error) throw error;
        setProduct(data);
        // Set initial selected image
        if (data) {
          setSelectedImage(data.image_url);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [productId, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0C15] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0B0C15] flex flex-col items-center justify-center text-white p-4">
        <h1 className="text-2xl font-bold mb-4">Produit introuvable</h1>
        <button 
          onClick={() => router.back()}
          className="px-6 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
        >
          Retour
        </button>
      </div>
    );
  }

  // Normalize data
  const name = product.name || product.title || product.product_name || 'Produit sans nom';
  const price = product.price || product.new_price || 0;
  const oldPrice = product.old_price;
  const affiliateUrl = product.url || product.link || product.amazon_url || '#';
  
  // Combine main image and extra images
  const allImages = [product.image_url, ...(product.extra_images || [])].filter(Boolean) as string[];

  const discountPercentage = oldPrice && oldPrice > price 
    ? Math.round(((oldPrice - price) / oldPrice) * 100) 
    : null;

  const getCategoryLink = (cat: string) => {
    switch (cat?.toLowerCase()) {
      case 'setup': return '/hardware/setup-pc?return=true';
      case 'composants': return '/hardware/composants?return=true';
      case 'peripheriques': return '/hardware/peripheriques?return=true';
      case 'consoles': return '/hardware/consoles?return=true';
      case 'accessoires': return '/hardware/accessoires?return=true';
      default: return '/?return=true';
    }
  };

  return (
    <div className="amazon-hardware-page min-h-screen font-sans">
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb & Back */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center gap-4">
           <button 
             onClick={() => router.push(getCategoryLink(product.category))} 
             className="bg-white text-black px-4 py-2 rounded-md font-bold text-sm flex items-center gap-2 hover:bg-gray-200 transition-colors w-fit"
           >
             <FaArrowLeft /> Retour
           </button>
           
           <div className="text-xs text-white/50 flex items-center gap-2 overflow-hidden">
             <span>Hardware</span>
             <span>›</span>
             <span className="text-purple-400 uppercase">{product.category}</span>
             <span>›</span>
             <span className="text-white truncate">{name}</span>
           </div>
        </div>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column: Images (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="aspect-square relative bg-white rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex items-center justify-center group"
            >
              <AnimatePresence mode="wait">
                {selectedImage ? (
                  <motion.div
                    key={selectedImage}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="relative w-full h-full"
                  >
                    <Image
                      src={selectedImage}
                      alt={name}
                      fill
                      sizes="(max-width: 1024px) 90vw, 420px"
                      className="object-contain drop-shadow-xl transition-transform duration-300 group-hover:scale-105"
                    />
                  </motion.div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                    Image indisponible
                  </div>
                )}
              </AnimatePresence>
              
              {discountPercentage && (
                <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded font-bold text-sm shadow-md">
                  -{discountPercentage}%
                </div>
              )}
            </motion.div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide justify-center lg:justify-start">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-20 h-20 flex-shrink-0 bg-white rounded-lg overflow-hidden border-2 transition-all duration-200 p-1 ${
                      selectedImage === img 
                        ? 'border-purple-600 ring-2 ring-purple-600/30' 
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={img}
                      alt=""
                      width={80}
                      height={80}
                      sizes="80px"
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Details (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6 bg-[#161223]/70 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl"
            >
              {/* Category & Rating */}
              <div className="flex items-center justify-between">
                <span className="text-purple-300 font-semibold px-4 py-1.5 bg-purple-500/20 rounded-full border border-purple-500/30 text-xs tracking-wider uppercase">
                  {product.category}
                </span>
                <div className="flex items-center gap-2 bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20">
                  <div className="flex text-yellow-400 text-sm">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar key={star} />
                    ))}
                  </div>
                  <span className="font-bold text-white text-sm">4.8</span>
                  <span className="text-gray-400 text-xs">(124 avis)</span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-3xl lg:text-4xl font-bold text-white leading-tight tracking-tight">
                {name}
              </h1>

              {/* Price & CTA Block */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center p-6 bg-white/5 rounded-2xl border border-white/5">
                <div className="space-y-2">
                  <div className="flex items-baseline gap-3">
                    <span className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                      {price}€
                    </span>
                    {oldPrice && (
                      <span className="text-xl text-gray-500 line-through decoration-red-500/50">
                        {oldPrice}€
                      </span>
                    )}
                  </div>

                </div>

                <div className="space-y-3">
                  <a 
                    href={affiliateUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block w-full bg-gradient-to-r from-[#FF9900] to-[#FF8C00] hover:from-[#ffad33] hover:to-[#ff9900] text-black font-extrabold text-lg py-4 px-6 rounded-xl text-center transition-all duration-300 shadow-lg shadow-orange-500/20 transform hover:-translate-y-1 hover:shadow-orange-500/40 flex items-center justify-center gap-3"
                  >
                    <FaShoppingCart className="text-xl" />
                    Acheter sur Amazon
                  </a>
                  <div className="text-[10px] text-center text-gray-500 leading-tight">
                    Transaction sécurisée par Amazon.
                  </div>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: FaShieldAlt, text: "Garantie Constructeur", color: "blue" },
                  { icon: FaTruck, text: "Livraison Rapide", color: "emerald" },
                  { icon: FaBoxOpen, text: "Retour Gratuit", color: "purple" }
                ].map((badge, i) => (
                  <div key={i} className={`flex flex-col items-center justify-center p-4 rounded-2xl bg-${badge.color}-500/5 border border-${badge.color}-500/10 hover:bg-${badge.color}-500/10 transition-colors`}>
                    <badge.icon className={`text-2xl text-${badge.color}-400 mb-2`} />
                    <span className="text-xs font-medium text-gray-300 text-center">{badge.text}</span>
                  </div>
                ))}
              </div>

              {/* Description */}
              <div className="pt-6 border-t border-white/10">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
                  À propos de cet article
                </h3>
                <div className="prose prose-invert prose-sm max-w-none text-gray-300/90 leading-relaxed">
                  {product.description ? (
                    product.description.split('\n').map((line, i) => (
                      <p key={i} className="mb-3 last:mb-0">{line}</p>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">Aucune description disponible pour ce produit.</p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
