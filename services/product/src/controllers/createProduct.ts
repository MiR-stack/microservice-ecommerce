import prisma from "@/prisma";
import { productServiceDTOSchema } from "@/schemas";
import axios from "axios";
import { NextFunction, Request, Response } from "express";

const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parsedBody = productServiceDTOSchema.safeParse(req.body);

    if (!parsedBody.success) {
      return res.status(400).json({ error: parsedBody.error.errors });
    }

    // create product
    const product = await prisma.product.create({
      data: {
        ...parsedBody.data,
      },
    });

    console.log("product created");

    // create inventory
    const { data: inventory } = await axios.post(
      `${process.env.INVENTORY_URL}/inventories`,
      {
        productId: product.id,
        sku: product.sku,
        quantity: parsedBody.data.quantity,
      }
    );

    console.log("inventory created");

    // delete product if inventory creation failed
    if (!inventory) {
      await prisma.product.delete({
        where: {
          id: product.id,
        },
      });

      return res.status(400).json({ msg: "bad request" });
    }

    // update product and store inventory id
    await prisma.product.update({
      where: {
        id: product.id,
      },
      data: {
        inventoryId: inventory.id,
      },
    });

    res.status(201).json({ ...product, inventoryId: inventory.id });
  } catch (err) {
    next(err);
  }
};

export default createProduct;
