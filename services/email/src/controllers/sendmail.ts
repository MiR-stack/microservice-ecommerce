import { Request, Response, NextFunction } from "express";
import prisma from "@/prisma";
import { emailDTOSchema } from "@/schema";
import { DEFAULT_SENDER_EMAIL, transporter } from "@/config";

const sendMail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // validate the request body
    const parsedBody = emailDTOSchema.safeParse(req.body);

    if (!parsedBody.success) {
      return res.status(400).json({ errors: parsedBody.error.errors });
    }

    // create mail options

    const { sender, recipient, body, subject, source } = parsedBody.data;

    const mailOptions = {
      from: sender || DEFAULT_SENDER_EMAIL,
      to: recipient,
      subject,
      text: body,
    };

    // send mail
    const mail = await transporter.sendMail(mailOptions);

    if (!mail) {
      return res.status(500).json({ msg: "mail not send" });
    }

    // record mail
    await prisma.email.create({
      data: {
        sender: sender || DEFAULT_SENDER_EMAIL,
        recipient,
        subject,
        body,
        source,
      },
    });

    return res.status(200).json({msg:'mail send successfully'})
  } catch (err) {
    next(err);
  }
};

export default sendMail;
