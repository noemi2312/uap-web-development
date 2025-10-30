/// <reference types="vitest" />
import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BookDetail from '../book/[id]/page';
import { useParams } from 'next/navigation';

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: '123' }),
}));

global.fetch = vi.fn();

describe('Detalle de libro y reseñas', () => {
  beforeEach(() => {
    (fetch as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: '123',
        volumeInfo: { title: 'Libro Test', authors: ['Autor Test'], description: 'Descripción test', imageLinks: { thumbnail: '' } },
      }),
    });
  });

  it('renderiza libro correctamente', async () => {
  render(<BookDetail />);
  
  // Esperamos a que el título aparezca en el DOM
  const libro = await screen.findByText(/Libro Test/i, {}, { timeout: 2000 });
  expect(libro).toBeInTheDocument();
});


  it('agrega una reseña y permite votar', async () => {
    render(<BookDetail />);
    const textarea = await screen.findByPlaceholderText(/Escribí tu reseña/i);
    const enviar = screen.getByText(/Enviar reseña/i);

    fireEvent.change(textarea, { target: { value: 'Excelente libro!' } });
    fireEvent.click(enviar);

    expect(screen.getByText('Excelente libro!')).toBeInTheDocument();

    const upvote = screen.getByText('👍');
    fireEvent.click(upvote);
    expect(screen.getByText('Votos: 1')).toBeInTheDocument();
  });
});
