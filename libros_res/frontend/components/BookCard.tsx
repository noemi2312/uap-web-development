interface BookCardProps {
  book: {
    id: string;
    title: string;
    authors?: string[];
    thumbnail?: string;
  };
}

export default function BookCard({ book }: BookCardProps) {
  return (
    <div className="border rounded-lg p-2 bg-white shadow hover:shadow-md transition">
      {book.thumbnail && <img src={book.thumbnail} alt={book.title} className="w-full h-40 object-cover mb-2 rounded" />}
      <h2 className="font-semibold">{book.title}</h2>
      <p className="text-sm text-gray-600">{book.authors?.join(', ')}</p>
    </div>
  );
}
