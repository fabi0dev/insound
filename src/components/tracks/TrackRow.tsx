"use client";

import { Play, Plus, Heart } from "@phosphor-icons/react";
import type { DeezerTrack } from "@/lib/deezer";
import { usePlayer } from "@/components/player/PlayerContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TrackRowProps = {
  track: DeezerTrack;
  index?: number;
  showIndex?: boolean;
  queue?: DeezerTrack[];
  queueStartIndex?: number;
};

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function TrackRow({
  track,
  index = 0,
  showIndex = true,
  queue,
  queueStartIndex,
}: TrackRowProps) {
  const { play, addToQueue, current, isPlaying: globalPlaying, setQueue } =
    usePlayer();
  const { isFavoriteTrack, toggleTrack } = useFavorites();
  const isCurrent = current?.id === track.id;
  const isPlaying = isCurrent && globalPlaying;
  const cover = track.album?.cover_medium ?? track.album?.cover_big;

  const handlePlay = () => {
    if (queue && queue.length > 0) {
      const start =
        typeof queueStartIndex === "number" ? queueStartIndex : index;
      setQueue(queue, start);
    } else {
      play(track);
    }
  };

  return (
    <div className="group flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors duration-200 hover:bg-accent/50">
      <div className="flex w-8 shrink-0 items-center justify-center">
        {showIndex ? (
          <span className="text-xs text-muted-foreground group-hover:hidden">
            {index + 1}
          </span>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handlePlay}
          disabled={!track.preview}
          className={cn(
            "hidden size-8 rounded-full transition-transform duration-200 disabled:opacity-50 group-hover:flex hover:scale-105",
            isCurrent && isPlaying
              ? "flex bg-primary text-primary-foreground"
              : "bg-primary/20 text-primary hover:bg-primary hover:text-primary-foreground"
          )}
        >
          <Play weight="fill" className="size-4" />
        </Button>
      </div>
      {cover ? (
        <div className="size-10 shrink-0 overflow-hidden rounded-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cover}
            alt=""
            className="size-full object-cover"
          />
        </div>
      ) : (
        <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <Play weight="fill" className="size-4" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "truncate text-sm",
            isCurrent ? "font-medium text-primary" : "text-foreground"
          )}
        >
          {track.title}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {track.artist?.name}
        </p>
      </div>
      <span className="w-10 shrink-0 text-right text-[11px] text-muted-foreground">
        {formatDuration(track.duration)}
      </span>
      <div className="flex shrink-0 items-center gap-0.5 opacity-0 group-hover:opacity-100">
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={() => addToQueue(track)}
          disabled={!track.preview}
          className="text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50"
          title="Adicionar à fila"
        >
          <Plus className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={() => toggleTrack(track)}
          className="text-muted-foreground hover:text-destructive"
          title={
            isFavoriteTrack(track.id)
              ? "Remover dos favoritos"
              : "Favoritar"
          }
        >
          <Heart
            className="size-4"
            weight={isFavoriteTrack(track.id) ? "fill" : "regular"}
          />
        </Button>
      </div>
    </div>
  );
}
