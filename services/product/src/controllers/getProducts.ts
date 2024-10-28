import prisma from "@/prisma";
import { NextFunction, Request, Response } from "express";

const getProducts = async (req: Request, res: Response, next: NextFunction) => {
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

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        take: limit,
        skip: skip,
        orderBy: {
          createdAt: "desc",
        },
        select: Object.keys(fields || {}).length > 0 ? fields : undefined,
      }),
      prisma.product.count(),
    ]);

    res.send({
      products,
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

export default getProducts;
