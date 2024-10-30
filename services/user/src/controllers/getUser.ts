import { Request, Response, NextFunction } from "express";
import prisma from "@/prisma";

const getUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ id }, { authId: id }],
      },
    });

    if (!user) {
      return res.status(404).json({ msg: "user not found" });
    }

    res.send(user);
  } catch (err) {
    next(err);
  }
};

export default getUser;
