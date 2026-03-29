'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { FaSearch } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@supabase/supabase-js';
import { mapBotDealToGame, type Game } from '@/data/games';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FALLBACK_IMAGE = '/images/GigaPrice.jpg';

function isValidImageUrl(src: unknown): src is string {
  if (typeof src !== 'string') return false;
  const s = src.trim();
  if (!s || s === 'null' || s === 'undefined') return false;
  return s.startsWith('https://') || s.startsWith('http://') || s.startsWith('/');
}

// Inner component that handles the search functionality
function SearchModalInner({ onClose }: { onClose: () => void }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Unified search function
  const performSearch = useCallback(async (term: string): Promise<Game[]> => {
    const allResults: Game[] = [];
    const termLower = term.toLowerCase();

    // 1. Search in bot_deals (Supabase) - PRIORITY
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Search in title, prioritizing popular games (high metacritic score)
        const { data } = await supabase
          .from('bot_deals')
          .select('*')
          .ilike('title', `%${termLower}%`)
          .order('metacritic_score', { ascending: false })
          .limit(6);

        if (data && data.length > 0) {
          allResults.push(...data.map((row) => mapBotDealToGame(row as Record<string, unknown>)));
        }
      } catch (e) {
        console.error('Supabase search error:', e);
      }
    }

    // 2. Search in games_catalog via API
    try {
      const apiUrl = `/api/search-catalog?q=${encodeURIComponent(term)}&limit=8`;

      const res = await fetch(apiUrl);

      if (res.ok) {
        const data = await res.json();

        if (data.games && Array.isArray(data.games)) {
          allResults.push(...data.games);
        }
      }
    } catch (e) {
      console.error('Catalog API error:', e);
    }

    // Remove duplicates by slug
    const seen = new Set<string>();
    const uniqueResults = allResults.filter(game => {
      const key = game.slug || game.title;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return uniqueResults.slice(0, 8);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!searchTerm || searchTerm.length < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults([]);
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const searchResults = await performSearch(searchTerm);
        setResults(searchResults);
      } catch (e) {
        console.error('Search error:', e);
        setResults([]);
      }
      setLoading(false);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchTerm, performSearch]);

  // Focus input on mount and handle overflow
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = '';
    };
  }, []);

  const handleGameClick = (game: Game) => {
    onClose();
    router.push(`/jeux?slug=${game.slug}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      onClose();
    }
    if (e.key === 'Enter' && searchTerm.length >= 2) {
      onClose();
      router.push(`/recherche?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <div
      className="search-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="search-modal-box">
        {/* Barre de recherche arrondie */}
        <div className="search-bar">
          <FaSearch className="search-bar-icon" />
          <input
            ref={inputRef}
            type="text"
            className="search-bar-input"
            placeholder="Tapez le nom d'un jeu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        {/* Zone des résultats */}
        {searchTerm.length >= 2 && (
          <div className="search-results-list">
            {loading ? (
              <div className="search-results-loading">Recherche...</div>
            ) : results.length === 0 ? (
              <div className="search-results-empty">Aucun résultat</div>
            ) : (
              results.map((game, index) => (
                <button
                  key={`${game.slug}-${index}`}
                  className="search-result-row"
                  onClick={() => handleGameClick(game)}
                >
                  <div className="search-result-thumb">
                    <Image
                      src={isValidImageUrl(game.coverImage) ? game.coverImage : FALLBACK_IMAGE}
                      alt={game.title}
                      width={120}
                      height={68}
                      style={{ objectFit: 'cover', borderRadius: '8px' }}
                    />
                  </div>
                  <div className="search-result-details">
                    <span className="search-result-title">{game.title}</span>
                    {game.tags && game.tags.length > 0 && (
                      <span className="search-result-tag">{game.tags[0]}</span>
                    )}
                    {game.discount && game.discount !== '—' && (
                      <span className="search-result-discount">{game.discount}</span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Wrapper that handles mounting/unmounting
export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <SearchModalInner onClose={onClose} />,
    document.body
  );
}
