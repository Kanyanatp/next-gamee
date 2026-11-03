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

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});