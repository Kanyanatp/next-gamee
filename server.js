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

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});