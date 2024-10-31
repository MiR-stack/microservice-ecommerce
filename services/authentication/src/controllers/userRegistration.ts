import { Request, Response, NextFunction } from "express";
import prisma from "@/prisma";
import {
  userRegistrationDTOSchema,
  verificationCodeEmailDTOSchema,
} from "@/schema";
import bcrypt from "bcryptjs";
import axios from "axios";
import { generateVerificationCode } from "@/utils";
import { z } from "zod";

const userRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // validate request body
    const parsedBody = userRegistrationDTOSchema.safeParse(req.body);

    if (!parsedBody.success)
      return res.status(400).json({ errors: parsedBody.error.errors });

    // check if user exist
    const user = await prisma.user.findFirst({
      where: { email: parsedBody.data.email },
    });

    if (user) {
      return res.status(400).json({ msg: "user already exist" });
    }

    // create hash password
    const salt = await bcrypt.genSalt(10);

    const password = await bcrypt.hash(parsedBody.data.password, salt);

    // create user
    const newUser = await prisma.user.create({
      data: { ...parsedBody.data, password },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        verified: true,
        status: true,
      },
    });

    // create profile
    await axios.post(
      `${process.env.USER_SERVICE_URL || "http://localhost:4004"}/users`,
      { name: newUser.name, email: newUser.email, authId: newUser.id }
    );

    // send verification email

    req.body = {
      userId: newUser.id,
      email: newUser.email,
      subject: "Account Verification",
      source: "account registration",
    };

    next();
  } catch (err) {
    next(err);
  }
};

export default userRegistration;
