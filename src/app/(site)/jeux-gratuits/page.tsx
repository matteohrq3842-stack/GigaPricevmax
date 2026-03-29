'use client';

import React, { useState } from 'react';
import { FaSearch, FaGift, FaClock, FaSteam, FaXbox, FaCheck } from 'react-icons/fa';
import { SiEpicgames } from 'react-icons/si';

// --- Mock Data for Free Games ---
const freeGames = [
  {
    id: 1,
    title: "Marvel's Guardians of the Galaxy",
    platform: "Epic Games",
    platformIcon: <SiEpicgames />,
    originalPrice: "59.99€",
    endDate: "11 Janv. 17:00",
    imageUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1088850/header.jpg",
    tag: "GRATUIT"
  },
  {
    id: 2,
    title: "Sail Forth",
    platform: "Epic Games",
    platformIcon: <SiEpicgames />,
    originalPrice: "19.99€",
    endDate: "18 Janv. 17:00",
    imageUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1031460/header.jpg",
    tag: "GRATUIT"
  },
  {
    id: 3,
    title: "Half-Life 2",
    platform: "Steam",
    platformIcon: <FaSteam />,
    originalPrice: "9.75€",
    endDate: "Offre Limitée",
    imageUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/220/header.jpg",
    tag: "-100%"
  },
  {
    id: 4,
    title: "The Sims™ 4",
    platform: "Steam",
    platformIcon: <FaSteam />,
    originalPrice: "0.00€",
    endDate: "Gratuit",
    imageUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1222670/header.jpg",
    tag: "GRATUIT"
  },
  {
    id: 5,
    title: "Overwatch 2",
    platform: "Battle.net",
    platformIcon: <FaXbox />, 
    originalPrice: "Gratuit",
    endDate: "Toujours",
    imageUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/2357570/header.jpg",
    tag: "F2P"
  }
];

const platforms = ["Tout", "Epic Games", "Steam", "Xbox"];

export default function JeuxGratuitsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("Tout");

  // Filter Logic
  const filteredGames = freeGames.filter(game => {
    const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform = selectedPlatform === "Tout" || game.platform === selectedPlatform;
    return matchesSearch && matchesPlatform;
  });

  return (
    <main>
      {/* --- Hero Section (Centré) --- */}
      <section className="hero-header">
        <h1 className="hero-title">Jeux Gratuits</h1>
        <p className="hero-subtitle">
          Ne manquez aucune offre ! Récupérez des jeux complets gratuitement sur Epic, Steam et plus.
        </p>
      </section>

      <div className="page-container">
        {/* --- Sidebar Filtres --- */}
        <aside className="filters-sidebar">
          
          {/* Recherche Locale */}
          <div className="filter-group">
            <h3 className="filter-title">Recherche</h3>
            <div className="search-bar-local">
              <FaSearch className="search-icon" style={{ color: '#aaa' }} />
              <input 
                type="text" 
                placeholder="Titre du jeu..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Filtre Plateforme */}
          <div className="filter-group">
            <h3 className="filter-title">Plateforme</h3>
            {platforms.map(platform => (
              <div key={platform} className="filter-option" onClick={() => setSelectedPlatform(platform)}>
                <div 
                  className="filter-checkbox"
                  style={selectedPlatform === platform ? { background: '#793BDC', borderColor: '#793BDC' } : {}}
                >
                  {selectedPlatform === platform && <FaCheck size={10} style={{ position: 'absolute', top: '3px', left: '3px', color: 'white' }} />}
                </div>
                <span style={selectedPlatform === platform ? { color: 'white', fontWeight: '600' } : {}}>{platform}</span>
              </div>
            ))}
          </div>

          {/* Info Box */}
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '12px', marginTop: '40px' }}>
            <h4 style={{ color: '#fff', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaGift /> Astuce
            </h4>
            <p style={{ fontSize: '0.9rem', color: '#ccc', lineHeight: '1.5' }}>
              Revenez chaque jeudi à 17h pour les nouveaux jeux gratuits Epic Games !
            </p>
          </div>

        </aside>

        {/* --- Grille de Jeux --- */}
        <div style={{ flex: 1 }}>
          <section className="cards-container" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', padding: '0 0 40px' }}>
            {filteredGames.map((game) => (
              <div key={game.id} className="card">
                {/* Visual Placeholder mimicking the card-image style */}
                <div 
                  className="card-image" 
                  style={{ 
                    backgroundImage: `url(${game.imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    height: '200px', // Slightly taller for better visual
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                  }}
                >
                  {/* Platform Badge */}
                  <div className="platform-badge" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {game.platformIcon} {game.platform}
                  </div>
                  
                  {/* Free Tag */}
                  <div className="discount-badge" style={{ background: '#00e054', color: '#003300' }}>
                    {game.tag}
                  </div>

                  {/* Icon Center (Optional) */}
                  <FaGift size={40} color="rgba(255,255,255,0.2)" />
                </div>
                
                <div className="card-header">
                  <h3 style={{ fontSize: '1.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {game.title}
                  </h3>
                </div>

                <div className="card-footer">
                  <div className="price-info">
                    <span className="current-price" style={{ color: '#00e054' }}>Gratuit</span>
                    <span className="old-price">{game.originalPrice}</span>
                  </div>
                  
                  <div className="time-remaining" style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem', color: '#ff9900', background: 'rgba(255, 153, 0, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>
                    <FaClock />
                    <span>{game.endDate}</span>
                  </div>
                </div>
                
                {/* Button overlay or extra footer action could go here */}
                <div style={{ padding: '0 20px 20px' }}>
                  <button style={{ width: '100%', padding: '10px', borderRadius: '8px', border: 'none', background: 'white', color: 'black', fontWeight: '700', cursor: 'pointer' }}>
                    Récupérer
                  </button>
                </div>
              </div>
            ))}
          </section>

          {filteredGames.length === 0 && (
            <div style={{ textAlign: 'center', padding: '50px', color: '#888' }}>
              <h3>Aucune offre trouvée</h3>
              <p>Essayez de modifier vos filtres.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
