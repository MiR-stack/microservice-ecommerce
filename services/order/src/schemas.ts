import { OrderStatus } from "@prisma/client";
import { z } from "zod";

const orderItemDTOSchema = z.object({
  productId: z.string(),
  quantity: z.number(),
});

const orderDTOSchema = z.object({
  sessionId: z.string(),
});

const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
});

export { orderDTOSchema, orderItemDTOSchema, updateOrderStatusSchema };
