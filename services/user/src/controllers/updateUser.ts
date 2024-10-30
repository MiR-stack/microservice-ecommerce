import { Request, Response, NextFunction } from "express";
import prisma from "@/prisma";
import { updateUserDTOSChema } from "@/schema";

const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // check if user exist
    const { id } = req.params;
    const user = await prisma.user.findFirst({
      where: {
        id,
      },
    });

    if (!user) {
      return res.status(404).json({ msg: "user not found" });
    }

    // validate request body
    const parsedBody = updateUserDTOSChema.safeParse(req.body);

    if (!parsedBody.success) {
      return res.status(400).json({ errors: parsedBody.error.errors });
    }

    // update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { ...parsedBody.data },
    });

    res.send(updatedUser);
  } catch (err) {
    next(err);
  }
};

export default updateUser;
