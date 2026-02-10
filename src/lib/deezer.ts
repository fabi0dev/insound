const DEEZER_API_BASE = "https://api.deezer.com";

export type DeezerArtist = {
  id: number;
  name: string;
  picture_medium?: string;
  picture_big?: string;
};

export type DeezerAlbum = {
  id: number;
  title: string;
  cover_medium?: string;
  cover_big?: string;
  artist: DeezerArtist;
};

export type DeezerTrack = {
  id: number;
  title: string;
  duration: number;
  preview: string | null;
  artist: DeezerArtist;
  album: DeezerAlbum;
};

export type DeezerPlaylist = {
  id: number;
  title: string;
  picture_medium?: string;
  picture_big?: string;
  nb_tracks?: number;
  creator?: {
    id: number;
    name: string;
  };
};

type SearchType = "track" | "artist" | "album" | "playlist";

export async function deezerSearch<T>(
  q: string,
  type: SearchType,
): Promise<T[]> {
  const url = new URL(`${DEEZER_API_BASE}/search/${type}`);
  url.searchParams.set("q", q);

  const res = await fetch(url.toString());

  if (!res.ok) {
    throw new Error(`Erro ao buscar na Deezer API: ${res.statusText}`);
  }

  const json = (await res.json()) as { data?: T[] };
  return json.data ?? [];
}

export async function fetchArtist(id: string | number) {
  const res = await fetch(`${DEEZER_API_BASE}/artist/${id}`);
  if (!res.ok) {
    throw new Error("Artista não encontrado");
  }
  return (await res.json()) as DeezerArtist & {
    nb_fan?: number;
    nb_album?: number;
  };
}

export async function fetchArtistTopTracks(id: string | number) {
  const res = await fetch(`${DEEZER_API_BASE}/artist/${id}/top?limit=30`);
  if (!res.ok) {
    throw new Error("Top músicas não encontrado");
  }
  const json = (await res.json()) as { data?: DeezerTrack[] };
  return json.data ?? [];
}

export async function fetchAlbum(id: string | number) {
  const res = await fetch(`${DEEZER_API_BASE}/album/${id}`);
  if (!res.ok) {
    throw new Error("Álbum não encontrado");
  }
  return (await res.json()) as DeezerAlbum & {
    tracks?: { data?: DeezerTrack[] };
  };
}

export async function fetchPlaylist(id: string | number) {
  const res = await fetch(`${DEEZER_API_BASE}/playlist/${id}`);
  if (!res.ok) {
    throw new Error("Playlist não encontrada");
  }
  return (await res.json()) as DeezerPlaylist & {
    tracks?: { data?: DeezerTrack[] };
  };
}

export async function fetchChart() {
  const res = await fetch(`${DEEZER_API_BASE}/chart`);
  if (!res.ok) {
    throw new Error("Não foi possível carregar o chart da Deezer");
  }
  return (await res.json()) as {
    tracks?: { data?: DeezerTrack[] };
    albums?: { data?: DeezerAlbum[] };
    artists?: { data?: DeezerArtist[] };
    playlists?: { data?: DeezerPlaylist[] };
  };
}


