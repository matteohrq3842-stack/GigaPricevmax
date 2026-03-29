import { fetchNewReleases } from '@/data/games.server';
import GameCardGrid from '@/components/content/GameCardGrid';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nouveauté de la semaine | GigaPrice',
  description: 'Découvrez les derniers jeux ajoutés au catalogue GigaPrice. Les sorties récentes et les meilleures offres du moment.',
};

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // 1 hour

export default async function NewReleasesPage() {
  const newGames = await fetchNewReleases(30);

  return (
    <main className="min-h-screen bg-[#0B0C15] text-white pt-24 pb-20">
      <div className="max-w-[1600px] mx-auto px-6">
        <header className="mb-12">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-px w-8 bg-[#8B5CF6]"></span>
            <span className="text-[#8B5CF6] uppercase tracking-widest text-xs font-bold">Catalogue</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Nouveautés de <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] to-[#2372E2]">la semaine</span>
          </h1>
          <p className="text-gray-400 max-w-2xl text-lg">
            Les jeux récemment ajoutés à notre comparateur. Ne manquez pas les dernières pépites et les sorties majeures.
          </p>
        </header>

        {newGames.length > 0 ? (
          <GameCardGrid games={newGames} />
        ) : (
          <div className="py-20 text-center">
            <p className="text-xl text-gray-500">Aucune nouveauté récente pour le moment.</p>
          </div>
        )}
      </div>
    </main>
  );
}
