/// <reference types="vitest" />
import { vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import HomePage from '../page';
import * as nextRouter from 'next/navigation';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

global.fetch = vi.fn();

describe('Buscador de libros', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza correctamente el formulario de búsqueda', () => {
    render(<HomePage />);
    expect(screen.getByPlaceholderText(/Buscar por título/i)).toBeInTheDocument();
    expect(screen.getByText(/Buscar/i)).toBeInTheDocument();
  });

  it('realiza la búsqueda y muestra libros', async () => {
    (fetch as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        items: [
          { id: '1', volumeInfo: { title: 'Libro 1', authors: ['Autor 1'], imageLinks: { thumbnail: '' } } },
          { id: '2', volumeInfo: { title: 'Libro 2', authors: ['Autor 2'], imageLinks: { thumbnail: '' } } },
        ],
      }),
    });

    render(<HomePage />);
    fireEvent.change(screen.getByPlaceholderText(/Buscar por título/i), { target: { value: 'test' } });
    fireEvent.click(screen.getByText(/Buscar/i));

    await waitFor(() => {
      expect(screen.getByText('Libro 1')).toBeInTheDocument();
      expect(screen.getByText('Libro 2')).toBeInTheDocument();
    });
  });

  it('muestra error si la búsqueda falla', async () => {
    (fetch as vi.Mock).mockResolvedValueOnce({ ok: false });

    render(<HomePage />);
    fireEvent.change(screen.getByPlaceholderText(/Buscar por título/i), { target: { value: 'test' } });
    fireEvent.click(screen.getByText(/Buscar/i));

    await waitFor(() => {
      expect(screen.getByText(/Error al buscar libros/i)).toBeInTheDocument();
    });
  });
});
