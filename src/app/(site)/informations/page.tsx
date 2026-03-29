import { fetchGamingInfo } from '@/data/games.server';
import Image from 'next/image';
import { type ActuGaming } from '@/data/games';
import { FaCalendarAlt, FaNewspaper, FaExternalLinkAlt } from 'react-icons/fa';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // 1 hour

export default async function InformationsPage() {
  const newsItems = await fetchGamingInfo(50); // Fetch last 50 items

  return (
    <main className="min-h-screen bg-[#0B0C15] text-white pt-24 pb-20">
      <div className="max-w-[1600px] mx-auto px-6">
        <header className="mb-12">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-px w-8 bg-[#8B5CF6]"></span>
            <span className="text-[#8B5CF6] uppercase tracking-widest text-xs font-bold">Actu & Sorties</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Informations & <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] to-[#2372E2]">Jeux à venir</span>
          </h1>
          <p className="text-gray-400 max-w-2xl text-lg">
            Toutes les actualités gaming, les annonces de précommandes et les mises à jour importantes en un seul endroit.
          </p>
        </header>

        {newsItems.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {newsItems.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center rounded-2xl border border-white/5 bg-white/5">
            <p className="text-xl text-gray-400">Aucune information disponible pour le moment.</p>
          </div>
        )}
      </div>
    </main>
  );
}

function NewsCard({ item }: { item: ActuGaming }) {
  const dateStr = new Date(item.created_at).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <article className="group flex flex-col h-full bg-[#151621] border border-white/5 rounded-2xl overflow-hidden hover:border-[#8B5CF6]/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#8B5CF6]/10">
      {/* Image */}
      <div className="relative aspect-video w-full overflow-hidden bg-black/50">
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-600">
            <FaNewspaper size={32} />
          </div>
        )}
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
          <span className="text-xs font-medium text-white capitalize">{item.category || 'Info'}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
          <FaCalendarAlt className="text-[#8B5CF6]" />
          <span>{dateStr}</span>
        </div>

        <h3 className="text-lg font-bold text-white mb-3 line-clamp-2 group-hover:text-[#8B5CF6] transition-colors">
          {item.title}
        </h3>

        <p className="text-sm text-gray-400 line-clamp-3 mb-5 flex-1 leading-relaxed">
          {item.description}
        </p>

        {item.url && (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-white/5 text-sm font-medium text-white hover:bg-[#8B5CF6] hover:text-white transition-all duration-200 group/btn"
          >
            <span>Lire la suite</span>
            <FaExternalLinkAlt size={12} className="opacity-70 group-hover/btn:opacity-100" />
          </a>
        )}
      </div>
    </article>
  );
}
