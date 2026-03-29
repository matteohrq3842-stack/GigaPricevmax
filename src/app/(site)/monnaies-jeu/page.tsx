'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/components/providers/SessionProvider';
import ImmersiveCategory from '@/components/content/ImmersiveCategory';
import { FaGamepad, FaCoins } from 'react-icons/fa';

type DigitalDealRecord = {
  id: string;
  title?: string | null;
  price?: string | number | null;
  old_price?: string | number | null;
  url?: string | null;
  image_url?: string | null;
};

type CurrencyItem = {
  id: string;
  name: string;
  price: string;
  oldPrice: string;
  discount: string;
  url: string;
  imageUrl: string;
};

export default function MonnaiesJeuPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0f]" />}>
      <MonnaiesJeuContent />
    </Suspense>
  );
}

function MonnaiesJeuContent() {
  const { supabase } = useAuth();
  const [currencies, setCurrencies] = useState<CurrencyItem[]>([]);
  const [loading, setLoading] = useState(true);

  const filters = [
    { label: "Tout", value: "Tout", icon: <FaCoins /> },
    { label: "Fortnite", value: "Fortnite", icon: <FaGamepad /> },
    { label: "GTA Online", value: "GTA", icon: <FaGamepad /> },
    { label: "Roblox", value: "Roblox", icon: <FaGamepad /> },
    { label: "Valorant", value: "Valorant", icon: <FaGamepad /> },
    { label: "League of Legends", value: "League of Legends", icon: <FaGamepad /> },
    { label: "Clash Royale", value: "Clash Royale", icon: <FaGamepad /> },
    { label: "FIFA / FC", value: "FIFA", icon: <FaGamepad /> },
  ];

  useEffect(() => {
    async function fetchDeals() {
      try {
        const { data, error } = await supabase
          .from('digital_deals')
          .select('*')
          .eq('category', 'monnaies')
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
            name: deal.title || 'Monnaie inconnue',
            price: `${price.toFixed(2)}€`,
            oldPrice: oldPrice > 0 ? `${oldPrice.toFixed(2)}€` : '',
            discount: discount > 0 ? `-${discount}%` : '',
            url: deal.url || '#',
            imageUrl: deal.image_url || ''
          };
        });

        setCurrencies(mappedDeals);
      } catch (err) {
        console.error('Error fetching currencies:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDeals();
  }, [supabase]);

  const filterFn = (item: CurrencyItem, filterValue: string) => {
    if (filterValue === "Tout") return true;
    return item.name.toLowerCase().includes(filterValue.toLowerCase());
  };

  return (
    <ImmersiveCategory
      title="Monnaies & Crédits"
      subtitle="Boostez votre expérience de jeu. V-Bucks, Robux, Shark Cards et bien plus au meilleur prix."
      items={currencies}
      filters={filters}
      filterFn={filterFn}
      themeColor="gold"
      bgPattern="grid"
      loading={loading}
    />
  );
}
