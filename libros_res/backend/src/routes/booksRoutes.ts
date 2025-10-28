// src/routes/booksRoutes.ts
import { Router } from "express";
import { searchBooks, getBookDetails } from "../controllers/booksController.js";

const router = Router();

router.get("/books", searchBooks);
router.get("/books/:id", getBookDetails);

export default router;
