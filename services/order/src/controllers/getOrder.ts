import prisma from "@/prisma";
import { Request, Response, NextFunction } from "express";

const getOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: {
        id,
      },
    });

    if (!order) {
      return res.status(404).json({ msg: "order not found" });
    }

    res.send(order);
  } catch (error) {
    next(error);
  }
};

export default getOrder;
