import { PrismaClient } from "@prisma/client";
import multer from "multer";
import cloudinary from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
const prisma = new PrismaClient();
const app = express();
dotenv.config();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/** file uploads */
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface CloudinaryParams {
  folder?: string;
  allowed_formats?: string[];
  public_id?: (req: express.Request, file: Express.Multer.File) => string;
}

const productStorage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder: "bw-products",
    allowed_formats: ["jpg", "jpeg", "png"],
    public_id: (req, file) => `products/${Date.now()}_${file.originalname}`,
  } as CloudinaryParams,
});

export const uploadProductImage = multer({
  storage: productStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
});
