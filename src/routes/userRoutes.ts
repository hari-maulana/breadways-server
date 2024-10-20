import express from "express";
import {
  getUserProfile,
  updateUserProfile,
} from "../controllers/userControllers";
import { PrismaClient } from "@prisma/client";
import { get } from "http";
import { verifyToken } from "../middlewares/auth";

const prisma = new PrismaClient();

const app = express();

const getUserProfileRoute = app.get("/:userId", getUserProfile);

const updateUserProfileRoute = app.put("/:userId", updateUserProfile);

export { updateUserProfileRoute, getUserProfileRoute };
