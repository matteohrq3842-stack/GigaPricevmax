'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/SessionProvider';
import Link from 'next/link';
import Image from 'next/image';
import { 
  FaGamepad, 
  FaBell, 
  FaCog, 
  FaHeart,
  FaShoppingCart,
  FaTrash
} from 'react-icons/fa';

export default function FavorisPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Chargement...</div>;
  if (!user) return null;

  const favorites = [
    { id: 1245620, title: "Elden Ring", price: "35.99€" },
    { id: 1091500, title: "Cyberpunk 2077", price: "29.99€" },
    { id: 990080, title: "Hogwarts Legacy", price: "45.00€" },
    { id: 1086940, title: "Baldur's Gate 3", price: "59.99€" },
    { id: 1174180, title: "Red Dead Redemption 2", price: "19.99€" },
    { id: 1593500, title: "God of War", price: "24.99€" },
    { id: 271590, title: "Grand Theft Auto V", price: "14.99€" },
    { id: 292030, title: "The Witcher 3: Wild Hunt", price: "9.99€" },
  ];

  return (
    <div className="dashboard-container">
      <aside className="dashboard-sidebar" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="user-profile-summary">
          <div className="user-avatar-placeholder">
            <FaGamepad size={40} color="white" />
          </div>
          <h2 className="username">Matteo</h2>
          <span className="member-since">Membre depuis 2024</span>
          <div style={{ marginTop: '15px' }}>
            <span className="status-badge">Connecté</span>
          </div>
        </div>
        
        <nav className="dashboard-nav">
          <Link href="/alertes" className="dash-link">
            <span style={{ marginRight: '10px' }}><FaBell /></span> Alertes Prix
          </Link>
          <Link href="/favoris" className="dash-link active">
            <span style={{ marginRight: '10px' }}><FaHeart /></span> Mes Favoris
          </Link>
          <Link href="/price-panel" className="dash-link">
            <span style={{ marginRight: '10px' }}><FaCog /></span> Configuration
          </Link>
        </nav>
      </aside>

      <main className="dashboard-content">
        <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="header-text">
            <h1>Ma Collection</h1>
            <p>Retrouvez tous vos jeux coups de cœur.</p>
          </div>
          <div style={{ fontSize: '1.2rem', color: '#888', fontWeight: '600' }}>
            {favorites.length} Jeux
          </div>
        </header>

        <section className="favorites-grid">
          {favorites.map((game) => (
            <div key={game.id} className="favorite-card">
              <div className="favorite-image-container">
                <Image 
                  src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${game.id}/library_600x900_2x.jpg`}
                  alt={game.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="favorite-overlay"></div>
                
                {/* Actions au survol (Coins haut droit) */}
                <div className="favorite-actions-hover">
                  <button className="btn-fav-action" title="Voir les offres">
                    <FaShoppingCart size={14} />
                  </button>
                  <button className="btn-fav-action delete" title="Retirer des favoris">
                    <FaTrash size={14} />
                  </button>
                </div>

                {/* Info en bas */}
                <div className="favorite-info">
                  <h4 className="favorite-title">{game.title}</h4>
                  <div className="favorite-price-tag">{game.price}</div>
                </div>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
