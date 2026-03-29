import type { CSSProperties } from 'react';
import Link from 'next/link';

export default function PolitiqueConfidentialite() {
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
      <h1 style={titleStyle}>Politique de confidentialité</h1>

      <div style={containerStyle}>
        <section style={sectionStyle}>
          <h2 style={h2Style}>1. Présentation</h2>
          <p style={pStyle}>
            La présente politique de confidentialité décrit la manière dont GigaPrice traite les
            données personnelles, conformément au Règlement (UE) 2016/679 (RGPD) et à la législation
            applicable.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>2. Responsable du traitement</h2>
          <p style={pStyle}>
            Responsable du traitement : MKR-2TL (éditeur du site GigaPrice).
          </p>
          <p style={pStyle}>Contact : contact@gigaprice.fr</p>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>3. Données collectées</h2>
          <p style={pStyle}>
            GigaPrice ne propose pas de création de compte utilisateur ni de paiement sur le site.
          </p>
          <p style={pStyle}>
            Les données susceptibles d&apos;être traitées sont notamment :
          </p>
          <p style={pStyle}>
            - Données techniques de connexion (adresse IP, user-agent, logs serveur), traitées
            principalement par l&apos;hébergeur pour la sécurité, la maintenance et la prévention des
            abus.
          </p>
          <p style={pStyle}>
            - Données fournies lors d&apos;un contact (par email ou via Discord) : identifiants,
            contenu du message, éléments nécessaires au traitement de la demande.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>4. Finalités</h2>
          <p style={pStyle}>
            Les traitements réalisés ont pour finalités principales :
          </p>
          <p style={pStyle}>
            - Fournir et améliorer le service de comparaison de prix (affichage des pages, sécurité,
            performance).
          </p>
          <p style={pStyle}>
            - Répondre aux demandes de support et de contact.
          </p>
          <p style={pStyle}>
            - Prévenir les abus, fraudes et tentatives d&apos;intrusion.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>5. Base légale</h2>
          <p style={pStyle}>
            Les traitements reposent principalement sur l&apos;intérêt légitime (sécurité, prévention
            des abus, fonctionnement du service) et, le cas échéant, sur l&apos;exécution de mesures
            précontractuelles (réponse à une demande) ou le consentement lorsque requis.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>6. Destinataires et sous-traitants</h2>
          <p style={pStyle}>
            Les données peuvent être traitées par :
          </p>
          <p style={pStyle}>
            - L&apos;hébergeur : Hostinger (hébergement et logs techniques).
          </p>
          <p style={pStyle}>
            - Des services tiers utilisés pour le support (Discord), selon leurs propres politiques.
          </p>
          <p style={pStyle}>
            - Les sites partenaires marchands lorsque vous cliquez sur des offres et êtes redirigé
            vers leurs services.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>7. Cookies et liens vers des sites tiers</h2>
          <p style={pStyle}>
            GigaPrice n&apos;implémente pas de cookies publicitaires propres à son domaine. Toutefois,
            en cliquant sur une offre, vous pouvez être redirigé vers un site partenaire qui peut
            déposer ses propres cookies et traceurs.
          </p>
          <p style={pStyle}>
            Certains liens peuvent être des liens d&apos;affiliation (voir{' '}
            <Link href="/mentions-legales" style={linkStyle}>
              Mentions légales
            </Link>
            ). Le suivi de l&apos;affiliation peut reposer sur des technologies gérées par les
            partenaires, sous leur responsabilité.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>8. Durées de conservation</h2>
          <p style={pStyle}>
            Les durées de conservation dépendent de la nature des données et des obligations
            applicables :
          </p>
          <p style={pStyle}>
            - Logs techniques : durée définie par l&apos;hébergeur et/ou nécessaire à la sécurité.
          </p>
          <p style={pStyle}>
            - Données de contact : le temps nécessaire au traitement de la demande, puis archivage
            limité si nécessaire.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>9. Vos droits</h2>
          <p style={pStyle}>
            Conformément au RGPD, vous disposez de droits d&apos;accès, de rectification, d&apos;effacement,
            d&apos;opposition, de limitation et, le cas échéant, de portabilité.
          </p>
          <p style={pStyle}>
            Pour exercer vos droits : contact@gigaprice.fr.
          </p>
        </section>

        <section style={{ marginBottom: 0 }}>
          <h2 style={h2Style}>10. Mise à jour</h2>
          <p style={pStyle}>
            La présente politique peut être mise à jour à tout moment. La version applicable est
            celle publiée sur le site à la date de consultation.
          </p>
          <p style={pStyle}>
            Références :{' '}
            <Link href="/cgv" style={linkStyle}>
              CGU
            </Link>{' '}
            et{' '}
            <Link href="/mentions-legales" style={linkStyle}>
              Mentions légales
            </Link>
            .
          </p>
        </section>
      </div>
    </main>
  );
}

