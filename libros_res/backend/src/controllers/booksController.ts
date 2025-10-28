// src/controllers/booksController.ts
import type { Request, Response } from "express";

export const searchBooks = async (req: Request, res: Response) => {
  const query = req.query.q as string;

  if (!query) {
    return res.status(400).json({ error: "Debe incluir un parámetro de búsqueda (q)" });
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`
    );

    const data = (await response.json()) as any;

    if (!data.items) {
      return res.status(404).json({ message: "No se encontraron libros" });
    }

    const books = data.items.map((item: any) => ({
      id: item.id,
      title: item.volumeInfo.title,
      authors: item.volumeInfo.authors,
      thumbnail: item.volumeInfo.imageLinks?.thumbnail,
    }));

    res.json(books);
  } catch (error) {
    res.status(500).json({ error: "Error al buscar libros" });
  }
};

export const getBookDetails = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes/${id}`);
    const data = (await response.json()) as any;

    if (!data.volumeInfo) {
      return res.status(404).json({ message: "Libro no encontrado" });
    }

    const book = {
      id: data.id,
      title: data.volumeInfo.title,
      authors: data.volumeInfo.authors,
      description: data.volumeInfo.description,
      categories: data.volumeInfo.categories,
      pageCount: data.volumeInfo.pageCount,
      publishedDate: data.volumeInfo.publishedDate,
      thumbnail: data.volumeInfo.imageLinks?.thumbnail,
    };

    res.json(book);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener detalles del libro" });
  }
};
