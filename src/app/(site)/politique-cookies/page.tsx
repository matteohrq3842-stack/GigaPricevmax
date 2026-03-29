import type { CSSProperties } from 'react';
import Link from 'next/link';

export default function CookiePolicyPage() {
  const pageStyle: CSSProperties = {
    minHeight: '100vh',
    backgroundColor: '#1a1a1a',
    color: '#e0e0e0',
    fontFamily: 'Arial, sans-serif',
    padding: '120px 20px 80px',
    textAlign: 'center',
    position: 'relative',
    zIndex: 1,
  };

  const containerStyle: CSSProperties = {
    maxWidth: '900px',
    margin: '0 auto',
  };

  const titleStyle: CSSProperties = {
    fontSize: '2.4rem',
    fontWeight: 800,
    marginBottom: '70px',
    color: '#ffffff',
    letterSpacing: '0.5px',
  };

  const sectionStyle: CSSProperties = {
    marginBottom: '60px',
  };

  const h2Style: CSSProperties = {
    fontSize: '1.35rem',
    fontWeight: 800,
    marginBottom: '18px',
    color: '#ffffff',
  };

  const pStyle: CSSProperties = {
    lineHeight: '1.9',
    marginBottom: '10px',
    fontSize: '1.05rem',
  };

  const linkStyle: CSSProperties = {
    color: '#ffffff',
    textDecoration: 'underline',
    textUnderlineOffset: '4px',
  };

  const tableWrapStyle: CSSProperties = {
    overflowX: 'auto',
    marginTop: '18px',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    background: 'rgba(255,255,255,0.03)',
  };

  const thStyle: CSSProperties = {
    padding: '12px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    color: '#ffffff',
    fontWeight: 800,
    fontSize: '0.95rem',
  };

  const tdStyle: CSSProperties = {
    padding: '12px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    color: 'rgba(255,255,255,0.85)',
    fontSize: '0.95rem',
  };

  return (
    <main style={pageStyle}>
      <h1 style={titleStyle}>Politique de cookies</h1>

      <div style={containerStyle}>
        <section style={sectionStyle}>
          <p style={{ ...pStyle, color: 'rgba(255,255,255,0.65)', fontSize: '0.95rem' }}>
            Dernière mise à jour : 15 janvier 2026
          </p>
          <p style={pStyle}>
            Cette page décrit l’utilisation des cookies et technologies similaires sur GigaPrice, ainsi que vos
            choix. Elle complète les{' '}
            <Link href="/mentions-legales" style={linkStyle}>
              Mentions légales
            </Link>
            .
          </p>
          <p style={pStyle}>
            Conformément à l’article 82 de la loi Informatique et Libertés et au RGPD (UE) 2016/679, les cookies
            non strictement nécessaires au fonctionnement du site ne sont déposés qu’après votre consentement.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>1. Qu’est-ce qu’un cookie ?</h2>
          <p style={pStyle}>
            Un cookie est un petit fichier texte enregistré sur votre terminal (ordinateur, mobile) lors de la
            consultation d’un site. Il permet, par exemple, de mémoriser un choix, de sécuriser une session ou de
            faciliter certaines fonctionnalités.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>2. Cookies utilisés sur GigaPrice</h2>
          <p style={pStyle}>
            GigaPrice n’utilise pas de cookies publicitaires propres à son domaine. Les cookies listés ci-dessous
            sont utilisés pour mémoriser votre choix de consentement et, si vous l’acceptez, activer des
            fonctionnalités d’amélioration du service.
          </p>

          <div style={tableWrapStyle}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <th style={thStyle}>Nom</th>
                  <th style={thStyle}>Finalité</th>
                  <th style={thStyle}>Durée</th>
                  <th style={thStyle}>Base</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tdStyle}>
                    <code>gp_cookie_consent_v1</code>
                  </td>
                  <td style={tdStyle}>
                    Mémorise votre choix de consentement (afin de ne pas vous reposer la question à chaque visite).
                  </td>
                  <td style={tdStyle}>12 mois</td>
                  <td style={tdStyle}>Exempté (strictement nécessaire)</td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, borderBottom: 'none' }}>
                    <code>gp_user_uuid</code>
                  </td>
                  <td style={{ ...tdStyle, borderBottom: 'none' }}>
                    Identifiant technique aléatoire (non directement nominatif) utilisé, lorsque vous l’acceptez,
                    pour activer des fonctionnalités d’amélioration du service (ex. recommandations).
                  </td>
                  <td style={{ ...tdStyle, borderBottom: 'none' }}>13 mois</td>
                  <td style={{ ...tdStyle, borderBottom: 'none' }}>Consentement</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p style={{ ...pStyle, marginTop: '18px' }}>
            En complément, certaines informations de configuration peuvent être stockées dans le stockage local
            du navigateur (localStorage) afin d’améliorer l’expérience et de conserver vos choix.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>3. Gérer vos choix</h2>
          <p style={pStyle}>
            Vous pouvez accepter, refuser ou personnaliser vos choix via la fenêtre de consentement. Vous pouvez
            également modifier vos choix à tout moment via le lien “Gérer les cookies” présent dans le menu du
            site.
          </p>
          <p style={pStyle}>
            Vous pouvez aussi configurer votre navigateur pour bloquer ou supprimer des cookies. Attention : la
            désactivation de certains cookies strictement nécessaires peut dégrader le fonctionnement du site.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>4. Données personnelles et droits</h2>
          <p style={pStyle}>
            Pour toute question relative aux cookies et à la protection des données, vous pouvez nous contacter via
            la page{' '}
            <Link href="/support" style={linkStyle}>
              Contact
            </Link>
            . Les informations relatives à l’éditeur et aux coordonnées figurent dans les{' '}
            <Link href="/mentions-legales" style={linkStyle}>
              Mentions légales
            </Link>
            .
          </p>
          <p style={pStyle}>
            Conformément au RGPD, vous disposez notamment de droits d’accès, de rectification, d’effacement et
            d’opposition, ainsi que du droit de retirer votre consentement à tout moment.
          </p>
        </section>

        <section style={{ marginBottom: 0 }}>
          <h2 style={h2Style}>5. Cookies de sites tiers</h2>
          <p style={pStyle}>
            GigaPrice peut contenir des liens vers des sites tiers (partenaires, plateformes). Après redirection,
            ces sites peuvent déposer leurs propres cookies. Nous vous invitons à consulter leurs politiques de
            confidentialité et de cookies.
          </p>
        </section>
      </div>
    </main>
  );
}
