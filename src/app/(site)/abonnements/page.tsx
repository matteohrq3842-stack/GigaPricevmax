'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/components/providers/SessionProvider';
import ImmersiveCategory from '@/components/content/ImmersiveCategory';
import { FaXbox, FaPlaystation, FaGamepad } from 'react-icons/fa';

type SubscriptionItem = {
  id: string;
  name: string;
  price: string;
  oldPrice: string;
  discount: string;
  url: string;
  imageUrl: string;
};

export default function AbonnementsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0f]" />}>
      <AbonnementsContent />
    </Suspense>
  );
}

function AbonnementsContent() {
  const { supabase } = useAuth();
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([]);
  const [loading, setLoading] = useState(true);

  const filters = [
    { label: "Tout", value: "Tout", icon: <FaGamepad /> },
    { label: "Xbox Game Pass", value: "Xbox", icon: <FaXbox /> },
    { label: "PlayStation Plus", value: "PlayStation", icon: <FaPlaystation /> },
    { label: "Nintendo Online", value: "Nintendo", icon: <FaGamepad /> },
    { label: "Netflix", value: "Netflix", icon: <FaGamepad /> },
    { label: "Spotify", value: "Spotify", icon: <FaGamepad /> },
    { label: "EA Play", value: "EA", icon: <FaGamepad /> },
  ];

  useEffect(() => {
    async function fetchDeals() {
      try {
        const { data, error } = await supabase
          .from('digital_deals')
          .select('*')
          .eq('category', 'abonnements')
          .order('id', { ascending: false });

        if (error) throw error;

        const mappedDeals = (data || []).map((deal) => {
          const price = parseFloat(deal.price || '0');
          const oldPrice = parseFloat(deal.old_price || '0');
          const discount = oldPrice > price 
            ? Math.round(((oldPrice - price) / oldPrice) * 100) 
            : 0;

          return {
            id: deal.id,
            name: deal.title || 'Abonnement inconnu',
            price: `${price.toFixed(2)}€`,
            oldPrice: oldPrice > 0 ? `${oldPrice.toFixed(2)}€` : '',
            discount: discount > 0 ? `-${discount}%` : '',
            url: deal.url || '#',
            imageUrl: deal.image_url || ''
          };
        });

        setSubscriptions(mappedDeals);
      } catch (err) {
        console.error('Error fetching subscriptions:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDeals();
  }, [supabase]);

  const filterFn = (item: SubscriptionItem, filterValue: string) => {
    if (filterValue === "Tout") return true;
    const term = filterValue.toLowerCase().split(' ')[0]; // Match "Xbox" from "Xbox Game Pass"
    return item.name.toLowerCase().includes(term);
  };

  return (
    <ImmersiveCategory
      title="Abonnements & Services"
      subtitle="Ne payez plus le prix fort pour vos abonnements. Game Pass, PS+, Streaming et plus encore."
      items={subscriptions}
      filters={filters}
      filterFn={filterFn}
      themeColor="blue"
      bgPattern="waves"
      loading={loading}
    />
  );
}
