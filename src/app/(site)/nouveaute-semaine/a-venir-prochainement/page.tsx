'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/components/providers/SessionProvider';

type ActuGaming = {
  id: string;
  title: string;
  category: string;
  description: string;
  image_url: string;
  url: string;
  created_at: string;
};

type GroupedItems = {
  dateLabel: string;
  items: ActuGaming[];
};

export default function AVenirProchainementPage() {
  const { supabase } = useAuth();
  const [feedItems, setFeedItems] = useState<GroupedItems[]>([]);
  const [nouveautesCount, setNouveautesCount] = useState(0);
  const [aVenirCount, setAVenirCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Helper to format date label
  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Future dates logic if needed, but keeping it simple for now
    const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (checkDate.getTime() === today.getTime()) {
      return "AUJOURD'HUI";
    } else if (checkDate.getTime() === yesterday.getTime()) {
      return "HIER";
    } else {
      return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase();
    }
  };

  useEffect(() => {
    let active = true;

    async function fetchData() {
      setLoading(true);
      try {
        // Fetch counts
        const { count: novCount } = await supabase
          .from('actu_gaming')
          .select('*', { count: 'exact', head: true })
          .eq('category', 'nouveaute');

        const { count: avCount } = await supabase
          .from('actu_gaming')
          .select('*', { count: 'exact', head: true })
          .eq('category', 'avenir');

        if (active) {
          setNouveautesCount(novCount || 0);
          setAVenirCount(avCount || 0);
        }

        // Fetch items
        const { data: feedData, error: feedError } = await supabase
          .from('actu_gaming')
          .select('*')
          .eq('category', 'avenir')
          .order('created_at', { ascending: false });

        if (feedError) throw feedError;

        if (active && feedData) {
          // Group by date
          const grouped: Record<string, ActuGaming[]> = {};
          
          feedData.forEach(item => {
            const dateObj = new Date(item.created_at);
            const sortKey = dateObj.toISOString().split('T')[0];
            
            if (!grouped[sortKey]) {
              grouped[sortKey] = [];
            }
            grouped[sortKey].push(item);
          });

          // Sort by date descending
          const sortedGroups = Object.entries(grouped)
            .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
            .map(([dateKey, items]) => ({
              dateLabel: getDateLabel(dateKey),
              items: items
            }));

          setFeedItems(sortedGroups);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchData();
    return () => {
      active = false;
    };
  }, [supabase]);

  return (
    <main className="min-h-screen bg-[#0B0C15] text-white pt-28 pb-24">
      <div className="max-w-[1600px] mx-auto px-6">
        <header className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">À venir prochainement</h1>
          <p className="text-gray-400">Les annonces à venir et événements.</p>
        </header>

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          
          {/* LEFT SIDE: Navigation Menu */}
          <aside className="w-full lg:w-1/4 lg:sticky lg:top-32 space-y-6">
            <div className="bg-[#14121e] border border-white/5 rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-semibold mb-6 px-2 border-l-4 border-[#8B5CF6] pl-3">Navigation</h3>
              <nav className="space-y-4">
                <Link
                  href="/nouveaute-semaine/nouveautes"
                  className="group block p-4 rounded-xl bg-white/5 hover:bg-[#8B5CF6]/20 border border-transparent hover:border-[#8B5CF6]/50 transition-all duration-300 no-underline"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold uppercase tracking-wider text-[#8B5CF6] group-hover:no-underline">Nouveautés</span>
                    <span className="bg-[#8B5CF6] text-white text-xs px-2 py-0.5 rounded-full">{nouveautesCount}</span>
                  </div>
                  <div className="text-gray-300 text-sm group-hover:text-white transition-colors group-hover:no-underline">
                    Voir toutes les dernières sorties
                  </div>
                </Link>

                <Link
                  href="/nouveaute-semaine/a-venir-prochainement"
                  className="group block p-4 rounded-xl bg-white/5 border border-[#3B82F6]/50 shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-all duration-300 no-underline"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold uppercase tracking-wider text-[#3B82F6] group-hover:no-underline">À venir</span>
                    <span className="bg-[#3B82F6] text-white text-xs px-2 py-0.5 rounded-full">{aVenirCount}</span>
                  </div>
                  <div className="text-gray-300 text-sm group-hover:text-white transition-colors group-hover:no-underline">
                    Consulter les prochaines annonces
                  </div>
                </Link>
              </nav>
            </div>
          </aside>

          {/* RIGHT SIDE: Feed */}
          <section className="w-full lg:w-3/4 space-y-12">
            {loading ? (
              <div className="text-center py-20 text-gray-500">Chargement du flux...</div>
            ) : (
              feedItems.map((group) => (
                <div key={group.dateLabel} className="space-y-6">
                  {/* Date Separator */}
                  <div className="flex items-center gap-4">
                    <div className="h-[2px] w-8 bg-[#8B5CF6]"></div>
                    <span className="text-[#8B5CF6] font-bold uppercase tracking-widest text-sm whitespace-nowrap">
                      {group.dateLabel}
                    </span>
                    <div className="h-[1px] flex-grow bg-gradient-to-r from-[#8B5CF6] to-transparent opacity-50"></div>
                  </div>

                  {/* Grid of Items */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {group.items.map((item) => (
                      <Link
                        key={item.id}
                        href={`/nouveaute-semaine/article/${item.id}`}
                        className="group flex flex-col gap-3 bg-[#14121e] rounded-xl overflow-hidden hover:transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#8B5CF6]/10 transition-all duration-300 border border-white/5 no-underline"
                      >
                        {/* Image Container */}
                        <div className="relative aspect-[16/9] w-full overflow-hidden">
                          {item.image_url ? (
                            <Image
                              src={item.image_url}
                              alt={item.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-500 text-xs">
                              No Image
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                            <span className="text-xs font-bold text-white bg-[#8B5CF6] px-2 py-1 rounded">
                              Voir les détails
                            </span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-5 flex flex-col flex-grow">
                          <h3 className="font-bold text-lg leading-tight text-gray-100 group-hover:text-[#8B5CF6] transition-colors line-clamp-2 mb-3">
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-400 line-clamp-3 leading-relaxed mb-4 flex-grow">
                            {item.description}
                          </p>
                          <div className="pt-3 border-t border-white/5 flex items-center justify-between mt-auto">
                             <span className="text-[10px] uppercase tracking-wider text-gray-500">
                               À VENIR
                             </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))
            )}
            
            {!loading && feedItems.length === 0 && (
              <div className="text-center py-20 text-gray-500">
                Aucune annonce à venir.
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
