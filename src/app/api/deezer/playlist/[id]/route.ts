import { NextResponse } from "next/server";
import { fetchPlaylist } from "@/lib/deezer";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });
  }
  try {
    const playlist = await fetchPlaylist(id);
    return NextResponse.json(playlist);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Playlist não encontrada" },
      { status: 404 },
    );
  }
}
