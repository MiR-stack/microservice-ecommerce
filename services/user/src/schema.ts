import { z } from "zod";

const createUserDTOSchema = z.object({
  authId: z.string(),
  name: z.string().min(3).max(18),
  email: z.string().email(),
  address: z.string().optional(),
  phone: z.string().optional(),
});

const updateUserDTOSChema = createUserDTOSchema
  .omit({ authId: true })
  .partial();

export { createUserDTOSchema, updateUserDTOSChema };
