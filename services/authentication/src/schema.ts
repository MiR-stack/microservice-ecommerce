import { z } from "zod";

const userRegistrationDTOSchema = z.object({
  name: z.string().min(3).max(18),
  email: z.string().email(),
  password: z.string().min(6).max(200),
});

const userLoginDTOSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(255),
});

const accessTokenDTOSchema = z.object({
  accessToken: z.string(),
});

const emailVerifyDTOSchema = z.object({
  email: z.string().email(),
  code: z.string().length(5),
});

const verificationCodeEmailDTOSchema = z.object({
  userId: z.string(),
  email: z.string().email(),
  sender: z.string().email().optional(),
  subject: z.string().max(2500),
  source: z.string(),
});

export {
  userRegistrationDTOSchema,
  userLoginDTOSchema,
  accessTokenDTOSchema,
  emailVerifyDTOSchema,
  verificationCodeEmailDTOSchema,
};
