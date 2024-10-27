import { Actions } from "@prisma/client";
import { z } from "zod";

export const inventoryServiceDTOSchema = z.object({
  id: z.string().optional(),
  productId: z.string(),
  sku: z.string(),
  quantity: z.number().int().optional().default(0),
});

export const inventoryUpdateDTOSchema = z.object({
  actionType: z.nativeEnum(Actions),
  quantity: z.number().int().positive(),
});
