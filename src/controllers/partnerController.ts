import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const bakeries = async (req: Request, res: Response) => {
  try {
    const bakeries = await prisma.bakery.findMany({});

    res.status(200).json({ bakeries });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const products = await prisma.product.findMany({
      where: {
        bakeryId: parseInt(id),
      },
    });

    res.status(200).json({ products });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
