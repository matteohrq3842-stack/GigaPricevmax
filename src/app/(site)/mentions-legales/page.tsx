import type { CSSProperties } from 'react';
import Link from 'next/link';

export default function MentionsLegales() {
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

  return (
    <main style={pageStyle}>
      <h1 style={titleStyle}>Mentions légales</h1>

      <div style={containerStyle}>
        <section style={sectionStyle}>
          <h2 style={h2Style}>1. Éditeur du site</h2>
          <p style={pStyle}>Le site GigaPrice est édité par MKR-2TL.</p>
          <p style={pStyle}>Directeur de la publication : MKR-2TL &amp; ARAKI</p>
          <p style={pStyle}>Contact : contact@gigaprice.fr / giga.pricev1@gmail.com</p>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>2. Hébergement</h2>
          <p style={pStyle}>
            Le site est hébergé par Hostinger International Ltd, dont le siège social est situé au 61
            Lordou Vironos Street, 6023 Larnaca, Chypre.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>3. Nature du service</h2>
          <p style={pStyle}>
            GigaPrice est un service de comparaison de prix et d&apos;agrégation d&apos;offres. Le site ne
            vend pas de produits et ne réalise pas d&apos;encaissement pour le compte de tiers.
          </p>
          <p style={pStyle}>
            Lorsqu&apos;un utilisateur clique sur une offre, il est redirigé vers le site du partenaire
            marchand afin d&apos;y finaliser l&apos;achat.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>4. Propriété intellectuelle</h2>
          <p style={pStyle}>
            Les contenus présents sur ce site (textes, éléments graphiques, logo, charte) sont
            protégés par le droit de la propriété intellectuelle.
          </p>
          <p style={pStyle}>
            Les marques, logos, visuels et noms de produits cités (éditeurs, plateformes, marchands,
            jeux vidéo) appartiennent à leurs propriétaires respectifs.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>5. Liens externes et affiliation</h2>
          <p style={pStyle}>
            Certains liens présents sur GigaPrice peuvent être des liens d&apos;affiliation. À ce titre,
            une commission peut être perçue en cas d&apos;achat réalisé chez un partenaire, sans surcoût
            pour l&apos;utilisateur.
          </p>
          <p style={pStyle}>
            GigaPrice n&apos;est pas responsable des contenus, prix, disponibilités, conditions de vente
            ou politiques des sites tiers accessibles via ces liens.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>6. Données personnelles</h2>
          <p style={pStyle}>
            Les informations relatives au traitement des données personnelles figurent dans la{' '}
            <Link href="/privacy" style={linkStyle}>
              Politique de confidentialité
            </Link>
            .
          </p>
          <p style={pStyle}>
            Conformément à la réglementation applicable, vous disposez notamment de droits
            d&apos;accès, de rectification, d&apos;effacement et d&apos;opposition. Pour exercer ces droits,
            contactez : [Adresse email de contact].
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>7. Cookies</h2>
          <p style={pStyle}>
            GigaPrice ne met pas en place de cookies publicitaires propres à son domaine. En
            revanche, les sites tiers (partenaires marchands, plateformes) peuvent déposer leurs
            propres cookies lors de la navigation ou après redirection.
          </p>
        </section>

        <section style={{ marginBottom: 0 }}>
          <h2 style={h2Style}>8. Droit applicable</h2>
          <p style={pStyle}>
            Les présentes mentions légales sont soumises au droit français. En cas de litige, et à
            défaut de résolution amiable, les tribunaux compétents seront ceux déterminés par les
            règles de procédure applicables.
          </p>
        </section>
      </div>
    </main>
  );
}
