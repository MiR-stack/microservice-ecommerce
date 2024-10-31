import { Request, Response, NextFunction } from "express";
import prisma from "@/prisma";

const getMails = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const emails = await prisma.email.findMany();

    return res.send(emails);
  } catch (err) {
    next(err);
  }
};

export default getMails;
