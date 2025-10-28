// src/index.ts
import express from "express";
import cors from "cors";
import booksRoutes from "./routes/booksRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("Backend funcionando ✅");
});

app.use("/api", booksRoutes);

const PORT = 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
