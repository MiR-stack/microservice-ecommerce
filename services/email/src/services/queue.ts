import recieveQueue from "@/recieveQueue";
import sendEmail from "./sendmail";
import { z } from "zod";
import { emailDTOSchema } from "@/schema";

const queue = () => {
  // send email
  recieveQueue("send-mail", async (msg) => {
    const data: z.infer<typeof emailDTOSchema> = JSON.parse(msg);
    const mailRes = await sendEmail(data);
    return mailRes.status === 200;
  });
};

queue();
