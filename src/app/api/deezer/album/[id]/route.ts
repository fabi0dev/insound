import { NextResponse } from "next/server";
import { fetchAlbum } from "@/lib/deezer";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });
  }
  try {
    const album = await fetchAlbum(id);
    return NextResponse.json(album);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Álbum não encontrado" },
      { status: 404 },
    );
  }
}
