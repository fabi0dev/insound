"use client";

import Link from "next/link";
import { Play, Plus, Heart } from "@phosphor-icons/react";
import { useFavorites } from "@/contexts/FavoritesContext";
import { usePlayer } from "@/components/player/PlayerContext";
import { cn } from "@/lib/utils";
import type { DeezerTrack } from "@/lib/deezer";

function favoriteTrackToDeezerTrack(t: {
  id: number;
  title: string;
  artistName: string;
  preview: string | null;
  cover?: string;
}): DeezerTrack {
  return {
    id: t.id,
    title: t.title,
    duration: 30,
    preview: t.preview,
    artist: { id: 0, name: t.artistName },
    album: { id: 0, title: t.title, cover_medium: t.cover, cover_big: t.cover, artist: { id: 0, name: t.artistName } },
  };
}

export default function FavoritesPage() {
  const { tracks, albums, artists, toggleTrack, toggleAlbum, toggleArtist } = useFavorites();
  const { play, addToQueue, current } = usePlayer();

  const hasAny = tracks.length > 0 || albums.length > 0 || artists.length > 0;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-50 md:text-3xl">
          Favoritos
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Músicas, álbuns e artistas que você curtiu.
        </p>
      </section>

      {!hasAny && (
        <div className="rounded-2xl border border-white/10 bg-black/40 p-8 text-center">
          <p className="text-zinc-400">Nenhum favorito ainda.</p>
          <p className="mt-2 text-sm text-zinc-500">
            Use o coração nas músicas, álbuns e artistas para adicionar aqui.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-xl bg-violet-500 px-4 py-2 text-sm font-medium text-black hover:bg-violet-400"
          >
            Explorar
          </Link>
        </div>
      )}

      {tracks.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
            Músicas
          </h2>
          <ul className="space-y-1 rounded-xl border border-white/10 bg-black/40 p-2">
            {tracks.map((t) => {
              const track = favoriteTrackToDeezerTrack(t);
              const isCurrent = current?.id === track.id;
              return (
                <li
                  key={t.id}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-zinc-900/70",
                    isCurrent && "bg-primary/10"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => play(track)}
                    disabled={!t.preview}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-violet-400 hover:bg-violet-500 hover:text-black disabled:opacity-50"
                  >
                    <Play weight="fill" className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => addToQueue(track)}
                    disabled={!t.preview}
                    className="shrink-0 rounded p-1 text-zinc-500 hover:text-zinc-50 disabled:opacity-50"
                    title="Adicionar à fila"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const dt = favoriteTrackToDeezerTrack(t);
                      toggleTrack(dt);
                    }}
                    className="shrink-0 rounded p-1 text-red-400 hover:opacity-80"
                    title="Remover dos favoritos"
                  >
                    <Heart className="h-4 w-4" weight="fill" />
                  </button>
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "truncate text-sm text-zinc-50",
                        isCurrent && "text-primary"
                      )}
                    >
                      {t.title}
                    </p>
                    <p className="truncate text-[11px] text-zinc-400">{t.artistName}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {albums.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
            Álbuns
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {albums.map((a) => (
              <div key={a.id} className="group relative">
                <Link
                  href={`/album/${a.id}`}
                  className="block rounded-xl bg-zinc-950/60 p-3 hover:bg-zinc-900"
                >
                  <div className="mb-2 aspect-square w-full overflow-hidden rounded-lg bg-zinc-800">
                    {a.cover ? (
                      <img
                        src={a.cover}
                        alt={a.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-zinc-500">
                        ♫
                      </div>
                    )}
                  </div>
                  <p className="truncate text-sm font-medium text-zinc-50">{a.title}</p>
                  <p className="truncate text-[11px] text-zinc-400">{a.artistName}</p>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    toggleAlbum({
                      id: a.id,
                      title: a.title,
                      cover_medium: a.cover,
                      cover_big: a.cover,
                      artist: { id: 0, name: a.artistName },
                    });
                  }}
                  className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-red-400 hover:bg-black/80"
                  title="Remover dos favoritos"
                >
                  <Heart className="h-4 w-4" weight="fill" />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {artists.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
            Artistas
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {artists.map((a) => (
              <div key={a.id} className="group relative">
                <Link
                  href={`/artist/${a.id}`}
                  className="block rounded-xl bg-zinc-950/60 p-3 hover:bg-zinc-900"
                >
                  <div className="mb-2 aspect-square w-full overflow-hidden rounded-full bg-zinc-800">
                    {a.picture ? (
                      <img
                        src={a.picture}
                        alt={a.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-zinc-500">
                        ♫
                      </div>
                    )}
                  </div>
                  <p className="truncate text-sm font-medium text-zinc-50">{a.name}</p>
                  <p className="text-[11px] text-zinc-400">Artista</p>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    toggleArtist({
                      id: a.id,
                      name: a.name,
                      picture_medium: a.picture,
                      picture_big: a.picture,
                    });
                  }}
                  className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-red-400 hover:bg-black/80"
                  title="Remover dos favoritos"
                >
                  <Heart className="h-4 w-4" weight="fill" />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
