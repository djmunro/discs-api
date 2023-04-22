const app = require('express')();
const { v4 } = require('uuid');

app.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  const skip = (page - 1) * pageSize;

  const discs = await prisma.disc.findMany({
    skip,
    take: pageSize,
  });

  const totalItems = await prisma.disc.count();

  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate');

  res.json({
    discs,
    page,
    pageSize,
    totalPages: Math.ceil(totalItems / pageSize),
    totalItems,
  });
})

module.exports = app;