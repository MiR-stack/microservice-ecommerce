import { INVENTORY_SERVICE, SESSION_TTL } from "@/config";
import redis from "@/redis";
import { addToCartSchema } from "@/schemas";
import axios from "axios";
import { Request, Response, NextFunction } from "express";
import { v4 as uuid } from "uuid";

const addToCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // validate request body
    const parsedBody = addToCartSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({ errors: parsedBody.error.errors });
    }
    const { inventoryId, productId, quantity } = parsedBody.data;

    // get session id
    let sessionId = (req.headers["x-session-id"] as string) || null;

    if (sessionId) {
      // check is session id expired
      const exist = await redis.get(`sessionId:${sessionId}`);
      if (!exist) {
        sessionId = null;
      }

      await redis.expire(`sessionId:${sessionId}`, SESSION_TTL);
    }

    if (!sessionId) {
      sessionId = uuid();

      await redis.setex(`sessionId:${sessionId}`, SESSION_TTL, sessionId);
    }

    res.setHeader("x-session-id", sessionId);

    // check is inventory available
    const { data: inventory } = await axios.get(
      `${INVENTORY_SERVICE}/inventories/${inventoryId}`
    );
    if (inventory.quantity >= quantity) {
      // get changed quantity
      const prevCartItem = await redis.hget(`cart:${sessionId}`, productId);

      let quantityChanged = quantity;
      if (prevCartItem) {
        const { quantity: prevQuantity } = JSON.parse(prevCartItem) as {
          quantity: number;
        };
        quantityChanged -= prevQuantity;
      }

      // add item to the cart
      await redis.hset(
        `cart:${sessionId}`,
        productId,
        JSON.stringify({
          inventoryId,
          quantity,
        })
      );

      //   manage inventory
      if (quantityChanged > 0) {
        await axios.put(`${INVENTORY_SERVICE}/inventories/${inventoryId}`, {
          actionType: "OUT",
          quantity: quantityChanged,
        });
      } else if (quantityChanged < 0) {
        await axios.put(`${INVENTORY_SERVICE}/inventories/${inventoryId}`, {
          actionType: "IN",
          quantity: Math.abs(quantityChanged),
        });
      }
    } else {
      return res.status(400).json({ msg: "out of stock" });
    }

    res.status(200).json({ msg: "product added to the cart", sessionId });
  } catch (error) {
    next(error);
  }
};

export default addToCart;
