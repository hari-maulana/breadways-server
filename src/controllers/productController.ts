import { PrismaClient } from "@prisma/client";
import e from "express";
import express from "express";
const prisma = new PrismaClient();

export const createProduct = async (
  req: express.Request,
  res: express.Response
) => {
  const { id } = req.params;

  try {
    if (!req.file) {
      return res.status(400).json({ message: "Image file is required." });
    }

    const { name, price, description } = req.body;

    const bakery = await prisma.bakery.findUnique({
      where: { adminId: parseInt(id) },
    });

    if (!bakery) {
      return res.status(400).json({ message: "You do not own a bakery yet." });
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({ message: "Invalid price." });
    }

    const product = await prisma.product.create({
      data: {
        name,
        price: parsedPrice,
        description,
        image: req.file.path,
        bakeryId: bakery.id,
      },
    });

    res.status(201).json({ product });
  } catch (error) {
    res.status(500).json({ message: "Error adding product", error });
  }
};

// Add product to cart

export const addProductToCart = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId, productId } = req.body;

  if (!userId || !productId) {
    return res.status(400).json({ error: "userId and productId are required" });
  }

  try {
    // Find the user's cart
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: { products: true },
    });

    // If no cart is found, create a new one
    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId,
          products: {
            create: {
              productId,
              quantity: 1,
            },
          },
        },
        include: { products: true }, // add this line
      });

      return res
        .status(201)
        .json({ message: "Cart created and product added", cart });
    }

    // Check if the product already exists in the cart
    const existingProduct = cart.products.find(
      (item) => item.productId === productId
    );

    if (existingProduct) {
      // If the product exists, increment the quantity
      await prisma.cartProduct.update({
        where: { id: existingProduct.id },
        data: { quantity: existingProduct.quantity + 1 },
      });

      return res
        .status(200)
        .json({ message: "Product quantity incremented", cart });
    } else {
      // If the product doesn't exist, add it to the cart
      await prisma.cartProduct.create({
        data: {
          cartId: cart.id,
          productId,
          quantity: 1,
        },
      });

      return res.status(200).json({ message: "Product added to cart", cart });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// Get cart by user id

export const getCartByUserId = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req.params;

  // Find the user's cart with the products and quantities
  const cart = await prisma.cart.findUnique({
    where: { userId: parseInt(userId) },
    include: {
      products: {
        include: {
          product: true, // Fetch the product details for each cart product
        },
      },
    },
  });

  if (!cart) {
    return res.status(404).json({ message: "Cart not found" });
  }

  res.status(200).json(cart);
};

// place order and update cart

export const placeOrder = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId, bakeryId } = req.body;

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
    return res.status(400).json({ message: "Cart is empty" });
  }

  // Calculate the total price
  const totalPrice = cart.products.reduce((acc, cartProduct) => {
    return acc + cartProduct.quantity * cartProduct.product.price;
  }, 0);

  // Create a new order
  const order = await prisma.order.create({
    data: {
      userId: userId,
      bakeryId: bakeryId,
      totalPrice: totalPrice,
      status: "PENDING", // Initial status
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

  res.status(200).json({ message: "Order placed successfully", order });
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
