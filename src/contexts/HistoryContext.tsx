"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { DeezerTrack } from "@/lib/deezer";

const STORAGE_KEY = "insound-history";
const MAX_ITEMS = 100;

function load(): DeezerTrack[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, MAX_ITEMS) : [];
  } catch {
    return [];
  }
}

function save(items: DeezerTrack[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)));
}

type HistoryContextValue = {
  history: DeezerTrack[];
  addToHistory: (track: DeezerTrack) => void;
  clearHistory: () => void;
};

const HistoryContext = createContext<HistoryContextValue | undefined>(undefined);

export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const [history, setHistory] = useState<DeezerTrack[]>(() => load());

  const addToHistory = useCallback((track: DeezerTrack) => {
    setHistory((prev) => {
      const next = [track, ...prev.filter((t) => t.id !== track.id)].slice(0, MAX_ITEMS);
      save(next);
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    save([]);
  }, []);

  const value = useMemo<HistoryContextValue>(
    () => ({ history, addToHistory, clearHistory }),
    [history, addToHistory, clearHistory],
  );

  return (
    <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>
  );
}

export function useHistory() {
  const ctx = useContext(HistoryContext);
  if (!ctx) throw new Error("useHistory deve ser usado dentro de HistoryProvider");
  return ctx;
}
