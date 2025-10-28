interface BookDetail {
  id: string;
  title: string;
  authors?: string[];
  description?: string;
  categories?: string[];
  pageCount?: number;
  publishedDate?: string;
  thumbnail?: string;
}

async function fetchBook(id: string): Promise<BookDetail | null> {
  try {
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes/${id}`);
    if (!res.ok) return null;

    const data = await res.json();
    const volumeInfo = data.volumeInfo;

    return {
      id: data.id,
      title: volumeInfo.title,
      authors: volumeInfo.authors,
      description: volumeInfo.description,
      categories: volumeInfo.categories,
      pageCount: volumeInfo.pageCount,
      publishedDate: volumeInfo.publishedDate,
      thumbnail: volumeInfo.imageLinks?.thumbnail,
    };
  } catch {
    return null;
  }
}

export default async function BookPage({ params }: { params: { id: string } }) {
  const book = await fetchBook(params.id);

  if (!book) return <p className="p-8 text-red-500">Libro no encontrado</p>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">{book.title}</h1>
      {book.thumbnail && (
        <img
          src={book.thumbnail}
          alt={book.title}
          className="w-64 rounded-lg mb-4"
        />
      )}
      {book.authors && <p className="text-lg mb-2">Autor(es): {book.authors.join(', ')}</p>}
      {book.publishedDate && <p className="mb-2">📅 Publicado en: {book.publishedDate}</p>}
      {book.pageCount && <p className="mb-2">📖 {book.pageCount} páginas</p>}
      {book.categories && (
        <p className="mb-4">Categorías: {book.categories.join(', ')}</p>
      )}
      {book.description && <p className="text-gray-700">{book.description}</p>}
    </div>
  );
}
