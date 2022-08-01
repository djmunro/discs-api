import { PrismaClient } from "@prisma/client";
import express, { Request, Response, NextFunction } from "express";

const app = express();
const port = 3000;

const prisma = new PrismaClient();

const getAllDiscs = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const discs = await prisma.disc.findMany();

  response.status(200).json(discs);
};

app.get("/discs", getAllDiscs);

app.listen(port, () => {
  console.log(`alive on http://localhost:${port}.`);
});
