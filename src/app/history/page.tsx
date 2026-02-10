"use client";

import { Play, Plus, Trash } from "@phosphor-icons/react";
import { useHistory } from "@/contexts/HistoryContext";
import { usePlayer } from "@/components/player/PlayerContext";

export default function HistoryPage() {
  const { history, clearHistory } = useHistory();
  const { play, addToQueue } = usePlayer();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <section className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-50 md:text-3xl">
            Histórico de reprodução
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Últimas músicas que você ouviu (prévia de 30s).
          </p>
        </div>
        {history.length > 0 && (
          <button
            type="button"
            onClick={clearHistory}
            className="mt-2 inline-flex items-center gap-2 rounded-xl border border-zinc-600 px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-zinc-50 sm:mt-0"
          >
            <Trash className="h-4 w-4" />
            Limpar histórico
          </button>
        )}
      </section>

      {history.length === 0 && (
        <div className="rounded-2xl border border-white/10 bg-black/40 p-8 text-center">
          <p className="text-zinc-400">Nenhuma música no histórico.</p>
          <p className="mt-2 text-sm text-zinc-500">
            Ao tocar músicas na busca ou na home, elas aparecem aqui.
          </p>
        </div>
      )}

      {history.length > 0 && (
        <ul className="space-y-1 rounded-xl border border-white/10 bg-black/40 p-2">
          {history.map((track, index) => (
            <li
              key={`${track.id}-${index}`}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-zinc-900/70"
            >
              <button
                type="button"
                onClick={() => play(track)}
                disabled={!track.preview}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-violet-400 hover:bg-violet-500 hover:text-black disabled:opacity-50"
              >
                <Play weight="fill" className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => addToQueue(track)}
                disabled={!track.preview}
                className="shrink-0 rounded p-1 text-zinc-500 hover:text-zinc-50 disabled:opacity-50"
                title="Adicionar à fila"
              >
                <Plus className="h-4 w-4" />
              </button>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-zinc-50">{track.title}</p>
                <p className="truncate text-[11px] text-zinc-400">
                  {track.artist?.name} · {track.album?.title}
                </p>
              </div>
              <span className="text-[11px] text-zinc-500">
                {Math.floor(track.duration / 60)}:
                {(track.duration % 60).toString().padStart(2, "0")}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
