
import Link from "next/link";
import HeroBanner from "@/components/content/HeroBanner";
import SuggestionsCarousel from "@/components/content/SuggestionsCarousel";
import RecommendationsCarousel from "@/components/content/RecommendationsCarousel";
import GameCardGrid from "@/components/content/GameCardGrid";
import { fetchBotDealsPage, fetchWeeklyTopGames } from "@/data/games.server";

export const dynamic = 'force-static';

export default async function Home() {
  const { games: fetched } = await fetchBotDealsPage({
    page: 1,
    pageSize: 25,
    preferOrderColumns: ['metacritic_score', 'last_update', 'updated_at', 'created_at'],
    preferOrderAscending: false,
  });
  // Suggestions : Rotation hebdomadaire des meilleurs jeux PC
  const suggestions = await fetchWeeklyTopGames(6);

  const hero =
    fetched.find((g) => g.slug && g.slug !== 'baldurs-gate-3' && g.heroImage) ??
    fetched.find((g) => g.slug && g.slug !== 'baldurs-gate-3') ??
    fetched[0] ??
    null;

  const recommendations = fetched.slice(6, 13);
  const trending = fetched.slice(13, 25);

  return (
    <>
      {/* Hero Banner - Mis en avant (Style ActuGame) */}
      {hero ? (
        <HeroBanner
          title={hero.title}
          price={hero.price}
          oldPrice={hero.oldPrice}
          discount={hero.discount}
          image={hero.heroImage}
          platforms={[
            hero.platform === 'Steam' || hero.platform === 'GOG' || hero.platform === 'EA App' ? 'PC' : 'Console',
            hero.platform,
          ]}
        />
      ) : null}

      <header className="hero-header" style={{ paddingTop: '40px' }}>
        <section className="suggestions-header">
          <h2>Suggestions de la semaine</h2>
        </section>

        <SuggestionsCarousel games={suggestions} />

        <section className="suggestions-header" style={{ marginTop: '80px' }}>
          <h2>Recommandations</h2>
        </section>

        <RecommendationsCarousel games={recommendations} />

        <section className="trending-title-bar" style={{ marginTop: '80px' }}>
          <Link href="/tendances" className="trending-title-link">
            Tendances <span className="trending-title-chevron">›</span>
          </Link>
        </section>

        <GameCardGrid games={trending} gridClassName="cards-container trending-grid" />
      </header>
    </>
  );
}
