"use client";

import Link from "next/link";
import { Play } from "@phosphor-icons/react";
import { useHistory } from "@/contexts/HistoryContext";
import { usePlayer } from "@/components/player/PlayerContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MAX_RECENT = 5;

export function RecentPlayed() {
  const { history } = useHistory();
  const { play, current } = usePlayer();
  const recent = history.slice(0, MAX_RECENT);

  return (
    <Card className="animate-fade-up flex flex-col border-border bg-card/30 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-2">
        <h2 className="text-xs font-semibold text-foreground">
          Tocadas recentemente
        </h2>
        <Link
          href="/history"
          className="text-[11px] text-primary hover:text-primary/90"
        >
          Ver tudo
        </Link>
      </CardHeader>
      <CardContent className="space-y-0.5 px-3 pb-3">
        <ul className="space-y-0.5">
          {recent.length === 0 ? (
            <li className="py-3 text-center text-[11px] text-muted-foreground">
              Nenhuma música ainda.
            </li>
          ) : (
            recent.map((track, i) => {
              const cover =
                track.album?.cover_medium ?? track.album?.cover_big;
              const isCurrent = current?.id === track.id;

              return (
                <li
                  key={`${track.id}-${i}`}
                  className={cn(
                    "group flex items-center gap-2 rounded-md px-2 py-1 cursor-pointer transition-colors duration-200 hover:bg-primary/10",
                    isCurrent && "bg-primary/10"
                  )}
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => play(track)}
                    disabled={!track.preview}
                    className={cn(
                      "size-7 shrink-0 rounded-full opacity-0 transition-all duration-200 group-hover:opacity-100 disabled:opacity-50",
                      "group-hover:bg-primary group-hover:text-primary-foreground",
                      isCurrent && "opacity-100 bg-primary text-primary-foreground"
                    )}
                    aria-label="Reproduzir novamente"
                  >
                    <Play weight="fill" className="size-3.5" />
                  </Button>
                  {cover ? (
                    <div className="size-8 shrink-0 overflow-hidden rounded-md">
                      <img
                        src={cover}
                        alt={track.title}
                        className="size-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                      <Play weight="fill" className="size-3" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "truncate text-[11px] font-medium text-foreground group-hover:text-primary",
                        isCurrent && "text-primary"
                      )}
                    >
                      {track.title}
                    </p>
                    <p className="truncate text-[10px] text-muted-foreground">
                      {track.artist && (
                        <Link
                          href={`/artist/${track.artist.id}`}
                          className="hover:text-primary underline-offset-2 hover:underline"
                        >
                          {track.artist.name}
                        </Link>
                      )}
                    </p>
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </CardContent>
    </Card>
  );
}
