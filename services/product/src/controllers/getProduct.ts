import prisma from "@/prisma";
import { NextFunction, Request, Response } from "express";

const getProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id: String(id) }, { sku: id }],
      },
    });

    if (!product) {
      return res.status(404).json({ msg: "product not found" });
    }

    res.send(product);
  } catch (err) {
    next(err);
  }
};

export default getProduct;
