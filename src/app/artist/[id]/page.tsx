"use client";

import { useEffect, useEffectEvent, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Play, ArrowLeft } from "@phosphor-icons/react";
import type { DeezerArtist, DeezerTrack } from "@/lib/deezer";
import { usePlayer } from "@/components/player/PlayerContext";
import { TrackRow } from "@/components/tracks/TrackRow";

type ArtistPageData = {
  artist: DeezerArtist & { nb_fan?: number };
  topTracks: DeezerTrack[];
};

export default function ArtistPage() {
  const params = useParams();
  const id = params?.id as string;
  const [data, setData] = useState<ArtistPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setQueue } = usePlayer();

  const loadArtist = useEffectEvent((artistId: string) => {
    setLoading(true);
    setError(null);
    fetch(`/api/deezer/artist/${artistId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Artista não encontrado");
        return res.json() as Promise<ArtistPageData>;
      })
      .then(setData)
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "Erro ao carregar artista"),
      )
      .finally(() => setLoading(false));
  });

  useEffect(() => {
    if (!id) return;
    loadArtist(id);
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-zinc-400">Carregando artista…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center">
        <p className="text-red-200">{error ?? "Artista não encontrado."}</p>
        <Link
          href="/"
          className="mt-3 inline-flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
      </div>
    );
  }

  const { artist, topTracks } = data;
  const cover = artist.picture_big ?? artist.picture_medium;

  const handlePlayAll = () => {
    const withPreview = topTracks.filter((t) => t.preview);
    if (withPreview.length > 0) {
      setQueue(withPreview, 0);
    }
  };

  return (
    <div className="animate-fade-up mx-auto max-w-4xl space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-50"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>

      <div className="flex flex-col gap-4 md:flex-row md:items-end">
        <div className="aspect-square w-full max-w-[240px] shrink-0 overflow-hidden rounded-full bg-zinc-800 shadow-2xl">
          {cover ? (
            <img
              src={cover}
              alt={artist.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-4xl text-zinc-600">
              ♫
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Artista
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-50 md:text-3xl">
            {artist.name}
          </h1>
          {artist.nb_fan != null && (
            <p className="mt-2 text-sm text-zinc-500">
              {new Intl.NumberFormat("pt-BR").format(artist.nb_fan)} ouvintes
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handlePlayAll}
              className="inline-flex items-center gap-2 rounded-full bg-violet-500 px-5 py-2.5 text-sm font-medium text-black shadow-lg shadow-violet-500/30 hover:bg-violet-400"
            >
              <Play weight="fill" className="h-5 w-5" />
              Reproduzir
            </button>
          </div>
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-400">
          Populares
        </h2>
        <div className="rounded-xl border border-white/5 bg-black/30 py-2">
          {topTracks.length === 0 ? (
            <p className="py-8 text-center text-sm text-zinc-500">
              Nenhuma faixa encontrada.
            </p>
          ) : (
            <ul className="divide-y divide-white/5">
              {topTracks.map((track, i) => (
                <li key={track.id}>
                  <TrackRow
                    track={track}
                    index={i}
                    showIndex
                    queue={topTracks}
                    queueStartIndex={i}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
