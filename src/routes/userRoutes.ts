import express from "express";
import { uploadProductImage } from "../cloudinary/fileUpload";
import {
  getUserById,
  getUserProfile,
  updateUserProfile,
} from "../controllers/userController";
import { verifyToken } from "../middlewares/auth";

const router = express.Router();

// router.get("/profile/:userId", getUserById);
router.get("/profile/me", verifyToken, getUserProfile);
router.put(
  "/profile/:userId",
  uploadProductImage.single("image"),
  updateUserProfile
);

export default router;
