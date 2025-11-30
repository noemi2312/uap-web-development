import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import BookDetail from '../book/[id]/page';

// Mock de next/navigation - ESTO ES CLAVE
vi.mock('next/navigation', () => ({
  useParams: vi.fn(() => ({ id: '123' })),
}));

global.fetch = vi.fn();

describe('Detalle de libro y reseñas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        id: '123',
        volumeInfo: { 
          title: 'Libro Test', 
          authors: ['Autor Test'], 
          description: 'Descripción test', 
          imageLinks: { thumbnail: '' } 
        },
      }),
    });
  });

  it('renderiza libro correctamente', async () => {
    // Si el componente es async y usa useParams internamente
    const PageComponent = await BookDetail();
    render(PageComponent);
    
    await waitFor(() => {
      expect(screen.getByText('Libro Test')).toBeInTheDocument();
    });
  });
});