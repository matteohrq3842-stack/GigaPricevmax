'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { FaSearch } from 'react-icons/fa';
import SearchModal from '@/components/modals/SearchModal';
import { useAuth } from '@/components/providers/SessionProvider';
import { hasPricePanelAccess } from '@/lib/discord-roles';
import { useUserRoles } from '@/hooks/useUserRoles';

type OpenDropdown = null | 'shops' | 'hardware' | 'theme' | 'promotions';

export default function Navbar() {
  const pathname = usePathname();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<OpenDropdown>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, signInWithDiscord } = useAuth();
  const { roleIds } = useUserRoles();
  const hideNavbar = false;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => setOpenDropdown(null), 0);
    return () => clearTimeout(timeout);
  }, [pathname]);

  useEffect(() => {
    const onDocClick = () => setOpenDropdown(null);
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const isActive = (path: string) => {
    return pathname === path ? 'active' : '';
  };

  const toggleDropdown = (key: Exclude<OpenDropdown, null>) => {
    setOpenDropdown((prev) => (prev === key ? null : key));
  };

  const openCookieSettings = () => {
    window.dispatchEvent(new Event('gp:open-cookie-settings'));
    setOpenDropdown(null);
  };

  if (hideNavbar) return null;

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="nav-inner">
        <Link href="/" className="nav-brand" style={{ textDecoration: 'none' }}>
          <div className="logo-box">
            <Image src="/logo.png" alt="GigaPrice" width={56} height={56} className="logo-image" priority />
          </div>
          <div className="brand-text-container">
            <span className="brand-giga">GIGA</span>
            <span className="brand-price">PRICE</span>
          </div>
        </Link>

        <div className="nav-center">
          <div className={`nav-top-links ${isScrolled ? 'is-hidden' : ''}`}>
            <Link href="/tendances" className={`nav-top-link ${isActive('/tendances')}`}>
              Tendances
            </Link>
            <Link href="/nouveaute-semaine" className={`nav-top-link ${isActive('/nouveaute-semaine')}`}>
              Nouveauté de la semaine
            </Link>
            <Link href="/informations" className={`nav-top-link ${isActive('/informations')}`}>
              Informations
            </Link>
            <Link href="/support" className={`nav-top-link ${isActive('/support')}`}>
              Support
            </Link>
          </div>
          <nav className="nav-menu-center">
            <Link href="/" className={`nav-link ${isActive('/')}`}>
              Accueil
            </Link>
            <Link href="/promotions" className={`nav-link ${isActive('/promotions')}`}>
              Promotions
            </Link>

            <div
              className={`nav-item-dropdown ${openDropdown === 'shops' ? 'open' : ''}`}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="nav-link dropdown-trigger"
                aria-expanded={openDropdown === 'shops'}
                onClick={() => toggleDropdown('shops')}
              >
                Boutiques & Services ▾
              </button>
              <div className="dropdown-menu">
                <Link href="/monnaies-jeu" className="dropdown-item">
                  Monnaies Jeu
                </Link>
                <Link href="/abonnements" className="dropdown-item">
                  Abonnements
                </Link>
                <Link href="/cartes-cadeaux" className="dropdown-item">
                  Cartes Cadeaux
                </Link>
              </div>
            </div>

            <div
              className={`nav-item-dropdown ${openDropdown === 'hardware' ? 'open' : ''}`}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="nav-link dropdown-trigger"
                aria-expanded={openDropdown === 'hardware'}
                onClick={() => toggleDropdown('hardware')}
              >
                Hardware & Setup ▾
              </button>
              <div className="dropdown-menu">
                <Link href="/hardware/setup-pc" className="dropdown-item">
                  Setup PC
                </Link>
                <Link href="/hardware/composants" className="dropdown-item">
                  Composants
                </Link>
                <Link href="/hardware/peripheriques" className="dropdown-item">
                  Périphériques
                </Link>
                <Link href="/hardware/consoles" className="dropdown-item">
                  Consoles
                </Link>
                <Link href="/hardware/accessoires" className="dropdown-item">
                  Accessoires
                </Link>
              </div>
            </div>

            <Link href="/jeux-gratuits" className={`nav-link ${isActive('/jeux-gratuits')}`}>
              Jeux
            </Link>
            {user && (
              <>
                <Link href="/favoris" className={`nav-link ${isActive('/favoris')}`}>
                  Favoris
                </Link>
                <Link href="/alertes" className={`nav-link ${isActive('/alertes')}`}>
                  Alertes
                </Link>
              </>
            )}
            <button 
              className="search-btn-nav" 
              onClick={() => setIsSearchModalOpen(true)}
              aria-label="Rechercher"
            >
              <FaSearch />
            </button>
          </nav>
        </div>

        <ul className="nav-menu-right">
          <li>
            <div
              className={`nav-item-dropdown ${openDropdown === 'theme' ? 'open' : ''}`}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="nav-link dropdown-trigger"
                aria-expanded={openDropdown === 'theme'}
                onClick={() => toggleDropdown('theme')}
              >
                Theme ▾
              </button>
              <div className="dropdown-menu">
                <button
                  onClick={() => document.documentElement.removeAttribute('data-theme')}
                  className="dropdown-item"
                  style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
                >
                  Violet (Défaut)
                </button>
                <button
                  onClick={() => document.documentElement.setAttribute('data-theme', 'red')}
                  className="dropdown-item"
                  style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
                >
                  Rouge
                </button>
                <button
                  onClick={() => document.documentElement.setAttribute('data-theme', 'pink')}
                  className="dropdown-item"
                  style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
                >
                  Rose
                </button>
                <button
                  onClick={() => document.documentElement.setAttribute('data-theme', 'green')}
                  className="dropdown-item"
                  style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
                >
                  Vert
                </button>
                <button
                  onClick={() => document.documentElement.setAttribute('data-theme', 'orange')}
                  className="dropdown-item"
                  style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
                >
                  Orange
                </button>
                <button
                  onClick={() => document.documentElement.setAttribute('data-theme', 'blue')}
                  className="dropdown-item"
                  style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
                >
                  Bleu
                </button>
                <button
                  onClick={() => document.documentElement.setAttribute('data-theme', 'skyblue')}
                  className="dropdown-item"
                  style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
                >
                  Bleu Ciel
                </button>
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '6px 10px' }} />
                <button
                  type="button"
                  onClick={openCookieSettings}
                  className="dropdown-item"
                  style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
                >
                  Gérer les cookies
                </button>
              </div>
            </div>
          </li>
          <li>
            <Link href="/game-keys" className={`nav-link ${isActive('/game-keys')}`}>
              Game Keys
            </Link>
          </li>
          <li>
            <div className="nav-right-stack">
              {user ? (
                <Link 
                  href="/profile"
                  className="btn-connexion" 
                  style={{ cursor: 'pointer', color: '#e0e0e0', fontFamily: 'inherit', fontSize: '1rem', textDecoration: 'none' }}
                >
                  {(user.user_metadata as Record<string, unknown> | null)?.avatar_url ? (
                    <Image
                      src={(user.user_metadata as Record<string, unknown>).avatar_url as string}
                      alt={((user.user_metadata as Record<string, unknown> | null)?.full_name as string) || "User"}
                      width={24}
                      height={24}
                      style={{ borderRadius: '50%' }}
                    />
                  ) : (
                    <Image
                      src="/images/discord-icon.png"
                      alt="Discord"
                      width={24}
                      height={24}
                    />
                  )}
                  <span style={{ marginLeft: '4px' }}>
                    {((user.user_metadata as Record<string, unknown> | null)?.full_name as string) ||
                      ((user.user_metadata as Record<string, unknown> | null)?.name as string) ||
                      user.email ||
                      "Profil"}
                  </span>
                </Link>
              ) : (
                <button 
                  className="btn-connexion" 
                  onClick={() => signInWithDiscord()}
                  style={{ cursor: 'pointer', color: '#e0e0e0', fontFamily: 'inherit', fontSize: '1rem' }}
                >
                  <Image
                    src="/images/discord-icon.png"
                    alt="Discord"
                    width={24}
                    height={24}
                  />
                  <span>Connexion</span>
                </button>
              )}
              {user && hasPricePanelAccess(roleIds) && (
                <Link href="/price-panel" className="price-panel-btn nav-price-panel-btn" style={{ textDecoration: 'none' }}>
                  <Image
                    src="/images/gp-icon.svg?v=3"
                    alt="Logo GP"
                    width={22}
                    height={22}
                    className="price-panel-logo"
                  />
                  <span className="price-panel-text">Price Panel</span>
                </Link>
              )}
            </div>
          </li>
        </ul>
      </div>

      <SearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />
    </nav>
  );
}
