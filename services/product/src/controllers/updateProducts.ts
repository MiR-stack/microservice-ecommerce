import prisma from "@/prisma";
import { productsUpdateDTOSchema } from "@/schemas";
import { NextFunction, Request, Response } from "express";

const updateProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // validate request Body
    const parsedBody = productsUpdateDTOSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({ error: parsedBody.error.errors });
    }

    const updatedProducts = await Promise.all(
      parsedBody.data.data.map(async (product) => {
        const id = product.id;

        // find product
        const Product = await prisma.product.findUnique({
          where: {
            id,
          },
        });

        if (!Product) {
          return { error: "product not found", productId: id };
        }

        // update product
        const updatedProduct = await prisma.product.update({
          where: {
            id,
          },
          data: {
            ...product,
          },
        });
        return updatedProduct;
      })
    );

    res.send(updatedProducts);
  } catch (error) {
    next(error);
  }
};

export default updateProducts;
