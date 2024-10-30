import prisma from "@/prisma";
import { createUserDTOSchema } from "@/schema";
import { NextFunction, Request, Response } from "express";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsedBody = await createUserDTOSchema.safeParse(req.body);

    if (!parsedBody.success) {
      return res.status(400).json({ errors: parsedBody.error.errors });
    }

    const user = await prisma.user.create({
      data: {
        ...parsedBody.data,
      },
    });

    return res.status(201).send(user);
  } catch (err) {
    next(err);
  }
};

export default createUser;
