import { Book } from '@/lib/api';

interface BookCardProps {
  book: Book;
}

export default function BookCard({ book }: BookCardProps) {
  return (
    <div className="border p-4 rounded-lg shadow hover:shadow-lg transition">
      {book.thumbnail && (
        <img
          src={book.thumbnail}
          alt={book.title}
          className="w-full h-64 object-cover mb-2 rounded"
        />
      )}
      <h2 className="font-bold text-lg">{book.title}</h2>
      {book.authors && <p className="text-gray-600">{book.authors.join(', ')}</p>}
      {book.pageCount && <p className="text-gray-500">📖 {book.pageCount} páginas</p>}
      {book.publishedDate && <p className="text-gray-500">📅 {book.publishedDate}</p>}
    </div>
  );
}
