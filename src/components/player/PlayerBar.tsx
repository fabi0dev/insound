"use client";

import { useRef, useState } from "react";
import {
  SkipBack,
  Play,
  Pause,
  SkipForward,
  Stop,
  Queue,
  SpeakerHigh,
  X,
} from "@phosphor-icons/react";
import { usePlayer } from "./PlayerContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

function formatTime(seconds: number) {
  const s = Math.floor(seconds);
  const m = Math.floor(s / 60);
  const rest = s % 60;
  return `${m}:${rest.toString().padStart(2, "0")}`;
}

export function PlayerBar() {
  const {
    current,
    queue,
    currentIndex,
    isPlaying,
    progress,
    duration,
    volume,
    toggle,
    stop,
    next,
    previous,
    seek,
    setVolume,
    playFromQueue,
    removeFromQueue,
  } = usePlayer();
  const [showQueue, setShowQueue] = useState(false);
  const seekBarRef = useRef<HTMLDivElement>(null);

  if (!current) return null;

  const cover = current.album?.cover_medium ?? current.album?.cover_big;
  const durationSec = duration || 30;
  const percent = durationSec ? Math.min(100, (progress / durationSec) * 100) : 0;

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!seekBarRef.current) return;
    const rect = seekBarRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const time = Math.max(0, Math.min(1, x)) * durationSec;
    seek(time);
  };

  const hasNext = currentIndex >= 0 && currentIndex < queue.length - 1;
  const hasPrev = currentIndex > 0;

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-3 py-2 shadow-2xl backdrop-blur-lg md:inset-x-4 md:bottom-4 md:rounded-2xl md:border">
        <div className="flex flex-col gap-2 md:gap-3">
          <div className="flex items-center gap-2">
            <span className="hidden w-10 shrink-0 text-right text-[11px] text-muted-foreground md:block">
              {formatTime(progress)}
            </span>
            <div
              ref={seekBarRef}
              role="slider"
              tabIndex={0}
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={durationSec}
              className="relative h-1.5 flex-1 cursor-pointer overflow-hidden rounded-full bg-muted"
              onClick={handleSeek}
              onKeyDown={(e) => {
                if (e.key === "ArrowLeft") seek(Math.max(0, progress - 5));
                if (e.key === "ArrowRight") seek(Math.min(durationSec, progress + 5));
              }}
            >
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-primary transition-[width]"
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="w-10 shrink-0 text-[11px] text-muted-foreground">
              {formatTime(durationSec)}
            </span>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              {cover ? (
                <div className="relative size-10 shrink-0 overflow-hidden rounded-md md:size-12">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cover}
                    alt={current.title}
                    className="size-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-[10px] text-muted-foreground md:size-12">
                  30s
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-foreground md:text-sm">
                  {current.title}
                </p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {current.artist?.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 md:gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={previous}
                disabled={!hasPrev}
                className="size-8 md:size-9"
                aria-label="Anterior"
              >
                <SkipBack className="size-5" weight="fill" />
              </Button>
              <Button
                type="button"
                size="icon"
                onClick={toggle}
                className="size-9 md:size-10 rounded-full"
                aria-label={isPlaying ? "Pausar" : "Reproduzir"}
              >
                {isPlaying ? (
                  <Pause className="size-5" weight="fill" />
                ) : (
                  <Play className="size-5" weight="fill" />
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={next}
                disabled={!hasNext}
                className="size-8 md:size-9"
                aria-label="Próxima"
              >
                <SkipForward className="size-5" weight="fill" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={stop}
                className="hidden size-9 md:flex"
                aria-label="Parar"
              >
                <Stop className="size-4" weight="fill" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowQueue((s) => !s)}
                className={cn(
                  "size-8 md:size-9",
                  showQueue && "bg-accent text-primary"
                )}
                aria-label="Fila de reprodução"
                title="Fila"
              >
                <Queue className="size-5" weight="bold" />
              </Button>
              <div className="flex items-center gap-1.5">
                <SpeakerHigh className="size-4 shrink-0 text-muted-foreground" weight="fill" />
                <Slider
                  min={0}
                  max={1}
                  step={0.01}
                  value={[volume]}
                  onValueChange={([v]) => setVolume(v ?? 0)}
                  className="w-16 md:w-20"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Sheet open={showQueue} onOpenChange={setShowQueue}>
        <SheetContent
          side="bottom"
          className="max-h-[70vh] rounded-t-2xl border-t md:bottom-24 md:left-auto md:right-4 md:max-h-[50vh] md:w-96 md:rounded-2xl md:border"
          showCloseButton={false}
        >
          <SheetHeader className="flex-row items-center justify-between border-b border-border pb-3">
            <SheetTitle className="text-sm">Fila de reprodução</SheetTitle>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => setShowQueue(false)}
              aria-label="Fechar"
            >
              <X className="size-5" />
            </Button>
          </SheetHeader>
          <ul className="divide-y divide-border p-2">
            {queue.length === 0 ? (
              <li className="px-3 py-4 text-center text-sm text-muted-foreground">
                Fila vazia
              </li>
            ) : (
              queue.map((track, i) => (
                <li
                  key={`${track.id}-${i}`}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-accent/50"
                >
                  <Button
                    type="button"
                    size="icon"
                    variant={i === currentIndex ? "default" : "secondary"}
                    className="size-8 rounded-full"
                    onClick={() => playFromQueue(i)}
                  >
                    {i === currentIndex && isPlaying ? (
                      <Pause className="size-4" weight="fill" />
                    ) : (
                      <Play className="size-4" weight="fill" />
                    )}
                  </Button>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-foreground">{track.title}</p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {track.artist?.name}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => removeFromQueue(i)}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="Remover da fila"
                  >
                    <X className="size-4" />
                  </Button>
                </li>
              ))
            )}
          </ul>
        </SheetContent>
      </Sheet>
    </>
  );
}
