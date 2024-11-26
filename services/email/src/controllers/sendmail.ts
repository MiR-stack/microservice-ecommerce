import { Request, Response, NextFunction } from "express";
import prisma from "@/prisma";
import { emailDTOSchema } from "@/schema";
import { DEFAULT_SENDER_EMAIL, transporter } from "@/config";
import { sendEmail } from "@/services";

const sendMail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // validate the request body
    const parsedBody = emailDTOSchema.safeParse(req.body);

    if (!parsedBody.success) {
      return res.status(400).json({ errors: parsedBody.error.errors });
    }

    // send mail
    const mail = await sendEmail(parsedBody.data);

    return res.status(mail.status).json({ msg: mail.msg });
  } catch (err) {
    next(err);
  }
};

export default sendMail;
