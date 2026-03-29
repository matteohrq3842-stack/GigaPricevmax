import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ReactNode } from 'react';
import "../globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BackgroundAnimation from "@/components/layout/BackgroundAnimation";
import CookieConsentModal from "@/components/modals/CookieConsentModal";
import SessionProvider from "@/components/providers/SessionProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GigaPrice",
  description: "Comparateur de prix de jeux vidéo. Comparez et achetez vos jeux PC et Consoles au meilleur prix.",
  icons: {
    icon: [
      { url: "/logo.png", sizes: "48x48", type: "image/png" },
      { url: "/logo.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [{ url: "/logo.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://cdn.cloudflare.steamstatic.com" crossOrigin="anonymous" />
      </head>
      <body id="top" className={inter.className}>
        <SessionProvider>
          <BackgroundAnimation />
          <Navbar />
          {children}
          <Footer />
          <CookieConsentModal />
        </SessionProvider>
      </body>
    </html>
  );
}
