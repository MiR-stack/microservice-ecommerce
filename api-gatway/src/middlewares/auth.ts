import axios from "axios";
import { NextFunction, Request, Response } from "express";

const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // get token
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) return res.status(401).json({ msg: "Unauthorized" });

    // verify token
    const url = `${process.env.AUTH_SERVICE_URL}/auth/verify-token`;
    const { data } = await axios.post(url, {
      accessToken: token,
    });

    if (!data.user) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    // set headers
    const { id, name, email } = data.user;
    req.headers["x-user-id"] = id;
    req.headers["x-user-name"] = name;
    req.headers["x-user-email"] = email;

    next();
  } catch (error) {
    next(error);
  }
};

export default auth;
