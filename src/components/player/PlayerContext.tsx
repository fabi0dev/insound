"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { DeezerTrack } from "@/lib/deezer";
import { useHistory } from "@/contexts/HistoryContext";

const VOLUME_KEY = "insound-volume";

type PlayerState = {
  current: DeezerTrack | undefined;
  queue: DeezerTrack[];
  currentIndex: number;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
};

type PlayerContextValue = PlayerState & {
  play: (track: DeezerTrack, replaceQueue?: boolean) => void;
  playFromQueue: (index: number) => void;
  addToQueue: (track: DeezerTrack) => void;
  removeFromQueue: (index: number) => void;
  setQueue: (tracks: DeezerTrack[], startIndex?: number) => void;
  toggle: () => void;
  stop: () => void;
  next: () => void;
  previous: () => void;
  seek: (seconds: number) => void;
  setVolume: (value: number) => void;
};

const PlayerContext = createContext<PlayerContextValue | undefined>(undefined);

function loadVolume(): number {
  if (typeof window === "undefined") return 1;
  try {
    const v = localStorage.getItem(VOLUME_KEY);
    if (v != null) {
      const n = Number(v);
      if (n >= 0 && n <= 1) return n;
    }
  } catch {
    // ignore
  }
  return 1;
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const { addToHistory } = useHistory();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playTrackRef = useRef<((track: DeezerTrack) => void) | null>(null);
  const [volume, setVolumeState] = useState(() => loadVolume());
  const [state, setState] = useState<PlayerState>({
    current: undefined,
    queue: [],
    currentIndex: -1,
    isPlaying: false,
    progress: 0,
    duration: 30,
    volume: 1,
  });

  const setVolume = useCallback((value: number) => {
    const v = Math.max(0, Math.min(1, value));
    setVolumeState(v);
    setState((prev) => ({ ...prev, volume: v }));
    if (typeof window !== "undefined") localStorage.setItem(VOLUME_KEY, String(v));
    const audio = audioRef.current;
    if (audio) audio.volume = v;
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.volume = volume;
  }, [volume]);

  const playTrack = useCallback(
    (track: DeezerTrack) => {
      if (!track.preview) return;

      if (!audioRef.current) {
        audioRef.current = new Audio();
      }

      const audio = audioRef.current;
      audio.src = track.preview;
      audio.currentTime = 0;
      audio.volume = volume;
      void audio.play();

      try {
        if (typeof document !== "undefined") {
          const artistName = track.artist?.name ?? "Insound";
          document.title = `${track.title} – ${artistName}`;
        }

        if (typeof navigator !== "undefined" && "mediaSession" in navigator) {
          const mediaSession = (navigator as unknown as { mediaSession?: MediaSession }).mediaSession;
          const artworkUrl =
            track.album?.cover_big ?? track.album?.cover_medium ?? undefined;

          if (mediaSession) {
            mediaSession.metadata = new MediaMetadata({
              title: track.title,
              artist: track.artist?.name ?? "",
              album: track.album?.title ?? "",
              artwork: artworkUrl
                ? [
                    { src: artworkUrl, sizes: "256x256", type: "image/jpeg" },
                    { src: artworkUrl, sizes: "512x512", type: "image/jpeg" },
                  ]
                : [],
            });
          }
        }
      } catch {
        // ignore
      }

      audio.onended = () => {
        setState((prev) => {
          const nextIndex = prev.currentIndex + 1;
          const nextQueue = prev.queue;
          if (nextIndex < nextQueue.length) {
            const nextTrack = nextQueue[nextIndex];
            if (nextTrack?.preview) {
              setTimeout(() => {
                if (playTrackRef.current) {
                  playTrackRef.current(nextTrack);
                }
              }, 0);
              return {
                ...prev,
                current: nextTrack,
                currentIndex: nextIndex,
                isPlaying: true,
                progress: 0,
                duration: 30,
              };
            }
          }
          return { ...prev, isPlaying: false, progress: 0 };
        });
      };

      audio.ontimeupdate = () => {
        setState((prev) => ({
          ...prev,
          progress: audio.currentTime,
          duration: audio.duration || 30,
        }));
      };

      addToHistory(track);
      setState((prev) => ({
        ...prev,
        current: track,
        isPlaying: true,
        progress: 0,
        duration: 30,
      }));
    },
    [volume, addToHistory],
  );

  useEffect(() => {
    playTrackRef.current = playTrack;
  }, [playTrack]);

  const play = useCallback(
    (track: DeezerTrack, replaceQueue = true) => {
      if (replaceQueue) {
        setState((prev) => ({ ...prev, queue: [track], currentIndex: 0 }));
        playTrack(track);
      } else {
        setState((prev) => ({ ...prev, queue: [...prev.queue, track] }));
      }
    },
    [playTrack],
  );

  const playFromQueue = useCallback(
    (index: number) => {
      const track = state.queue[index];
      if (track?.preview) {
        setState((prev) => ({ ...prev, currentIndex: index }));
        playTrack(track);
      }
    },
    [state.queue, playTrack],
  );

  const addToQueue = useCallback((track: DeezerTrack) => {
    setState((prev) => ({ ...prev, queue: [...prev.queue, track] }));
  }, []);

  const removeFromQueue = useCallback((index: number) => {
    setState((prev) => {
      const nextQueue = prev.queue.filter((_, i) => i !== index);
      let nextIndex = prev.currentIndex;
      if (index < prev.currentIndex) nextIndex -= 1;
      else if (index === prev.currentIndex && nextQueue.length > 0) {
        const newCurrent = nextQueue[Math.min(nextIndex, nextQueue.length - 1)];
        if (newCurrent?.preview) setTimeout(() => playTrack(newCurrent), 0);
        nextIndex = Math.min(nextIndex, nextQueue.length - 1);
      }
      return { ...prev, queue: nextQueue, currentIndex: Math.max(-1, nextIndex) };
    });
  }, [playTrack]);

  const setQueue = useCallback((tracks: DeezerTrack[], startIndex = 0) => {
    const track = tracks[startIndex];
    setState((prev) => ({
      ...prev,
      queue: tracks,
      currentIndex: startIndex,
      current: track,
    }));
    if (track?.preview) playTrack(track);
  }, [playTrack]);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      void audio.play();
      setState((prev) => ({ ...prev, isPlaying: true }));
    } else {
      audio.pause();
      setState((prev) => ({ ...prev, isPlaying: false }));
    }
  }, []);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    setState((prev) => ({ ...prev, isPlaying: false, progress: 0 }));
  }, []);

  const next = useCallback(() => {
    const idx = state.currentIndex + 1;
    if (idx < state.queue.length) {
      const track = state.queue[idx];
      if (track?.preview) {
        setState((prev) => ({ ...prev, currentIndex: idx }));
        playTrack(track);
      }
    }
  }, [state.currentIndex, state.queue, playTrack]);

  const previous = useCallback(() => {
    const audio = audioRef.current;
    if (audio && state.progress > 2) {
      audio.currentTime = 0;
      setState((prev) => ({ ...prev, progress: 0 }));
      return;
    }
    const idx = state.currentIndex - 1;
    if (idx >= 0) {
      const track = state.queue[idx];
      if (track?.preview) {
        setState((prev) => ({ ...prev, currentIndex: idx }));
        playTrack(track);
      }
    }
  }, [state.currentIndex, state.queue, state.progress, playTrack]);

  const seek = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(seconds, audio.duration || 30));
    setState((prev) => ({ ...prev, progress: audio.currentTime }));
  }, []);

  // Integração com Media Session API para usar controles do SO / navegador
  const nextRef = useRef(next);
  const previousRef = useRef(previous);
  const toggleRef = useRef(toggle);

  useEffect(() => {
    nextRef.current = next;
  }, [next]);

  useEffect(() => {
    previousRef.current = previous;
  }, [previous]);

  useEffect(() => {
    toggleRef.current = toggle;
  }, [toggle]);

  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mediaSession = (navigator as any).mediaSession as MediaSession;

    mediaSession.setActionHandler("nexttrack", () => {
      nextRef.current();
    });
    mediaSession.setActionHandler("previoustrack", () => {
      previousRef.current();
    });
    mediaSession.setActionHandler("play", () => {
      toggleRef.current();
    });
    mediaSession.setActionHandler("pause", () => {
      toggleRef.current();
    });
    mediaSession.setActionHandler("stop", () => {
      stop();
    });
  }, [stop]);

  const value = useMemo<PlayerContextValue>(
    () => ({
      ...state,
      volume: volume,
      play,
      playFromQueue,
      addToQueue,
      removeFromQueue,
      setQueue,
      toggle,
      stop,
      next,
      previous,
      seek,
      setVolume,
    }),
    [
      state,
      volume,
      play,
      playFromQueue,
      addToQueue,
      removeFromQueue,
      setQueue,
      toggle,
      stop,
      next,
      previous,
      seek,
      setVolume,
    ],
  );

  return (
    <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) {
    throw new Error("usePlayer deve ser usado dentro de PlayerProvider");
  }
  return ctx;
}
