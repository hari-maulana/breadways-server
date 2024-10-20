import { PrismaClient } from "@prisma/client";
import multer from "multer";
import cloudinary from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { loginRoute, registerRoute } from "./src/routes/authRoutes";
import {
  getUserProfileRoute,
  updateUserProfileRoute,
} from "./src/routes/userRoutes";
import { bakeries, getProducts } from "./src/controllers/partnerController";
import { get } from "http";
import { uploadProductImage } from "./src/cloudinary/fileUpload";
import { create } from "domain";
import {
  addProductToCart,
  createProduct,
  getCartByUserId,
  getOrdersByUserId,
  placeOrder,
} from "./src/controllers/productController";

const prisma = new PrismaClient();
const app = express();
dotenv.config();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ROUTES
app.use("/auth", registerRoute);
app.use("/auth", loginRoute);
// USER ROUTES
app.use("/user", updateUserProfileRoute);
app.use("/user", getUserProfileRoute);
// PARTNER ROUTES
app.get("/bakeries", bakeries);
app.get("/bakery/:id/products", getProducts);
// PRODUCT ROUTES
app.post(
  "/admin/bakery/product/:id",
  uploadProductImage.single("image"),
  createProduct
);
//post product to cart
app.post("/cart", addProductToCart);
// Get cart items for the user
app.get("/cart/:userId", getCartByUserId);
// Place an order and clear the cart
app.post("/order", placeOrder);
// get orders
app.get("/orders/:userId", getOrdersByUserId);

/** get bakeries */
app.get("/bakeries", async (req, res) => {
  try {
    const bakeries = await prisma.bakery.findMany({
      include: {
        products: true,
      },
    });

    res.status(200).json({ bakeries });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});
/** get user */

app.get("/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        profile: true,
        bakery: true,
      },
    });

    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server listening on port ${process.env.PORT}`);
});
