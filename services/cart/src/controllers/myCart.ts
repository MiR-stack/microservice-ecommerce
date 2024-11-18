import redis from "@/redis";
import { Request, Response, NextFunction } from "express";

const myCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionId = (req.headers["x-session-id"] as string) || null;
    if (!sessionId) {
      return res.send({ data: [] });
    }

    // check is session id expired
    const exist = await redis.get(`sessionId:${sessionId}`);

    if (!exist) {
      return res.send({ data: [] });
    }

    // get cart items
    const cart = await redis.hgetall(`cart:${sessionId}`);

    const formatedItems = Object.keys(cart).map((key) => {
      const item = JSON.parse(cart[key]) as {
        inventoryId: string;
        quantity: number;
      };

      return {
        productId: key,
        ...item,
      };
    });

    res.send({ data: formatedItems });
  } catch (error) {
    next(error);
  }
};

export default myCart;
