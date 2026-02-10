import { NextResponse } from "next/server";
import {
  deezerSearch,
  type DeezerAlbum,
  type DeezerArtist,
  type DeezerPlaylist,
  type DeezerTrack,
} from "@/lib/deezer";
import { getCached, setCache, cacheKey } from "@/lib/cache";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  if (!q) {
    return NextResponse.json(
      { error: "Parâmetro de busca 'q' é obrigatório." },
      { status: 400 },
    );
  }

  const key = cacheKey("search", { q: q.trim().toLowerCase() });
  const cached = getCached<{ tracks: DeezerTrack[]; artists: DeezerArtist[]; albums: DeezerAlbum[]; playlists: DeezerPlaylist[] }>(key);
  if (cached) {
    return NextResponse.json(cached);
  }

  try {
    const [tracks, artists, albums, playlists] = await Promise.all([
      deezerSearch<DeezerTrack>(q, "track"),
      deezerSearch<DeezerArtist>(q, "artist"),
      deezerSearch<DeezerAlbum>(q, "album"),
      deezerSearch<DeezerPlaylist>(q, "playlist"),
    ]);

    const data = { tracks, artists, albums, playlists };
    setCache(key, data);
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Falha ao comunicar com a Deezer API." },
      { status: 500 },
    );
  }
}

