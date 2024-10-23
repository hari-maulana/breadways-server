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
    // Find the product to get its bakeryId
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { bakery: true }, // Ensure we get the bakery info
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Find the user's cart
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: { products: true },
    });

    // If no cart exists, create one with the bakeryId from the product
    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId,
          bakeryId: product.bakeryId, // Store the bakeryId in the cart
          products: {
            create: {
              productId,
              quantity: 1,
            },
          },
        },
        include: { products: true },
      });

      return res
        .status(201)
        .json({ message: "Cart created and product added", cart });
    }

    // If a cart exists, check if it belongs to the same bakery
    if (cart.bakeryId !== product.bakeryId) {
      return res.status(400).json({
        error:
          "You can only add products from the same bakery. Please checkout or clear your cart.",
      });
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
