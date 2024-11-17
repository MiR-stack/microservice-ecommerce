import { INVENTORY_SERVICE } from "@/config";
import redis from "@/redis";
import axios from "axios";

const clearCart = async (sessionId: string) => {
  // get cart
  const cart = await redis.hgetall(`cart:${sessionId}`);
  if (!cart) {
    return;
  }

  const cartItems = Object.keys(cart).map((key) => {
    const { inventoryId, quantity } = JSON.parse(cart[key]) as {
      inventoryId: string;
      quantity: number;
    };

    return {
      productId: key,
      inventoryId,
      quantity,
    };
  });

  // delete cart
  await redis.del(`cart:${sessionId}`);

  // release inventory
  cartItems.forEach(async (item) => {
    await axios.put(`${INVENTORY_SERVICE}/inventories/${item.inventoryId}`, {
      actionType: "IN",
      quantity: item.quantity,
    });
  });
};

export default clearCart;
