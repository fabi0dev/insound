import { NextResponse } from "next/server";
import { fetchArtist, fetchArtistTopTracks } from "@/lib/deezer";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });
  }
  try {
    const [artist, topTracks] = await Promise.all([
      fetchArtist(id),
      fetchArtistTopTracks(id),
    ]);
    return NextResponse.json({ artist, topTracks });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Artista não encontrado" },
      { status: 404 },
    );
  }
}
