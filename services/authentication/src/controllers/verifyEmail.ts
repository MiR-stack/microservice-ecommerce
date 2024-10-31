import { Request, Response, NextFunction } from "express";
import prisma from "@/prisma";
import { emailVerifyDTOSchema } from "@/schema";

const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // validate the request body
    const parsedBody = emailVerifyDTOSchema.safeParse(req.body);

    if (!parsedBody.success) {
      return res.status(400).json({ errors: parsedBody.error.errors });
    }

    // check is user exist
    const user = await prisma.user.findUnique({
      where: {
        email: parsedBody.data.email,
      },
    });

    if (!user) {
      return res.status(404).json({ msg: "user not found" });
    }

    // check is verification valid
    const verification = await prisma.verification.findUnique({
      where: {
        code: parsedBody.data.code,
        userId: user.id,
      },
    });

    if (!verification) {
      return res.status(400).json({ msg: "verification code not found" });
    }

    // check verifation code expire date
    if (verification.expiredAt < new Date()) {
      await prisma.verification.update({
        where: {
          userId: user.id,
          code: verification.code,
        },
        data: {
          status: "EXPIRES",
        },
      });

      return res.status(403).json({ msg: "verification code is expired" });
    }

    // activate account
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        status: "ACTIVE",
        verified: true,
      },
    });

    // update verification code
    await prisma.verification.update({
      where: {
        id: verification.id,
      },
      data: {
        status: "USED",
        verifiedAt: new Date(),
      },
    });

    return res
      .status(200)
      .json({ msg: "your account is verified succesfully" });
  } catch (err) {
    next(err);
  }
};

export default verifyEmail;
