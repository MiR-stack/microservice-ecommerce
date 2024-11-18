import prisma from "@/prisma";
import { Request, Response, NextFunction } from "express";

const getOrderByUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req.headers["x-user-id"] as string) || null;

    if (!userId) {
      return res.status(400).json({});
    }

    const orders = await prisma.order.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.send(orders);
  } catch (error) {
    next(error);
  }
};

export default getOrderByUser;
