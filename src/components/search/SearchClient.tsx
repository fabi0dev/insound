"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MagnifyingGlass, Play, Plus, Heart } from "@phosphor-icons/react";
import type {
  DeezerAlbum,
  DeezerArtist,
  DeezerPlaylist,
  DeezerTrack,
} from "@/lib/deezer";
import { usePlayer } from "@/components/player/PlayerContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const HYPE_TAGS = ["Energize", "Relaxar", "Treino", "Foco"] as const;

type TabKey = "tracks" | "artists" | "albums" | "playlists";

type SearchResponse = {
  tracks: DeezerTrack[];
  artists: DeezerArtist[];
  albums: DeezerAlbum[];
  playlists: DeezerPlaylist[];
};

export function SearchClient() {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<TabKey>("tracks");
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasUserSearched, setHasUserSearched] = useState(false);
  const { play, addToQueue, setQueue } = usePlayer();
  const {
    isFavoriteTrack,
    isFavoriteAlbum,
    isFavoriteArtist,
    toggleTrack,
    toggleAlbum,
    toggleArtist,
  } = useFavorites();

  async function performSearch(q: string) {
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/deezer/search?q=${encodeURIComponent(q)}`);
      if (!res.ok) {
        throw new Error("Erro ao buscar na Deezer");
      }
      const json = (await res.json()) as SearchResponse;
      setResults(json);
      setHasUserSearched(true);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Não foi possível realizar a busca."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadHype() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/deezer/hype");
      if (!res.ok) {
        throw new Error("Erro ao carregar conteúdos em alta");
      }
      const json = (await res.json()) as SearchResponse;
      setResults(json);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Não foi possível carregar destaques."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!hasUserSearched && !results) {
      void loadHype();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasUserSearched]);

  const hasResults =
    !!results && Object.values(results).some((list) => list.length > 0);

  const popularTracks = results?.tracks.slice(0, 4) ?? [];
  const releasesAlbums = results?.albums.slice(0, 4) ?? [];
  const recommendationsPlaylists = results?.playlists.slice(0, 4) ?? [];

  return (
    <div className="space-y-4">
      <form
        className="flex gap-2 transition-opacity duration-200"
        onSubmit={(e) => {
          e.preventDefault();
          void performSearch(query);
        }}
      >
        <div className="relative flex-1">
          <MagnifyingGlass
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            weight="bold"
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Artistas, músicas ou álbuns"
            className="h-9 pl-10"
          />
        </div>
        <Button type="submit" size="sm" className="gap-1.5 shrink-0">
          <MagnifyingGlass className="size-4" weight="bold" />
          Buscar
        </Button>
      </form>

      <div className="flex flex-wrap gap-1.5">
        {HYPE_TAGS.map((tag) => (
          <Button
            key={tag}
            type="button"
            variant="outline"
            size="sm"
            className="h-7 rounded-full px-3 text-xs"
            onClick={() => {
              setQuery(tag);
              void performSearch(tag);
            }}
          >
            {tag}
          </Button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)}>
          <TabsList className="h-8 rounded-full border border-border bg-card/40 p-0.5 text-xs">
            <TabsTrigger value="tracks" className="rounded-full px-3 py-1.5">
              Músicas
            </TabsTrigger>
            <TabsTrigger value="artists" className="rounded-full px-3 py-1.5">
              Artistas
            </TabsTrigger>
            <TabsTrigger value="albums" className="rounded-full px-3 py-1.5">
              Álbuns
            </TabsTrigger>
            <TabsTrigger value="playlists" className="rounded-full px-3 py-1.5">
              Playlists
            </TabsTrigger>
          </TabsList>
        </Tabs>
        {loading && (
          <span className="text-xs text-muted-foreground">Buscando…</span>
        )}
      </div>

      {error && (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error}
        </p>
      )}

      {!loading && !error && !hasResults && (
        <p className="text-sm text-muted-foreground">
          Digite algo e clique em Buscar.
        </p>
      )}

      {results && hasResults && (
        <div className="animate-fade-up space-y-6">
          {popularTracks.length > 0 && (
            <section className="space-y-1.5">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Populares
              </h2>
              <div className="rounded-lg border border-border bg-card/40 p-1.5">
                <div className="grid gap-0.5 sm:grid-cols-2">
                    {popularTracks.map((track) => (
                      <div
                        key={track.id}
                        className="group flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors duration-200 hover:bg-accent/50"
                      >
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8 rounded-full bg-primary/20 text-primary hover:bg-primary hover:text-primary-foreground"
                          onClick={() => play(track)}
                        >
                          <Play weight="fill" className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          onClick={(e) => {
                            e.preventDefault();
                            addToQueue(track);
                          }}
                          title="Adicionar à fila"
                        >
                          <Plus className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          onClick={(e) => {
                            e.preventDefault();
                            toggleTrack(track);
                          }}
                          title={
                            isFavoriteTrack(track.id)
                              ? "Remover dos favoritos"
                              : "Favoritar"
                          }
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Heart
                            className="size-4"
                            weight={isFavoriteTrack(track.id) ? "fill" : "regular"}
                          />
                        </Button>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm text-foreground">
                            {track.title}
                          </p>
                          <p className="truncate text-[11px] text-muted-foreground">
                            {track.artist.name}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </section>
          )}

          {releasesAlbums.length > 0 && (
            <section className="space-y-1.5">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Lançamentos
              </h2>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {releasesAlbums.map((album) => (
                  <div
                    key={album.id}
                    className="group relative flex shrink-0 flex-col"
                  >
                    <Link
                      href={`/album/${album.id}`}
                      className="rounded-xl bg-card/60 p-2 hover:bg-accent/30"
                    >
                      <div className="mb-2 aspect-square w-36 overflow-hidden rounded-lg bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={album.cover_medium ?? album.cover_big ?? ""}
                          alt={album.title}
                          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <p className="truncate text-xs font-medium text-foreground">
                        {album.title}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {album.artist.name}
                      </p>
                    </Link>
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon-xs"
                      className="absolute right-2 top-2 rounded-full bg-black/60 hover:bg-black/80 hover:text-destructive"
                      onClick={(e) => {
                        e.preventDefault();
                        toggleAlbum(album);
                      }}
                      title={
                        isFavoriteAlbum(album.id)
                          ? "Remover dos favoritos"
                          : "Favoritar álbum"
                      }
                    >
                      <Heart
                        className="size-4"
                        weight={isFavoriteAlbum(album.id) ? "fill" : "regular"}
                      />
                    </Button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {recommendationsPlaylists.length > 0 && (
            <section className="space-y-1.5">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Recomendações
              </h2>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {recommendationsPlaylists.map((playlist) => (
                  <Link
                    key={playlist.id}
                    href={`/playlist/${playlist.id}`}
                    className="flex w-40 shrink-0 flex-col rounded-xl bg-card/60 p-2 hover:bg-accent/30"
                  >
                    <div className="mb-2 aspect-square w-full overflow-hidden rounded-lg bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={
                          playlist.picture_medium ?? playlist.picture_big ?? ""
                        }
                        alt={playlist.title}
                        className="size-full object-cover"
                      />
                    </div>
                    <p className="truncate text-xs font-medium text-foreground">
                      {playlist.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {playlist.nb_tracks
                        ? `${playlist.nb_tracks} faixas`
                        : "Playlist"}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <Card className="border-border bg-card/40 p-3 md:p-4">
            <CardContent className="p-0">
              {tab === "tracks" && (
                <div className="space-y-1">
                  {results.tracks.map((track, i) => (
                    <div
                      key={track.id}
                      className="group flex w-full items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-accent/50"
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
                        onClick={() =>
                          setQueue(
                            results.tracks.filter((t) => t.preview),
                            i
                          )
                        }
                      >
                        <Play weight="fill" className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => addToQueue(track)}
                        title="Adicionar à fila"
                      >
                        <Plus className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => toggleTrack(track)}
                        title={
                          isFavoriteTrack(track.id)
                            ? "Remover dos favoritos"
                            : "Favoritar"
                        }
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Heart
                          className="size-4"
                          weight={
                            isFavoriteTrack(track.id) ? "fill" : "regular"
                          }
                        />
                      </Button>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-foreground">
                          {track.title}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {track.artist.name} · {track.album.title}
                        </p>
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        {Math.round(track.duration / 60)}:
                        {(track.duration % 60).toString().padStart(2, "0")}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {tab === "artists" && (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {results.artists.map((artist) => (
                    <div key={artist.id} className="group relative">
                      <Link
                        href={`/artist/${artist.id}`}
                        className="block rounded-xl bg-card/60 p-3 hover:bg-accent/30"
                      >
                        <div className="mb-3 aspect-square w-full overflow-hidden rounded-full bg-muted">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={
                              artist.picture_medium ??
                              artist.picture_big ??
                              "/avatar"
                            }
                            alt={artist.name}
                            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                        <p className="truncate text-sm font-medium text-foreground">
                          {artist.name}
                        </p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          Artista
                        </p>
                      </Link>
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon-xs"
                        className="absolute right-2 top-2 rounded-full bg-black/60 hover:bg-black/80 hover:text-destructive"
                        onClick={(e) => {
                          e.preventDefault();
                          toggleArtist(artist);
                        }}
                        title={
                          isFavoriteArtist(artist.id)
                            ? "Remover dos favoritos"
                            : "Favoritar artista"
                        }
                      >
                        <Heart
                          className="size-4"
                          weight={
                            isFavoriteArtist(artist.id) ? "fill" : "regular"
                          }
                        />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {tab === "albums" && (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {results.albums.map((album) => (
                    <div key={album.id} className="group relative">
                      <Link
                        href={`/album/${album.id}`}
                        className="block rounded-xl bg-card/60 p-3 hover:bg-accent/30"
                      >
                        <div className="mb-3 aspect-square w-full overflow-hidden rounded-lg bg-muted">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={
                              album.cover_medium ?? album.cover_big ?? "/album"
                            }
                            alt={album.title}
                            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                        <p className="truncate text-sm font-medium text-foreground">
                          {album.title}
                        </p>
                        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                          {album.artist.name}
                        </p>
                      </Link>
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon-xs"
                        className="absolute right-2 top-2 rounded-full bg-black/60 hover:bg-black/80 hover:text-destructive"
                        onClick={(e) => {
                          e.preventDefault();
                          toggleAlbum(album);
                        }}
                        title={
                          isFavoriteAlbum(album.id)
                            ? "Remover dos favoritos"
                            : "Favoritar álbum"
                        }
                      >
                        <Heart
                          className="size-4"
                          weight={
                            isFavoriteAlbum(album.id) ? "fill" : "regular"
                          }
                        />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {tab === "playlists" && (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {results.playlists.map((playlist) => (
                    <Link
                      key={playlist.id}
                      href={`/playlist/${playlist.id}`}
                      className="group rounded-xl bg-card/60 p-3 hover:bg-accent/30"
                    >
                      <div className="mb-3 aspect-square w-full overflow-hidden rounded-lg bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={
                            playlist.picture_medium ??
                            playlist.picture_big ??
                            "/playlist"
                          }
                          alt={playlist.title}
                          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <p className="truncate text-sm font-medium text-foreground">
                        {playlist.title}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                        {playlist.nb_tracks
                          ? `${playlist.nb_tracks} músicas`
                          : "Playlist"}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
