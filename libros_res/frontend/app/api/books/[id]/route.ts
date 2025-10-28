import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes/${id}`);
    if (!res.ok) {
      return NextResponse.json({ error: 'Libro no encontrado' }, { status: 404 });
    }

    const data = await res.json();
    const book = {
      id: data.id,
      title: data.volumeInfo.title,
      authors: data.volumeInfo.authors,
      description: data.volumeInfo.description,
      categories: data.volumeInfo.categories,
      pageCount: data.volumeInfo.pageCount,
      publishedDate: data.volumeInfo.publishedDate,
      thumbnail: data.volumeInfo.imageLinks?.thumbnail,
    };

    return NextResponse.json(book);
  } catch (err) {
    return NextResponse.json({ error: 'Error al obtener el libro' }, { status: 500 });
  }
}
