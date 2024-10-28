import prisma from "@/prisma";
import axios from "axios";
import { NextFunction, Request, Response } from "express";

const getProductDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    // find product
    const product = await prisma.product.findFirst({
      where: {
        id,
      },
    });

    if (!product) {
      return res.status(404).json({ msg: "product not found" });
    }

    // find inventory

    // if inventory id doesn't exist create new inventory
    if (!product.inventoryId) {
      await axios.post(`${process.env.INVENTORY_URL}/inventories`, {
        productId: product.id,
        sku: product.sku,
      });
    }

    const { data } = await axios.get(
      `${process.env.INVENTORY_URL}/inventories/${product.inventoryId}/details`
    );

    res.send({ ...product, inventory: data });
  } catch (err) {
    next(err);
  }
};

export default getProductDetails;
