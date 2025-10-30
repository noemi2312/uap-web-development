import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const res = await fetch(`https://www.googleapis.com/books/v1/volumes/${id}`);
  const data = await res.json();

  const book = {
    id: data.id,
    title: data.volumeInfo.title,
    authors: data.volumeInfo.authors || [],
    thumbnail: data.volumeInfo.imageLinks?.thumbnail || '',
    description: data.volumeInfo.description || '',
  };

  return NextResponse.json(book);
}
