import { NextResponse } from "next/server";
import {
  fetchChart,
  type DeezerAlbum,
  type DeezerArtist,
  type DeezerPlaylist,
  type DeezerTrack,
} from "@/lib/deezer";
import { getCached, setCache } from "@/lib/cache";

const HYPE_CACHE_KEY = "hype:chart";

export async function GET() {
  const cached = getCached<{ tracks: DeezerTrack[]; albums: DeezerAlbum[]; artists: DeezerArtist[]; playlists: DeezerPlaylist[] }>(HYPE_CACHE_KEY);
  if (cached) {
    return NextResponse.json(cached);
  }

  try {
    const chart = await fetchChart();

    const tracks = (chart.tracks?.data ?? []) as DeezerTrack[];
    const albums = (chart.albums?.data ?? []) as DeezerAlbum[];
    const artists = (chart.artists?.data ?? []) as DeezerArtist[];
    const playlists = (chart.playlists?.data ?? []) as DeezerPlaylist[];

    const data = { tracks, albums, artists, playlists };
    setCache(HYPE_CACHE_KEY, data);
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Falha ao carregar conteúdos em alta." },
      { status: 500 },
    );
  }
}

