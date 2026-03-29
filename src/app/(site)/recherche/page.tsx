'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { createClient } from '@supabase/supabase-js';
import { mapBotDealToGame, type Game } from '@/data/games';
import Image from 'next/image';
import Link from 'next/link';

const FALLBACK_IMAGE = '/images/GigaPrice.jpg';

function isValidImageUrl(src: unknown): src is string {
    if (typeof src !== 'string') return false;
    const s = src.trim();
    if (!s || s === 'null' || s === 'undefined') return false;
    return s.startsWith('https://') || s.startsWith('http://') || s.startsWith('/');
}

function SearchResultsContent() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';
    const [promoResults, setPromoResults] = useState<Game[]>([]);
    const [catalogResults, setCatalogResults] = useState<Game[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function search() {
            if (!query || query.length < 2) {
                setLoading(false);
                return;
            }

            setLoading(true);

            // Search promotions
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
            const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

            let promos: Game[] = [];
            if (supabaseUrl && supabaseKey) {
                const supabase = createClient(supabaseUrl, supabaseKey);
                const searchPattern = `%${query}%`;
                const { data } = await supabase
                    .from('bot_deals')
                    .select('*')
                    .or(`title.ilike.${searchPattern},name.ilike.${searchPattern}`)
                    .limit(50);
                if (data) {
                    promos = data.map((row) => mapBotDealToGame(row as Record<string, unknown>));
                }
            }

            // Search catalog
            let catalog: Game[] = [];
            try {
                const res = await fetch(`/api/search-catalog?q=${encodeURIComponent(query)}&limit=50`);
                if (res.ok) {
                    const data = await res.json();
                    catalog = data.games || [];
                }
            } catch {
                // ignore
            }

            setPromoResults(promos);
            setCatalogResults(catalog);
            setLoading(false);
        }

        search();
    }, [query]);

    if (!query || query.length < 2) {
        return (
            <div className="search-page-empty">
                <p>Veuillez entrer au moins 2 caractères pour rechercher.</p>
            </div>
        );
    }

    return (
        <>
            <h1 className="search-page-title">
                Résultats pour &quot;{query}&quot;
            </h1>

            {loading ? (
                <div className="search-page-loading">Recherche en cours...</div>
            ) : (
                <>
                    {/* Promotions */}
                    {promoResults.length > 0 && (
                        <section className="search-section">
                            <h2 className="search-section-title">🔥 En promotion ({promoResults.length})</h2>
                            <div className="search-grid">
                                {promoResults.map((game) => (
                                    <Link
                                        key={`promo-${game.slug}-${game.id}`}
                                        href={`/jeux?slug=${game.slug}`}
                                        className="search-card"
                                    >
                                        <div className="search-card-image">
                                            <Image
                                                src={isValidImageUrl(game.coverImage) ? game.coverImage : FALLBACK_IMAGE}
                                                alt={game.title}
                                                fill
                                                sizes="200px"
                                                style={{ objectFit: 'cover' }}
                                            />
                                            {game.discount && game.discount !== '—' && (
                                                <span className="search-card-badge">{game.discount}</span>
                                            )}
                                        </div>
                                        <div className="search-card-info">
                                            <span className="search-card-title">{game.title}</span>
                                            <span className="search-card-price">{game.price}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Catalogue */}
                    {catalogResults.length > 0 && (
                        <section className="search-section">
                            <h2 className="search-section-title">📚 Catalogue ({catalogResults.length})</h2>
                            <div className="search-grid">
                                {catalogResults.map((game) => (
                                    <Link
                                        key={`catalog-${game.slug}-${game.id}`}
                                        href={`/jeux?slug=${game.slug}`}
                                        className="search-card search-card-catalog"
                                    >
                                        <div className="search-card-image">
                                            <Image
                                                src={isValidImageUrl(game.coverImage) ? game.coverImage : FALLBACK_IMAGE}
                                                alt={game.title}
                                                fill
                                                sizes="200px"
                                                style={{ objectFit: 'cover' }}
                                            />
                                        </div>
                                        <div className="search-card-info">
                                            <span className="search-card-title">{game.title}</span>
                                            <span className="search-card-platform">{game.platform}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {promoResults.length === 0 && catalogResults.length === 0 && (
                        <div className="search-page-empty">
                            <p>Aucun résultat trouvé pour &quot;{query}&quot;</p>
                        </div>
                    )}
                </>
            )}
        </>
    );
}

export default function SearchPage() {
    return (
        <div className="search-page">
            <div className="search-page-container">
                <Suspense fallback={<div className="search-page-loading">Chargement...</div>}>
                    <SearchResultsContent />
                </Suspense>
            </div>
        </div>
    );
}
