const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const express = require('express');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.post('/books', async (req, res) => {
  const { title, author } = req.body;
  const book = await prisma.book.create({
    data: { title, author },
  });
  res.status(201).json(book);
});

app.get('/books', async (req, res) => {
  const books = await prisma.book.findMany({
    include: {
      reviews: true,
    },
  });
  res.json(books);
});

app.get('/books/:id', async (req, res) => {
  const book = await prisma.book.findUnique({
    where: { id: Number(req.params.id) },
    include: { reviews: true },
  });
  if (!book) {
    return res.status(404).json({ error: 'Book not found' });
  }
  res.json(book);
});

app.post('/books/:id/reviews', async (req, res) => {
  const bookId = Number(req.params.id);
  const { rating, content } = req.body;

  const book = await prisma.book.findUnique({ where: { id: bookId } });
  if (!book) {
    return res.status(404).json({ error: 'Book not found' });
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'rating must be an integer 1-5' });
  }

  const review = await prisma.review.create({
    data: { rating, content, bookId: bookId },
  });
  res.status(201).json(review);
});

app.post('/books/:id/cover', upload.single('cover'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'cover file is required' });
  }
  const book = await prisma.book.update({
    where: { id: Number(req.params.id) },
    data: { coverUrl: req.file.path },
  });
  res.json(book);
});

app.put('/books/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { title, author } = req.body;
  const exists = await prisma.book.findUnique({ where: { id } });
  if (!exists) {
    return res.status(404).json({ error: 'Book not found' });
  }
  const book = await prisma.book.update({
    where: { id },
    data: { title, author },
  });
  res.json(book);
});

app.delete('/books/:id', async (req, res) => {
  const id = Number(req.params.id);
  const book = await prisma.book.findUnique({ where: { id } });
  if (!book) {
    return res.status(404).json({ error: 'Book not found' });
  }
  await prisma.book.delete({ where: { id } });
  res.status(204).end();
});

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});