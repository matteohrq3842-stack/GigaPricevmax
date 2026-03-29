import type { CSSProperties } from 'react';
import Link from 'next/link';

export default function CGV() {
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
      <h1 style={titleStyle}>Conditions générales d&apos;utilisation (CGU)</h1>

      <div style={containerStyle}>
        <section style={sectionStyle}>
          <h2 style={h2Style}>1. Objet</h2>
          <p style={pStyle}>
            Les présentes conditions générales d&apos;utilisation (CGU) ont pour objet de définir les
            modalités d&apos;accès et d&apos;utilisation du site GigaPrice.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>2. Description du service</h2>
          <p style={pStyle}>
            GigaPrice est un service de comparaison de prix et d&apos;agrégation d&apos;offres (jeux vidéo,
            produits numériques, cartes cadeaux et services), présenté à titre informatif.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>3. Absence de vente</h2>
          <p style={pStyle}>
            GigaPrice n&apos;est pas une boutique en ligne et ne vend aucun produit directement. Aucun
            paiement n&apos;est encaissé sur GigaPrice au titre des achats réalisés chez les partenaires.
          </p>
          <p style={pStyle}>
            En cliquant sur une offre, l&apos;utilisateur est redirigé vers le site d&apos;un partenaire
            marchand afin d&apos;y finaliser sa commande selon les conditions propres à ce partenaire.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>4. Prix, disponibilité et exactitude</h2>
          <p style={pStyle}>
            Les prix et informations affichés sur GigaPrice sont mis à jour régulièrement, mais
            peuvent être différents au moment de la consultation.
          </p>
          <p style={pStyle}>
            Le prix final, les frais éventuels, la disponibilité et les conditions applicables sont
            ceux affichés sur le site du partenaire marchand au moment de la validation de la
            commande. En cas de divergence, les informations du partenaire prévalent.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>5. Transparence et affiliation</h2>
          <p style={pStyle}>
            Certains liens présents sur GigaPrice peuvent être des liens d&apos;affiliation. Une
            commission peut être perçue en cas d&apos;achat chez un partenaire, sans surcoût pour
            l&apos;utilisateur.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>6. Responsabilité</h2>
          <p style={pStyle}>
            GigaPrice agit en tant qu&apos;intermédiaire technique. Les transactions, paiements,
            livraisons, garanties, retours et services après-vente relèvent exclusivement des
            partenaires marchands.
          </p>
          <p style={pStyle}>
            GigaPrice ne saurait être tenu responsable des dommages directs ou indirects liés à
            l&apos;utilisation du site, à l&apos;inaccessibilité temporaire du service, ou à l&apos;utilisation des
            sites tiers accessibles via les liens.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>7. Propriété intellectuelle</h2>
          <p style={pStyle}>
            Les contenus présents sur GigaPrice (textes, éléments graphiques, logo, charte) sont
            protégés. Toute reproduction, représentation ou exploitation non autorisée est
            interdite.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>8. Données personnelles</h2>
          <p style={pStyle}>
            Les informations relatives au traitement des données personnelles figurent dans la{' '}
            <Link href="/privacy" style={linkStyle}>
              Politique de confidentialité
            </Link>
            .
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>9. Modification des CGU</h2>
          <p style={pStyle}>
            GigaPrice se réserve le droit de modifier les présentes CGU à tout moment. La version
            applicable est celle publiée sur le site à la date de consultation.
          </p>
        </section>

        <section style={{ marginBottom: 0 }}>
          <h2 style={h2Style}>10. Droit applicable et contact</h2>
          <p style={pStyle}>
            Les présentes CGU sont soumises au droit français. Pour toute question, contactez :
            contact@gigaprice.fr.
          </p>
        </section>
      </div>
    </main>
  );
}
