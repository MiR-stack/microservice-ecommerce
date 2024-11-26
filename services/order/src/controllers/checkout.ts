import prisma from "@/prisma";
import { orderDTOSchema, orderItemDTOSchema } from "@/schemas";
import sendToQueue from "@/sendToQueue";
import axios from "axios";
import { Request, Response, NextFunction } from "express";
import { z } from "zod";

const checkout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // validate request body
    const parsedBody = orderDTOSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({ errors: parsedBody.error.errors });
    }

    // get user info
    const userId = (req.headers["x-user-id"] as string) || null;
    const userName = req.headers["x-user-name"] as string;
    const userEmail = req.headers["x-user-email"] as string;

    if (!userId || !userName || !userEmail) {
      return res.status(404).json({ msg: "user not found" });
    }

    // get cart
    const {
      data: cart,
    }: { data: { data: z.infer<typeof orderItemDTOSchema>[] } } =
      await axios.get(`${process.env.CART_SERVICE_URL}/cart/me`, {
        headers: { "x-session-id": parsedBody.data.sessionId },
      });

    if (cart.data.length < 1) {
      return res.status(400).json({ msg: "cart is empty" });
    }

    // get order items info
    const orderItems = await Promise.all(
      cart.data.map(async (item) => {
        const { data } = await axios.get(
          `${process.env.PRODUCT_SERVICE_URL}/products/${item.productId}`
        );

        const { name, price, sku } = data;

        return {
          productId: item.productId,
          productName: name,
          sku,
          price,
          quantity: item.quantity,
          total: price * item.quantity,
        };
      })
    );

    // calculate price
    const subtotal = orderItems.reduce((acc, curr) => {
      acc += curr.total;
      return acc;
    }, 0);

    // TODO: implement tax calculation
    const tax = 0;

    const grandTotal = subtotal + tax;

    // create order
    const order = await prisma.order.create({
      data: {
        userId,
        userName,
        userEmail,
        subTotal: subtotal,
        tax,
        grandTotal,
        OrderItems: {
          create: orderItems,
        },
      },
      select: {
        id: true,
      },
    });

    // send confirmation email
    const email = {
      recipient: userEmail,
      subject: "Order Confirmation",
      body: `We're excited to confirm that your order has been processed and is on its way. Order Id: ${order.id}`,
      source: "order creation",
    };
    sendToQueue("send-mail", JSON.stringify(email));

    // clear cart
    sendToQueue("clear-cart", JSON.stringify(parsedBody.data.sessionId));

    res
      .status(201)
      .json({ msg: "order created succesfully", orderId: order.id });
  } catch (error) {
    next(error);
  }
};

export default checkout;
