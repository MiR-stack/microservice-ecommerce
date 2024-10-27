import prisma from "@/prisma";
import { NextFunction, Request, Response } from "express";

const getInventoryDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    // find inventory

    const inventory = await prisma.inventory.findFirst({
      where: {
        id,
      },
      include: {
        histories: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!inventory) {
      return res.status(404).json({ msg: "inventory not found" });
    }

    res.send(inventory);
  } catch (err) {
    next(err);
  }
};

export default getInventoryDetails;
