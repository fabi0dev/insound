import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { HistoryProvider } from "@/contexts/HistoryContext";
import { PlayerProvider } from "@/components/player/PlayerContext";
import { AppShell } from "@/components/layout/AppShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "InSound",
  description:
    "Descubra músicas, artistas, álbuns e playlists com previews de 30 segundos usando a Deezer API.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark" data-theme="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <FavoritesProvider>
          <HistoryProvider>
            <PlayerProvider>
              <AppShell>{children}</AppShell>
            </PlayerProvider>
          </HistoryProvider>
        </FavoritesProvider>
      </body>
    </html>
  );
}
