
import Image from "next/image";

export default function GameKeys() {
  return (
    <>
      <header className="hero-header" style={{ paddingBottom: "50px" }}>
        <h1 className="hero-title">Espace Game Keys</h1>
        <p className="hero-subtitle">Des jeux gratuits, chaque semaine.</p>
      </header>

      {/* Section principale du contenu */}
      <main>
        <section className="contact-section">
          <div className="contact-card" style={{ maxWidth: "800px" }}>
            <div className="discord-support-content">
              {/* Icône et Titre */}
              <div style={{ fontSize: "3rem", marginBottom: "15px" }}>🎁</div>
              <h2 className="discord-title">Giveaways Hebdomadaires</h2>

              <p className="discord-desc" style={{ marginBottom: "30px" }}>
                Notre système de récompenses est actif !<br />
                Nous offrons régulièrement des clés de jeux (Steam, etc.) à notre
                communauté.
              </p>

              {/* Bloc Giveaways */}
              <div
                style={{
                  textAlign: "left",
                  background:
                    "linear-gradient(145deg, rgba(88, 101, 242, 0.1) 0%, rgba(0,0,0,0.3) 100%)",
                  padding: "25px",
                  borderRadius: "15px",
                  border: "1px solid rgba(88, 101, 242, 0.3)",
                  margin: "20px 0",
                }}
              >
                <h3
                  style={{
                    color: "#fff",
                    marginTop: "0",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <span style={{ fontSize: "1.5rem" }}>⚡</span> Comment ça marche ?
                </h3>

                <p className="discord-desc" style={{ marginTop: "15px" }}>
                  Tout se déroule exclusivement sur notre serveur Discord. C&apos;est
                  simple, gratuit et rapide :
                </p>

                <ul
                  style={{
                    listStyle: "none",
                    padding: "0",
                    margin: "15px 0",
                    color: "#ccc",
                  }}
                >
                  <li
                    style={{
                      marginBottom: "10px",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <span style={{ color: "#5865F2" }}>1.</span>{" "}
                    <span>
                      <strong>Rejoignez le Discord</strong> via le bouton
                      ci-dessous.
                    </span>
                  </li>
                  <li
                    style={{
                      marginBottom: "10px",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <span style={{ color: "#5865F2" }}>2.</span>{" "}
                    <span>
                      <strong>Validez votre participation</strong> dans le salon
                      dédié.
                    </span>
                  </li>
                  <li
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <span style={{ color: "#5865F2" }}>3.</span>{" "}
                    <span>
                      <strong>Recevez votre clé</strong> instantanément si vous
                      gagnez !
                    </span>
                  </li>
                </ul>
              </div>

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
                Participer au Giveaway en cours
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
