// app/page.tsx
'use client';
import { useState } from 'react';
import BookCard from '@/components/BookCard';

interface Book {
  id: string;
  title: string;
  authors?: string[];
  thumbnail?: string;
}

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/books?q=${encodeURIComponent(query)}`);
      const data: Book[] = await res.json();
      setBooks(data);
    } catch {
      setError('Error al buscar libros');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">📚 Buscador de Libros</h1>

      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por título, autor o ISBN..."
          className="border border-gray-300 rounded-lg p-2 w-full"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Buscar
        </button>
      </form>

      {loading && <p>Buscando libros...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {books.map((book) => (
          <a key={book.id} href={`/book/${book.id}`}>
            <BookCard book={book} />
          </a>
        ))}
      </div>
    </div>
  );
}
