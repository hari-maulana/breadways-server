import express from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get user profile menurut id
const getUserProfile = async (req: express.Request, res: express.Response) => {
  const userId = req.params.userId;
  try {
    const profile = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    res.status(200).json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update user profile
const updateUserProfile = async (
  req: express.Request,
  res: express.Response
) => {
  const userId = req.params.userId;
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Image file is required." });
    }
    const { address, fullName, email, phone, location } = req.body;
    const profile = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        fullName,
        email,
        phone,
        location,
        address,
        profilePict: req.file.path,
      },
    });
    res.status(200).json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export { updateUserProfile, getUserProfile };
