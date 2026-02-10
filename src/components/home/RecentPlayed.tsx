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
  const { play } = usePlayer();
  const recent = history.slice(0, MAX_RECENT);

  return (
    <Card className="flex flex-col border-border bg-card/30 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-2">
        <h2 className="text-xs font-semibold text-foreground">
          Tocadas recentemente
        </h2>
        <Link
          href="/historico"
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
            recent.map((track, i) => (
              <li
                key={`${track.id}-${i}`}
                className="group flex items-center gap-2 rounded-md px-2 py-1 hover:bg-accent/50"
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => play(track)}
                  disabled={!track.preview}
                  className={cn(
                    "size-7 shrink-0 rounded-full opacity-0 transition group-hover:opacity-100 disabled:opacity-50",
                    "group-hover:bg-primary group-hover:text-primary-foreground"
                  )}
                >
                  <Play weight="fill" className="size-3.5" />
                </Button>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-medium text-foreground">
                    {track.title}
                  </p>
                  <p className="truncate text-[10px] text-muted-foreground">
                    {track.artist?.name}
                  </p>
                </div>
              </li>
            ))
          )}
        </ul>
        <div className="mt-3 flex items-center justify-between gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-2.5 py-2 text-[11px]">
          <span className="text-muted-foreground">Ouvir offline</span>
          <Button variant="ghost" size="sm" className="h-6 text-xs" disabled>
            Em breve
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
