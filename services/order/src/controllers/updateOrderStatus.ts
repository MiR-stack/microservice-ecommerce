import prisma from "@/prisma";
import { updateOrderStatusSchema } from "@/schemas";
import axios from "axios";
import { Request, Response, NextFunction } from "express";

const updateOrderStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // validate request body
    const parsedBody = updateOrderStatusSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({ errors: parsedBody.error.errors });
    }

    const { id } = req.params;

    // check is order exist
    const order = await prisma.order.findUnique({
      where: {
        id,
      },
    });
    if (!order) {
      return res.status(404).json({ msg: "order not found" });
    }

    // udpate status
    await prisma.order.update({
      where: {
        id,
      },
      data: {
        status: parsedBody.data.status,
      },
    });

    // send email
    await axios.post(`${process.env.EMAIL_SERVICE_URL}/emails/send`, {
      recipient: order.userEmail,
      subject: "update order status",
      body: `We're writing to inform you about an update to your order, ${id}. Your order status has changed to ${parsedBody.data.status}.`,
      source: "order creation",
    });

    res.send({ msg: "order status updated succesfully" });
  } catch (error) {
    next(error);
  }
};

export default updateOrderStatus;
