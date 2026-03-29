'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/components/providers/SessionProvider';
import ImmersiveCategory from '@/components/content/ImmersiveCategory';
import { FaAmazon, FaSteam, FaPlaystation, FaXbox, FaApple, FaGooglePlay, FaGamepad } from 'react-icons/fa';

type DigitalDealRecord = {
  id: string;
  title?: string | null;
  price?: string | number | null;
  old_price?: string | number | null;
  url?: string | null;
  image_url?: string | null;
};

type GiftCardItem = {
  id: string;
  name: string;
  price: string;
  oldPrice: string;
  discount: string;
  url: string;
  imageUrl: string;
};

export default function CartesCadeauxPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0f]" />}>
      <CartesCadeauxContent />
    </Suspense>
  );
}

function CartesCadeauxContent() {
  const { supabase } = useAuth();
  const [giftCards, setGiftCards] = useState<GiftCardItem[]>([]);
  const [loading, setLoading] = useState(true);

  const filters = [
    { label: "Tout", value: "Tout", icon: <FaGamepad /> },
    { label: "Amazon", value: "Amazon", icon: <FaAmazon /> },
    { label: "Steam", value: "Steam", icon: <FaSteam /> },
    { label: "PlayStation", value: "PlayStation", icon: <FaPlaystation /> },
    { label: "Xbox", value: "Xbox", icon: <FaXbox /> },
    { label: "Apple", value: "Apple", icon: <FaApple /> },
    { label: "Google Play", value: "Google Play", icon: <FaGooglePlay /> },
  ];

  useEffect(() => {
    async function fetchDeals() {
      try {
        const { data, error } = await supabase
          .from('digital_deals')
          .select('*')
          .eq('category', 'cartes')
          .order('id', { ascending: false });

        if (error) throw error;

        const mappedDeals = (data || []).map((deal: DigitalDealRecord) => {
          const price = parseFloat(String(deal.price ?? '0'));
          const oldPrice = parseFloat(String(deal.old_price ?? '0'));
          const discount = oldPrice > price 
            ? Math.round(((oldPrice - price) / oldPrice) * 100) 
            : 0;

          return {
            id: deal.id,
            name: deal.title || 'Carte Cadeau inconnue',
            price: `${price.toFixed(2)}€`,
            oldPrice: oldPrice > 0 ? `${oldPrice.toFixed(2)}€` : '',
            discount: discount > 0 ? `-${discount}%` : '',
            url: deal.url || '#',
            imageUrl: deal.image_url || ''
          };
        });

        setGiftCards(mappedDeals);
      } catch (err) {
        console.error('Error fetching gift cards:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDeals();
  }, [supabase]);

  const filterFn = (item: GiftCardItem, filterValue: string) => {
    if (filterValue === "Tout") return true;
    return item.name.toLowerCase().includes(filterValue.toLowerCase());
  };

  return (
    <ImmersiveCategory
      title="Cartes Cadeaux"
      subtitle="Offrez ou offrez-vous le choix. Cartes Amazon, Steam, PSN, Xbox et bien plus."
      items={giftCards}
      filters={filters}
      filterFn={filterFn}
      themeColor="pink"
      bgPattern="dots"
      loading={loading}
    />
  );
}
