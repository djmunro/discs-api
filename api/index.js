const app = require('express')();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

app.get('/api', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  const skip = (page - 1) * pageSize;

  const discs = await prisma.disc.findMany({
    skip,
    take: pageSize,
  });

  const totalItems = await prisma.disc.count();

  res.json({
    discs,
    page,
    pageSize,
    totalPages: Math.ceil(totalItems / pageSize),
    totalItems,
  });
})

module.exports = app;