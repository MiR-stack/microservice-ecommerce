import prisma from "@/prisma";
import { Request, Response, NextFunction } from "express";

const getOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const fields = req.query.fields
      ? String(req.query.fields)
          .split(",")
          .reduce((acc, curr) => {
            acc[curr] = true;
            return acc;
          }, {})
      : undefined;

    // create filter
    const filter = req.query.filter
      ? String(req.query.filter)
          .split(",")
          .reduce((acc, curr) => {
            const [key, value] = curr.split(":");

            console.log(key, value, "from orders filter");
            acc[key] = String(value).toUpperCase();
            return acc;
          }, {})
      : undefined;

    // find orders
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        take: limit,
        skip: skip,
        orderBy: {
          createdAt: "desc",
        },
        where: filter,
        select: Object.keys(fields || {}).length > 0 ? fields : undefined,
      }),
      prisma.order.count(),
    ]);

    res.send({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export default getOrders;
