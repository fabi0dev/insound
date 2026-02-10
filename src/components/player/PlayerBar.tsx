"use client";

import { useRef, useState, useCallback, useEffect } from "react";
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
import { useImageColors } from "@/hooks/useImageColors";
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

function positionToTime(
  clientX: number,
  rect: DOMRect,
  durationSec: number
): number {
  const x = (clientX - rect.left) / rect.width;
  return Math.max(0, Math.min(durationSec, x * durationSec));
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
  const [isDragging, setIsDragging] = useState(false);
  const seekBarRef = useRef<HTMLDivElement>(null);

  const cover = current?.album?.cover_medium ?? current?.album?.cover_big;
  const colors = useImageColors(cover ?? undefined);

  const durationSec = duration || 30;
  const percent = durationSec
    ? Math.min(100, Math.max(0, (progress / durationSec) * 100))
    : 0;

  const updateSeek = useCallback(
    (clientX: number) => {
      if (!seekBarRef.current) return;
      const rect = seekBarRef.current.getBoundingClientRect();
      seek(positionToTime(clientX, rect, durationSec));
    },
    [seek, durationSec]
  );

  const handleSeekClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isDragging) return;
      updateSeek(e.clientX);
    },
    [isDragging, updateSeek]
  );

  const handlePointerDown = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      setIsDragging(true);
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      updateSeek(clientX);
    },
    [updateSeek]
  );

  useEffect(() => {
    if (!isDragging) return;
    const handleMove = (e: MouseEvent | TouchEvent) => {
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      updateSeek(clientX);
    };
    const handleUp = () => setIsDragging(false);
    window.addEventListener("mousemove", handleMove, { passive: true });
    window.addEventListener("mouseup", handleUp);
    window.addEventListener("touchmove", handleMove, { passive: true });
    window.addEventListener("touchend", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleUp);
    };
  }, [isDragging, updateSeek]);

  if (!current) return null;

  const hasNext = currentIndex >= 0 && currentIndex < queue.length - 1;
  const hasPrev = currentIndex > 0;

  return (
    <>
      <div
        className="animate-in fade-in duration-300 fixed inset-x-0 bottom-0 z-40 overflow-hidden border-t border-white/10 px-3 py-2.5 shadow-[0_-12px_40px_rgba(0,0,0,0.85)] backdrop-blur-xl md:inset-x-6 md:bottom-4 md:rounded-2xl md:border md:px-6 md:py-3"
        style={{
          background: `linear-gradient(135deg, ${colors.primary}18 0%, ${colors.secondary}22 50%, transparent 100%), linear-gradient(180deg, var(--card) 0%, var(--card) 85%), rgba(0,0,0,0.4)`,
          ["--player-accent" as string]: colors.primary,
        }}
      >
        <div className="flex flex-col gap-3 md:gap-4">
          {/* Barra de progresso com thumb arrastável */}
          <div className="flex items-center gap-2">
            <div
              ref={seekBarRef}
              role="slider"
              tabIndex={0}
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={durationSec}
              aria-label="Posição da música"
              className="relative flex-1 cursor-pointer select-none overflow-visible rounded-full py-2"
              onClick={handleSeekClick}
              onMouseDown={handlePointerDown}
              onTouchStart={handlePointerDown}
              onKeyDown={(e) => {
                if (e.key === "ArrowLeft") seek(Math.max(0, progress - 5));
                if (e.key === "ArrowRight") seek(Math.min(durationSec, progress + 5));
              }}
            >
              <div className="relative h-2 w-full rounded-full bg-white/15">
                {/* Faixa preenchida */}
                <div
                  className={cn(
                    "absolute inset-y-0 left-0 rounded-full",
                    isDragging ? "transition-none" : "transition-[width] duration-150 ease-linear"
                  )}
                  style={{
                    width: `${percent}%`,
                    backgroundColor: colors.primary,
                  }}
                />
                {/* Thumb (bolinha) arrastável */}
                <span
                  className={cn(
                    "absolute top-1/2 size-4 -translate-y-1/2 rounded-full border-2 border-white shadow-lg",
                    isDragging ? "scale-125 transition-none" : "transition-[left,transform] duration-150 ease-linear hover:scale-110"
                  )}
                  style={{
                    left: `calc(${percent}% - 8px)`,
                    backgroundColor: colors.primary,
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    handlePointerDown(e);
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation();
                    handlePointerDown(e);
                  }}
                />
              </div>
            </div>
            <span className="w-10 shrink-0 text-right text-[11px] tabular-nums text-white/70">
              {formatTime(durationSec)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4">
            {/* Esquerda: capa + título */}
            <div className="flex min-w-0 flex-1 items-center gap-3">
              {cover ? (
                <div className="relative size-12 shrink-0 overflow-hidden rounded-xl shadow-lg ring-1 ring-white/10 transition-transform duration-300 hover:scale-105 md:size-14">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cover}
                    alt={current.title}
                    className="size-full object-cover"
                  />
                </div>
              ) : (
                <div
                  className="flex size-12 shrink-0 items-center justify-center rounded-xl text-[10px] text-white/60 md:size-14"
                  style={{ background: colors.primary + "40" }}
                >
                  30s
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {current.title}
                </p>
                <p className="truncate text-[11px] text-white/60">
                  {current.artist?.name}
                </p>
              </div>
            </div>

            {/* Centro: controles */}
            <div className="flex shrink-0 items-center gap-1 md:gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={previous}
                disabled={!hasPrev}
                className="size-9 text-white/90 transition-transform duration-200 hover:scale-110 hover:text-white disabled:opacity-40 md:size-10"
                aria-label="Anterior"
              >
                <SkipBack className="size-5" weight="fill" />
              </Button>
              <Button
                type="button"
                size="icon"
                onClick={toggle}
                className="animate-in duration-200 size-11 rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 md:size-12"
                style={{
                  backgroundColor: colors.primary,
                  color: "#0f0f0f",
                }}
                aria-label={isPlaying ? "Pausar" : "Reproduzir"}
              >
                {isPlaying ? (
                  <Pause className="size-5" weight="fill" />
                ) : (
                  <Play className="size-5 ml-0.5" weight="fill" />
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={next}
                disabled={!hasNext}
                className="size-9 text-white/90 transition-transform duration-200 hover:scale-110 hover:text-white disabled:opacity-40 md:size-10"
                aria-label="Próxima"
              >
                <SkipForward className="size-5" weight="fill" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={stop}
                className="hidden size-9 rounded-xl border-white/20 bg-white/5 text-white/80 hover:bg-white/10 md:flex"
                aria-label="Parar"
              >
                <Stop className="size-4" weight="fill" />
              </Button>
            </div>

            {/* Direita: fila + volume */}
            <div className="flex min-w-0 flex-1 justify-end items-center gap-2 md:gap-3">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowQueue((s) => !s)}
                className={cn(
                  "size-9 text-white/80 transition-all duration-200 hover:scale-105 hover:text-white",
                  showQueue && "bg-white/15 text-white"
                )}
                aria-label="Fila de reprodução"
                title="Fila"
              >
                <Queue className="size-5" weight="bold" />
              </Button>
              <div className="flex items-center gap-2">
                <SpeakerHigh className="size-4 shrink-0 text-white/60" weight="fill" />
                <Slider
                  min={0}
                  max={1}
                  step={0.01}
                  value={[volume]}
                  onValueChange={([v]) => setVolume(v ?? 0)}
                  className="w-14 md:w-20 **[data-slot=slider-range]:bg-(--player-accent) **[data-slot=slider-range]:transition-[width] **[data-slot=slider-range]:duration-150"
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
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-accent/50"
                >
                  <Button
                    type="button"
                    size="icon"
                    variant={i === currentIndex ? "default" : "secondary"}
                    className="size-8 rounded-full transition-transform hover:scale-105"
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
                    className="text-muted-foreground hover:text-destructive transition-colors"
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
