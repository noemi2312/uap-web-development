'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';


interface Review {
  id: number;
  user: string;
  rating: number;
  text: string;
  votes: number;
}

interface Book {
  id: string;
  title: string;
  authors?: string[];
  thumbnail?: string;
  description?: string;
}

export default function BookDetail() {
  const { id } = useParams();
  const [book, setBook] = useState<Book | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);

  useEffect(() => {
    const fetchBook = async () => {
      const res = await fetch(`/api/books/${id}`);
      const data = await res.json();
      setBook(data);
    };
    fetchBook();
  }, [id]);

  const addReview = () => {
    if (!reviewText.trim()) return;
    const newReview: Review = {
      id: Date.now(),
      user: 'Usuario',
      rating: reviewRating,
      text: reviewText,
      votes: 0,
    };
    setReviews([newReview, ...reviews]);
    setReviewText('');
    setReviewRating(5);
  };

  const vote = (id: number, delta: number) => {
    setReviews(reviews.map(r => r.id === id ? { ...r, votes: r.votes + delta } : r));
  };

  if (!book) return <p>Cargando libro...</p>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">{book.title}</h1>
      {book.authors && <p className="mb-2">Autor: {book.authors.join(', ')}</p>}
      {book.thumbnail && <img src={book.thumbnail} alt={book.title} className="mb-4 w-48"/>}
      {book.description && <p className="mb-6">{book.description}</p>}

      <div className="mb-6 border-t pt-4">
        <h2 className="text-2xl font-semibold mb-2">Agregar reseña</h2>
        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          className="border p-2 rounded w-full mb-2"
          placeholder="Escribí tu reseña..."
        />
        <div className="mb-2">
          <label className="mr-2">Calificación:</label>
          <select
            value={reviewRating}
            onChange={(e) => setReviewRating(Number(e.target.value))}
            className="border rounded p-1"
          >
            {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} ⭐</option>)}
          </select>
        </div>
        <button
          onClick={addReview}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Enviar reseña
        </button>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-2">Reseñas</h2>
        {reviews.length === 0 && <p>No hay reseñas aún.</p>}
        {reviews.map(r => (
          <div key={r.id} className="border rounded p-3 mb-2">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold">{r.user}</span>
              <span>{'⭐'.repeat(r.rating)}</span>
            </div>
            <p className="mb-2">{r.text}</p>
            <div className="flex gap-2">
              <button
                onClick={() => vote(r.id, 1)}
                className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
              >
                👍
              </button>
              <button
                onClick={() => vote(r.id, -1)}
                className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
              >
                👎
              </button>
              <span>Votos: {r.votes}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
