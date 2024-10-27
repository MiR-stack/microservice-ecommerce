import prisma from "@/prisma";
import { inventoryUpdateDTOSchema } from "@/schema";
import { NextFunction, Request, Response } from "express";

const updateInventory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    // is inventory exist
    const inventory = await prisma.inventory.findUnique({
      where: {
        id,
      },
      select: {
        quantity: true,
      },
    });

    if (!inventory) {
      return res.status(400).json({ msg: "inventory not found" });
    }

    const parsedBody = inventoryUpdateDTOSchema.safeParse(req.body);

    if (!parsedBody.success) {
      return res.status(400).json({ error: parsedBody.error.errors });
    }

    const { quantity, actionType } = parsedBody.data;

    //   calculate quantities

    let currentQuantity = inventory.quantity;

    if (actionType === "IN") {
      currentQuantity += quantity;
    } else if (actionType === "OUT") {
      const newQuantity = currentQuantity - quantity;

      if (newQuantity < 0) {
        return res.status(400).json({ msg: "insufficient products" });
      }
      currentQuantity = newQuantity;
    }

    // update inventory
    const updatedInventoy = await prisma.inventory.update({
      where: {
        id,
      },
      data: {
        quantity: currentQuantity,
        histories: {
          create: {
            actionType,
            quantityChanged: quantity,
            lastQuantity: inventory.quantity,
            currentQuantity,
          },
        },
      },
      select: {
        quantity: true,
        id: true,
      },
    });

    res.send(updatedInventoy);
  } catch (error) {
    next(error);
  }
};

export default updateInventory;
