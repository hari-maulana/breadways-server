import express from "express";
import { uploadProductImage } from "../cloudinary/fileUpload";
import {
  getUserProfile,
  updateUserProfile,
} from "../controllers/userController";

const router = express.Router();

router.get("/profile/:userId", getUserProfile);
router.put(
  "/profile/:userId",
  uploadProductImage.single("image"),
  updateUserProfile
);

export default router;
