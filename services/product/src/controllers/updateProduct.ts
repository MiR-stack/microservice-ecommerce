import prisma from "@/prisma";
import { productUptateDTOSchema } from "@/schemas";
import { NextFunction, Request, Response } from "express";

const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    // find product
    const product = await prisma.product.findUnique({
      where: {
        id,
      },
    });

    if (!product) {
      return res.status(404).json({ msg: "product not found" });
    }

    // update product
    const parsedBody = productUptateDTOSchema.safeParse(req.body);

    if (!parsedBody.success) {
      return res.status(400).json({ error: parsedBody.error.errors });
    }

    const updatedProduct = await prisma.product.update({
      where: {
        id,
      },
      data: {
        ...parsedBody.data,
      },
    });

    res.send(updatedProduct);
  } catch (error) {
    next(error);
  }
};

export default updateProduct;
