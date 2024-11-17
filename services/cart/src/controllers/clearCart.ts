import redis from "@/redis";
import { Request, Response, NextFunction } from "express";

const clearCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // get session id
    const sessionId = (req.headers["x-session-id"] as string) || null;
    if (!sessionId) {
      return res.status(404).json({ msg: "cart not found" });
    }

    // check if session id exist
    const exist = await redis.get(`sessionId:${sessionId}`);
    if (!exist) {
      return res.status(400).json({ msg: "cart cleared" });
    }

    // check if cart exist
    const cart = await redis.hgetall(`cart:${sessionId}`);
    if (!cart) return res.send({ msg: "cart cleared" });

    // clear cart
    await redis.del(`sessionId:${sessionId}`);
    await redis.del(`cart:${sessionId}`);

    res.send({ msg: "cart cleared" });
  } catch (error) {
    next(error);
  }
};

export default clearCart;
