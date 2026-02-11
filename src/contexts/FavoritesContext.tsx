"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { DeezerAlbum, DeezerArtist, DeezerTrack } from "@/lib/deezer";

const STORAGE_KEY = "insound-favorites";

export type FavoriteTrack = {
  id: number;
  title: string;
  artistName: string;
  preview: string | null;
  cover?: string;
};

export type FavoriteAlbum = {
  id: number;
  title: string;
  artistName: string;
  cover?: string;
};

export type FavoriteArtist = {
  id: number;
  name: string;
  picture?: string;
};

type FavoritesData = {
  tracks: FavoriteTrack[];
  albums: FavoriteAlbum[];
  artists: FavoriteArtist[];
};

const defaultData: FavoritesData = { tracks: [], albums: [], artists: [] };

function load(): FavoritesData {
  if (typeof window === "undefined") return defaultData;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData;
    const parsed = JSON.parse(raw) as Partial<FavoritesData>;
    return {
      tracks: Array.isArray(parsed.tracks) ? parsed.tracks : [],
      albums: Array.isArray(parsed.albums) ? parsed.albums : [],
      artists: Array.isArray(parsed.artists) ? parsed.artists : [],
    };
  } catch {
    return defaultData;
  }
}

function save(data: FavoritesData) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function trackToFavorite(t: DeezerTrack): FavoriteTrack {
  return {
    id: t.id,
    title: t.title,
    artistName: t.artist?.name ?? "",
    preview: t.preview ?? null,
    cover: t.album?.cover_medium ?? t.album?.cover_big,
  };
}

function albumToFavorite(a: DeezerAlbum): FavoriteAlbum {
  return {
    id: a.id,
    title: a.title,
    artistName: a.artist?.name ?? "",
    cover: a.cover_medium ?? a.cover_big,
  };
}

function artistToFavorite(a: DeezerArtist): FavoriteArtist {
  return {
    id: a.id,
    name: a.name,
    picture: a.picture_medium ?? a.picture_big,
  };
}

type FavoritesContextValue = FavoritesData & {
  isFavoriteTrack: (id: number) => boolean;
  isFavoriteAlbum: (id: number) => boolean;
  isFavoriteArtist: (id: number) => boolean;
  toggleTrack: (track: DeezerTrack) => void;
  toggleAlbum: (album: DeezerAlbum) => void;
  toggleArtist: (artist: DeezerArtist) => void;
};

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<FavoritesData>(() => load());

  const persist = useCallback((next: FavoritesData) => {
    setData(next);
    save(next);
  }, []);

  const isFavoriteTrack = useCallback((id: number) => data.tracks.some((t) => t.id === id), [data.tracks]);
  const isFavoriteAlbum = useCallback((id: number) => data.albums.some((a) => a.id === id), [data.albums]);
  const isFavoriteArtist = useCallback((id: number) => data.artists.some((a) => a.id === id), [data.artists]);

  const toggleTrack = useCallback(
    (track: DeezerTrack) => {
      const has = data.tracks.some((t) => t.id === track.id);
      persist({
        ...data,
        tracks: has ? data.tracks.filter((t) => t.id !== track.id) : [...data.tracks, trackToFavorite(track)],
      });
    },
    [data, persist],
  );
  const toggleAlbum = useCallback(
    (album: DeezerAlbum) => {
      const has = data.albums.some((a) => a.id === album.id);
      persist({
        ...data,
        albums: has ? data.albums.filter((a) => a.id !== album.id) : [...data.albums, albumToFavorite(album)],
      });
    },
    [data, persist],
  );
  const toggleArtist = useCallback(
    (artist: DeezerArtist) => {
      const has = data.artists.some((a) => a.id === artist.id);
      persist({
        ...data,
        artists: has ? data.artists.filter((a) => a.id !== artist.id) : [...data.artists, artistToFavorite(artist)],
      });
    },
    [data, persist],
  );

  const value = useMemo<FavoritesContextValue>(
    () => ({
      ...data,
      isFavoriteTrack,
      isFavoriteAlbum,
      isFavoriteArtist,
      toggleTrack,
      toggleAlbum,
      toggleArtist,
    }),
    [data, isFavoriteTrack, isFavoriteAlbum, isFavoriteArtist, toggleTrack, toggleAlbum, toggleArtist],
  );

  return (
    <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites deve ser usado dentro de FavoritesProvider");
  return ctx;
}
