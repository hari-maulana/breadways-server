import express from "express";
import { uploadProductImage } from "../cloudinary/fileUpload";
import {
  addProductToCart,
  createProduct,
  getCartByUserId,
} from "../controllers/productController";

const router = express.Router();

router.post(
  "/admin/bakery/product/:id",
  uploadProductImage.single("image"),
  createProduct
);
//post product to cart
router.post("/cart", addProductToCart);
// Get cart items for the user
router.get("/cart/:userId", getCartByUserId);
export default router;
