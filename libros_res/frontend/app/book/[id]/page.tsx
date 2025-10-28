import { fetchBookById } from '@/lib/api';

export default async function BookDetail({ params }: { params: { id: string } }) {
  const book = await fetchBookById(params.id);

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
