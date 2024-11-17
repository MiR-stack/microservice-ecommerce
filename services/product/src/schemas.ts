import { Status } from "@prisma/client";
import { z } from "zod";

const productServiceDTOSchema = z.object({
  sku: z.string(),
  name: z.string(),
  description: z.string().optional(),
  price: z.number().multipleOf(0.01).optional(),
  status: z.nativeEnum(Status).optional(),
  inventoryId: z.string().optional(),
  quantity: z.number().optional(),
});

const productUpdateDTOSchema = z.object({
  description: z.string().optional(),
  price: z.number().multipleOf(0.01).optional(),
  status: z.nativeEnum(Status).optional(),
  inventoryId: z.string().optional(),
});

const productsUpdateDTOSchema = z.object({
  data: productUpdateDTOSchema
    .extend({
      id: z.string(),
    })
    .array(),
});

export {
  productServiceDTOSchema,
  productUpdateDTOSchema,
  productsUpdateDTOSchema,
};
