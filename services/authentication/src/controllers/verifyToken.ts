import { JWT_SECRET } from "@/config";
import prisma from "@/prisma";
import { accessTokenDTOSchema } from "@/schema";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // validate the request body
    const parsedBody = accessTokenDTOSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({ errors: parsedBody.error.errors });
    }

    // decode access token
    const decode = jwt.verify(parsedBody.data.accessToken, JWT_SECRET);

    if (!decode) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    // check is user exist
    const user = await prisma.user.findUnique({
      where: {
        id: (decode as any).id,
      },
    });

    if (!user) {
      return res.status(404).json({ msg: "user not found" });
    }

    return res.status(200).json({ msg: "Authorized" });
  } catch (err) {
    next(err);
  }
};

export default verifyToken;
