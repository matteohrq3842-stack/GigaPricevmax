import Link from 'next/link';
import { FaDiscord, FaTwitter, FaEnvelope, FaSteam, FaPlaystation, FaXbox } from 'react-icons/fa';
import { SiNintendoswitch } from 'react-icons/si';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{ background: '#0a0a0a', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '60px', marginTop: 'auto' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '60px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-1px', background: 'linear-gradient(90deg, #fff, #aaa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>GIGAPRICE</h2>
            <p style={{ color: '#888', lineHeight: '1.6', fontSize: '0.95rem' }}>
              Votre comparateur de prix gaming de référence. Trouvez les meilleures offres en temps réel et économisez sur vos jeux préférés.
            </p>
            <div style={{ display: 'flex', gap: '15px' }}>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" style={{ color: '#fff', opacity: 0.7, transition: 'opacity 0.2s' }} aria-label="Twitter">
                <FaTwitter size={20} />
              </a>
              <a href="https://discord.gg/ZJryMtkDPP" target="_blank" rel="noopener noreferrer" style={{ color: '#fff', opacity: 0.7, transition: 'opacity 0.2s' }} aria-label="Discord">
                <FaDiscord size={20} />
              </a>
              <a href="mailto:contact@gigaprice.fr" style={{ color: '#fff', opacity: 0.7, transition: 'opacity 0.2s' }} aria-label="Email">
                <FaEnvelope size={20} />
              </a>
            </div>
          </div>

          <div>
            <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: '700', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>Navigation</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li><Link href="/" style={{ color: '#aaa', textDecoration: 'none', fontSize: '0.95rem', transition: 'color 0.2s' }}>Accueil</Link></li>
              <li><Link href="/promotions" style={{ color: '#aaa', textDecoration: 'none', fontSize: '0.95rem', transition: 'color 0.2s' }}>Promotions</Link></li>
              <li><Link href="/jeux-gratuits" style={{ color: '#aaa', textDecoration: 'none', fontSize: '0.95rem', transition: 'color 0.2s' }}>Jeux Gratuits</Link></li>
              <li><Link href="/tendances" style={{ color: '#aaa', textDecoration: 'none', fontSize: '0.95rem', transition: 'color 0.2s' }}>Tendances</Link></li>
            </ul>
          </div>

          <div>
            <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: '700', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>Plateformes</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li>
                <Link href="#" style={{ color: '#aaa', textDecoration: 'none', fontSize: '0.95rem', transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaSteam /> PC / Steam
                </Link>
              </li>
              <li>
                <Link href="#" style={{ color: '#aaa', textDecoration: 'none', fontSize: '0.95rem', transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaPlaystation /> PlayStation
                </Link>
              </li>
              <li>
                <Link href="#" style={{ color: '#aaa', textDecoration: 'none', fontSize: '0.95rem', transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaXbox /> Xbox
                </Link>
              </li>
              <li>
                <Link href="#" style={{ color: '#aaa', textDecoration: 'none', fontSize: '0.95rem', transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <SiNintendoswitch /> Nintendo Switch
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: '700', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>Informations</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li><Link href="/mentions-legales" style={{ color: '#aaa', textDecoration: 'none', fontSize: '0.95rem', transition: 'color 0.2s' }}>Mentions Légales</Link></li>
              <li><Link href="/cgv" style={{ color: '#aaa', textDecoration: 'none', fontSize: '0.95rem', transition: 'color 0.2s' }}>CGV / CGU</Link></li>
              <li><Link href="/privacy" style={{ color: '#aaa', textDecoration: 'none', fontSize: '0.95rem', transition: 'color 0.2s' }}>Politique de Confidentialité</Link></li>
              <li><Link href="/support" style={{ color: '#aaa', textDecoration: 'none', fontSize: '0.95rem', transition: 'color 0.2s' }}>Support & Contact</Link></li>
            </ul>
          </div>

        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '30px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ color: '#666', fontSize: '0.85rem' }}>
            &copy; {currentYear} GIGAPRICE. Tous droits réservés.
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
             <span style={{ color: '#444', fontSize: '0.85rem', fontWeight: '600', letterSpacing: '1px' }}>ACTUGAME • ENEBA • CDKEYS</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
