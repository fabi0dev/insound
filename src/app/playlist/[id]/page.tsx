"use client";

import { useEffect, useEffectEvent, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Play, ArrowLeft } from "@phosphor-icons/react";
import type { DeezerPlaylist, DeezerTrack } from "@/lib/deezer";
import { usePlayer } from "@/components/player/PlayerContext";
import { TrackRow } from "@/components/tracks/TrackRow";

type PlaylistWithTracks = DeezerPlaylist & {
  tracks?: { data?: DeezerTrack[] };
};

export default function PlaylistPage() {
  const params = useParams();
  const id = params?.id as string;
  const [data, setData] = useState<PlaylistWithTracks | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setQueue } = usePlayer();

  const loadPlaylist = useEffectEvent((playlistId: string) => {
    setLoading(true);
    setError(null);
    fetch(`/api/deezer/playlist/${playlistId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Playlist não encontrada");
        return res.json() as Promise<PlaylistWithTracks>;
      })
      .then(setData)
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "Erro ao carregar playlist"),
      )
      .finally(() => setLoading(false));
  });

  useEffect(() => {
    if (!id) return;
    loadPlaylist(id);
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-zinc-400">Carregando playlist…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center">
        <p className="text-red-200">{error ?? "Playlist não encontrada."}</p>
        <Link
          href="/"
          className="mt-3 inline-flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
      </div>
    );
  }

  const tracks = data.tracks?.data ?? [];
  const cover = data.picture_big ?? data.picture_medium;

  const handlePlayAll = () => {
    const withPreview = tracks.filter((t) => t.preview);
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
        <div className="aspect-square w-full max-w-[240px] shrink-0 overflow-hidden rounded-2xl bg-zinc-800 shadow-2xl">
          {cover ? (
            <img
              src={cover}
              alt={data.title}
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
            Playlist
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-50 md:text-3xl">
            {data.title}
          </h1>
          {data.creator?.name && (
            <p className="mt-1 text-sm text-zinc-400">{data.creator.name}</p>
          )}
          <p className="mt-2 text-sm text-zinc-500">
            {data.nb_tracks ?? tracks.length} músicas
          </p>
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
        <div className="rounded-xl border border-white/5 bg-black/30 py-2">
          {tracks.length === 0 ? (
            <p className="py-8 text-center text-sm text-zinc-500">
              Nenhuma faixa nesta playlist.
            </p>
          ) : (
            <ul className="divide-y divide-white/5">
              {tracks.map((track, i) => (
                <li key={track.id}>
                  <TrackRow
                    track={track}
                    index={i}
                    showIndex
                    queue={tracks}
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
