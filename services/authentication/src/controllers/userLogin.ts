import { Request, Response, NextFunction } from "express";
import prisma from "@/prisma";
import { userLoginDTOSchema } from "@/schema";
import bcrypt from "bcryptjs";
import { LoginAttempt } from "@prisma/client";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@/config";

const userLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // collect user info
    const ipAddress =
      (req.headers["x-forwarded-for"] as string) || req.ip || "";
    const userAgent = req.headers["user-agent"] || "";

    // validate request body
    const parsedBody = userLoginDTOSchema.safeParse(req.body);

    if (!parsedBody.success) {
      return res.status(400).json({ errors: parsedBody.error.errors });
    }

    // check if user exist
    const user = await prisma.user.findUnique({
      where: { email: parsedBody.data.email },
    });

    if (!user) {
      return res.status(404).json({ msg: "invalid credentials" });
    }

    // check password
    const isValid = bcrypt.compare(parsedBody.data.password, user.password);

    if (!isValid) {
      await createLoginHistory({
        userId: user.id,
        ipAddress,
        userAgent,
        attempt: "FAILED",
      });
      return res.status(403).json({ msg: "invalid credentials" });
    }

    //   check user verification

    if (!user.verified) {
      await createLoginHistory({
        userId: user.id,
        ipAddress,
        userAgent,
        attempt: "FAILED",
      });
      return res.status(403).json({ msg: "user is not verified" });
    }

    //   check user status
    if (user.status !== "ACTIVE") {
      await createLoginHistory({
        userId: user.id,
        ipAddress,
        userAgent,
        attempt: "FAILED",
      });
      return res.status(400).json({ msg: `user account is ${user.status}` });
    }

    //   create json token

    const accessToken = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        verified: user.verified,
      },
      JWT_SECRET,
      {
        expiresIn: "24h",
      }
    );

    await createLoginHistory({
      userId: user.id,
      ipAddress,
      userAgent,
      attempt: "SUCCESS",
    });

    return res.status(200).json({ accessToken });
  } catch (err) {
    next(err);
  }
};

interface LoginHistoryType {
  userId: string;
  ipAddress: string;
  userAgent: string;
  attempt: LoginAttempt;
}

const createLoginHistory = async (info: LoginHistoryType) => {
  return await prisma.loginHistory.create({
    data: { ...info },
  });
};

export default userLogin;
