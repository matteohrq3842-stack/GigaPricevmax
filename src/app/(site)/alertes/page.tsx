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
  FaPlus, 
  FaPen, 
  FaTrash, 
  FaArrowDown
} from 'react-icons/fa';

export default function AlertesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Chargement...</div>;
  if (!user) return null;

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
          <Link href="/alertes" className="dash-link active">
            <span style={{ marginRight: '10px' }}><FaBell /></span> Alertes Prix
          </Link>
          <Link href="/favoris" className="dash-link">
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
            <h1>Mes Alertes</h1>
            <p>Gérez vos surveillances de prix en temps réel.</p>
          </div>
          <div className="stat-card" style={{ padding: '15px 30px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ fontSize: '0.9rem', marginBottom: '5px', color: '#aaa' }}>Alertes Utilisées</h3>
            <div className="stat-value" style={{ fontSize: '2rem', display: 'flex', alignItems: 'baseline', gap: '5px' }}>
              2 <span className="stat-max" style={{ fontSize: '1rem', color: '#666' }}>/ 5</span>
            </div>
          </div>
        </header>

        <section className="alerts-list">
          {/* Carte 1 : EA FC 24 */}
          <div className="alert-item">
            <div className="alert-image-container">
              <Image 
                src="https://cdn.cloudflare.steamstatic.com/steam/apps/2195250/library_600x900_2x.jpg"
                alt="EA FC 24"
                width={300}
                height={200}
              />
            </div>
            <div className="alert-content">
              <div className="alert-info">
                <h4>EA SPORTS FC™ 24</h4>
                <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '10px' }}>Steam (PC)</p>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#888' }}>Actuel</div>
                    <div style={{ color: 'white', fontWeight: 'bold' }}>69.99€</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.8rem', color: '#888' }}>Cible</div>
                    <div style={{ color: '#793BDC', fontWeight: 'bold' }}>&lt; 25.00€</div>
                  </div>
                </div>
              </div>
              
              <div className="alert-actions" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button className="btn-action-small btn-edit" style={{ justifyContent: 'center', background: 'rgba(255, 255, 255, 0.1)', color: 'white', padding: '10px' }}>
                  <FaPen /> Modifier
                </button>
                <button className="btn-action-small btn-delete" style={{ justifyContent: 'center', background: 'rgba(255, 71, 87, 0.1)', color: '#ff4757', padding: '10px' }}>
                  <FaTrash /> Supprimer
                </button>
              </div>
            </div>
          </div>

          {/* Carte 2 : MW3 */}
          <div className="alert-item">
            <div className="alert-status-badge" style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.7)', padding: '5px 10px', borderRadius: '20px', fontSize: '0.8rem', color: '#4ade80', border: '1px solid #4ade80', zIndex: '2', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <FaArrowDown /> En baisse
            </div>
            <div className="alert-image-container">
              <Image 
                src="https://cdn.cloudflare.steamstatic.com/steam/apps/2519060/library_600x900_2x.jpg"
                alt="Call of Duty®: Modern Warfare® III"
                width={300}
                height={200}
              />
            </div>
            <div className="alert-content">
              <div className="alert-info">
                <h4>Call of Duty®: MW3</h4>
                <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '10px' }}>Steam (PC)</p>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#888' }}>Actuel</div>
                    <div style={{ color: 'white', fontWeight: 'bold' }}>59.99€</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.8rem', color: '#888' }}>Cible</div>
                    <div style={{ color: '#793BDC', fontWeight: 'bold' }}>&lt; 40.00€</div>
                  </div>
                </div>
              </div>
              
              <div className="alert-actions" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button className="btn-action-small btn-edit" style={{ justifyContent: 'center', background: 'rgba(255, 255, 255, 0.1)', color: 'white', padding: '10px' }}>
                  <FaPen /> Modifier
                </button>
                <button className="btn-action-small btn-delete" style={{ justifyContent: 'center', background: 'rgba(255, 71, 87, 0.1)', color: '#ff4757', padding: '10px' }}>
                  <FaTrash /> Supprimer
                </button>
              </div>
            </div>
          </div>

          {/* Carte Ajout */}
          <div className="alert-add-card">
            <div style={{ marginBottom: '15px', color: '#555' }}>
              <FaPlus size={40} />
            </div>
            <p style={{ color: '#666' }}>Nouvelle Alerte</p>
          </div>
        </section>
      </main>
    </div>
  );
}
