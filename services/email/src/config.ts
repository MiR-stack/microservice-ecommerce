import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "localhost",
  port: Number(process.env.SMTP_PORT) || 1025,
});

export const DEFAULT_SENDER_EMAIL =
  process.env.DEFAULT_SENDER_EMAIL || "example@gmail.com";

export const QUEUE_URL = process.env.AMQP_URL || "amqp://localhost";
