import prisma from "@/prisma";
import { verificationCodeEmailDTOSchema } from "@/schema";
import { generateVerificationCode } from "@/utils";
import axios from "axios";
import { NextFunction, Request, Response } from "express";

const sendVerificationEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // validate request body
    const parsedBody = verificationCodeEmailDTOSchema.safeParse(req.body);

    if (!parsedBody.success) {
      return res.status(400).json({ errors: parsedBody.error.errors });
    }

    const { userId, sender, email, subject, source } = parsedBody.data;

    // create verification code

    const verificationCode = generateVerificationCode();
    const expiredAt = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.verification.create({
      data: {
        userId,
        code: verificationCode,
        expiredAt,
      },
    });

    // send verification email

    await axios.post(
      `${process.env.EMAIL_SERVICE_URL || "http://localhost:4005"}/emails/send`,
      {
        sender,
        recipient: email,
        subject,
        body: `your verification code is ${verificationCode}`,
        source,
      }
    );

    return res
      .status(200)
      .json({ msg: "please check your email for verification" });
  } catch (err) {
    next(err);
  }
};

export default sendVerificationEmail;
