export interface Book {
  id: string;
  title: string;
  authors?: string[];
  thumbnail?: string;
  description?: string;
  categories?: string[];
  pageCount?: number;
  publishedDate?: string;
}

// Buscar varios libros por query (título, autor o ISBN)
export async function fetchBooks(query: string): Promise<Book[]> {
  const res = await fetch(`http://localhost:4000/api/books?q=${encodeURIComponent(query)}`);
  const data = await res.json();
  return data.map((b: any) => ({
    id: b.id,
    title: b.title,
    authors: b.authors,
    thumbnail: b.thumbnail,
  }));
}

// Buscar un libro por su id
export async function fetchBookById(id: string): Promise<Book | null> {
  try {
    const res = await fetch(`http://localhost:4000/api/books/${id}`);
    if (!res.ok) return null;
    const b = await res.json();
    return {
      id: b.id,
      title: b.title,
      authors: b.authors,
      thumbnail: b.thumbnail,
      description: b.description,
      categories: b.categories,
      pageCount: b.pageCount,
      publishedDate: b.publishedDate,
    };
  } catch {
    return null;
  }
}
