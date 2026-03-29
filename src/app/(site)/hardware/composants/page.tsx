'use client';

import { useEffect, useState, Suspense } from 'react';
import AmazonAffiliateCatalog, { type AffiliateProduct } from '@/components/hardware/AmazonAffiliateCatalog';
import AmazonLoader from '@/components/hardware/AmazonLoader';
import { useAuth } from '@/components/providers/SessionProvider';

export default function ComposantsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0f]" />}>
      <ComposantsContent />
    </Suspense>
  );
}

function ComposantsContent() {
  const { supabase } = useAuth();
  const [products, setProducts] = useState<AffiliateProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDeals() {
      try {
        const { data, error } = await supabase
          .from('hardware_deals')
          .select('*')
          .eq('category', 'composants')
          .order('created_at', { ascending: false });

        if (error) throw error;

        const mappedProducts: AffiliateProduct[] = (data || []).map((deal) => {
          const name = deal.name || deal.title || deal.product_name || 'Produit sans nom';
          const url = deal.url || deal.link || deal.amazon_url || '#';
          const price = Number(deal.price || deal.new_price || 0);

          return {
            id: deal.id,
            title: name,
            brand: extractBrandFromTitle(name),
            imageUrl: deal.image_url || 'https://via.placeholder.com/300?text=Pas+d+image',
            amazonUrl: url,
            price: price,
            oldPrice: deal.old_price ? Number(deal.old_price) : undefined,
            rating: 4.5, // Mock pour l'instant
            ratingCount: 0,
            isPrime: false,
            isDeal: !!deal.old_price,
            note: 'Offre synchronisée depuis Discord',
          };
        });

        setProducts(mappedProducts);
      } catch (err) {
        console.error('Error fetching deals:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDeals();
  }, [supabase]);

  function extractBrandFromTitle(title: string): string {
    if (!title) return 'Autre';
    const commonBrands = ['Intel', 'AMD', 'Nvidia', 'ASUS', 'MSI', 'Gigabyte', 'Corsair', 'Kingston', 'Crucial', 'Samsung', 'Western Digital', 'Seagate', 'Be Quiet', 'Noctua', 'Cooler Master', 'NZXT'];
    const found = commonBrands.find(brand => title.toLowerCase().includes(brand.toLowerCase()));
    return found || 'Autre';
  }

  return (
    <AmazonLoader isLoading={loading}>
      <AmazonAffiliateCatalog
        title="Composants PC"
        subtitle="Cartes graphiques, processeurs, RAM… Construisez votre monstre."
        breadcrumb="Accueil › Hardware › Composants"
        products={products}
        searchPlaceholder="Rechercher un composant..."
        heroChips={['Affiliation Amazon', 'Grille produits', 'Filtres & tri']}
      />
    </AmazonLoader>
  );
}
