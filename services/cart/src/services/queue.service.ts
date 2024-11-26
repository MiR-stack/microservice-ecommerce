import recieveQueue from "@/recieveQueue";
import clearCart from "./clearCart.service";

const queue = () => {
  // clear cart
  recieveQueue("clear-cart", async (msg) => {
    const sessionId = await JSON.parse(msg);
    await clearCart(sessionId);
    return true;
  });
};

queue();
