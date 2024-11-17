import { REDIS_HOST, REDIS_PORT } from "@/config";
import { clearCart } from "@/services";
import { Redis } from "ioredis";

const redis = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT,
});

const CHENNEL_KEY = "__keyevent@0__:expired";

redis.config("SET", "notify-keyspace-events", "Ex");
redis.subscribe(CHENNEL_KEY);

redis.on("message", async (ch, message) => {
  if (ch === CHENNEL_KEY) {
    const sessionId = message.split(":")[1];
    await clearCart(sessionId);

    console.log("cart cleared");
  }
});
