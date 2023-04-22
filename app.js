const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const discs = require('./api/discs');

// Create Express app
const app = express();

// Create Prisma client
const prisma = new PrismaClient();

// Configure Express app
app.use(cors());
app.use(express.json());

// Configure routes
// app.get('/', async (req, res) => {
//   const page = parseInt(req.query.page) || 1;
//   const pageSize = parseInt(req.query.pageSize) || 10;
//   const skip = (page - 1) * pageSize;

//   const discs = await prisma.disc.findMany({
//     skip,
//     take: pageSize,
//   });

//   const totalItems = await prisma.disc.count();

//   res.json({
//     discs,
//     page,
//     pageSize,
//     totalPages: Math.ceil(totalItems / pageSize),
//     totalItems,
//   });
// })

p.get('/', async (req, res) => {
  res.send("hello world");
})

// Start Express app
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});