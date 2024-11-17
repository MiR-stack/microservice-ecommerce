import redis from "@/redis";
import { Request, Response, NextFunction } from "express";

const myCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionId = (req.headers["x-session-id"] as string) || null;
    if (!sessionId) {
      return res.status(400).json({ data: [] });
    }

    // check is session id expired
    const exist = await redis.get(`sessionId:${sessionId}`);

    console.log(exist, "session id");
    if (!exist) {
      return res.status(400).json({ data: [] });
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

    res.send(formatedItems);
  } catch (error) {
    next(error);
  }
};

export default myCart;
