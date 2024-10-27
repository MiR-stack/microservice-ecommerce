import { Request, Response, NextFunction } from "express";
import prisma from "@/prisma";
import { inventoryServiceDTOSchema } from "@/schema";

const createInventory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parsedBody = inventoryServiceDTOSchema.safeParse(req.body);

    if (!parsedBody.success) {
      return res.status(400).json({ error: parsedBody.error.errors });
    }

    const { quantity } = parsedBody.data;

    const inventory = await prisma.inventory.create({
      data: {
        ...parsedBody.data,
        histories: {
          create: {
            actionType: "IN",
            quantityChanged: quantity,
            lastQuantity: quantity,
            currentQuantity: quantity,
          },
        },
      },
      select: {
        id: true,
        quantity: true,
      },
    });

    res.send(inventory).status(201);
  } catch (error) {
    next(error);
  }
};

export default createInventory;
