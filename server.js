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

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});