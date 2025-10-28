// frontend/lib/api.ts
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

// Función para buscar libros por query (título, autor, ISBN)
export async function fetchBooks(query: string): Promise<Book[]> {
  if (!query) return [];

  const res = await fetch(`http://localhost:4000/api/books?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Error al obtener los libros');

  const data: Book[] = await res.json();
  return data;
}

// Función para obtener un libro por ID
export async function fetchBookById(id: string): Promise<Book | null> {
  if (!id) return null;

  const res = await fetch(`http://localhost:4000/api/books/${id}`);
  if (!res.ok) throw new Error('Error al obtener el libro');

  const data: Book = await res.json();
  return data;
}
