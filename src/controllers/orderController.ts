import express from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// place order and update cart

export const placeOrder = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId, bakeryId, address, location } = req.body;

  try {
    const order = await prisma.$transaction(async (prisma) => {
      // Find the user's cart
      const cart = await prisma.cart.findUnique({
        where: { userId },
        include: {
          products: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!cart || cart.products.length === 0) {
        throw new Error("Cart is empty");
      }

      // Calculate the total price
      const totalPrice = cart.products.reduce((acc, cartProduct) => {
        return acc + cartProduct.quantity * cartProduct.product.price;
      }, 0);

      // Create the order
      const order = await prisma.order.create({
        data: {
          userId: userId,
          bakeryId: bakeryId,
          totalPrice: totalPrice,
          address: address,
          location: location,
          status: "PENDING",
          products: {
            create: cart.products.map((cartProduct) => ({
              productId: cartProduct.productId,
              quantity: cartProduct.quantity,
            })),
          },
        },
      });

      // Clear the cart after placing the order
      await prisma.cartProduct.deleteMany({
        where: { cartId: cart.id },
      });

      return order;
    });

    res.status(200).json({ message: "Order placed successfully", order });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ message: "Error placing order", error });
  }
};

// get order by user id
export const getOrdersByUserId = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req.params;

  const orders = await prisma.order.findMany({
    where: { userId: parseInt(userId) },
    include: {
      bakery: true,
      products: {
        include: {
          product: true,
        },
      },
    },
  });

  res.status(200).json(orders);
};

export const getOrdersByBakeryId = async (
  req: express.Request,
  res: express.Response
) => {
  const { bakeryId } = req.params;

  const orders = await prisma.order.findMany({
    where: { bakeryId: parseInt(bakeryId) },
    include: {
      bakery: true,
      products: {
        include: {
          product: true,
        },
      },
      user: {
        select: {
          fullName: true,
        },
      },
    },
  });

  res.status(200).json(orders);
};

export const updateOrderStatus = async (
  req: express.Request,
  res: express.Response
) => {
  const { orderId } = req.params;
  const { status } = req.body;
  try {
    const order = await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: {
        status: status,
      },
    });
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
