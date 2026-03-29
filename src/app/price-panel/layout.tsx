import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import SessionProvider from "@/components/providers/SessionProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GigaPrice - Admin Panel",
  description: "Panneau d'administration GigaPrice",
  icons: {
    icon: '/logo.png',
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function PricePanelLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        {/* Pas de Navbar, pas de Footer, pas de BackgroundAnimation globale */}
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
