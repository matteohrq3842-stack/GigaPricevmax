
import Image from "next/image";

export default function Support() {
  return (
    <>
      <header className="hero-header" style={{ paddingBottom: "50px" }}>
        <h1 className="hero-title">Support Client</h1>
        <p className="hero-subtitle">
          Une question ? Un problème ? Notre équipe est là pour vous aider.
        </p>
      </header>

      {/* Section principale du contenu */}
      <main>
        <section className="contact-section">
          <div className="contact-card">
            <div className="discord-support-content">
              <Image
                src="/images/discord-icon.png"
                alt="Logo Discord"
                width={80}
                height={80}
                className="discord-icon-large"
              />
              <h2 className="discord-title">Rejoignez notre Communauté</h2>
              <p className="discord-desc">
                Pour garantir une réponse rapide et un suivi efficace, notre support
                se déroule exclusivement sur notre serveur Discord. Ouvrez un
                ticket, discutez avec la communauté et obtenez de l&apos;aide en temps
                réel.
              </p>

              <a
                href="https://discord.gg/ZJryMtkDPP"
                target="_blank"
                className="discord-btn-large"
              >
                <Image
                  src="/images/discord-icon.png"
                  alt=""
                  width={30}
                  height={30}
                  style={{ filter: "brightness(100)" }}
                />
                Rejoindre le Serveur
              </a>

              <div className="discord-features">
                <div className="feature-item">
                  <div className="feature-icon">⚡</div>
                  <span className="feature-text">Réponse Rapide</span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">🎫</div>
                  <span className="feature-text">Système de Tickets</span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">💬</div>
                  <span className="feature-text">Communauté Active</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
