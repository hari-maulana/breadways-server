import express from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get user profile menurut id
const getUserProfile = async (req: express.Request, res: express.Response) => {
  const userId = req.params.userId;
  try {
    const profile = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      include: {
        profile: true,
        bakery: true,
      },
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
    const { profilePict, address, fullName } = req.body;
    const profile = await prisma.userProfile.update({
      where: { userId: parseInt(userId) },
      data: {
        address,
        profilePict,
        user: {
          update: {
            fullName,
          },
        },
      },
    });
    res.status(200).json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export { updateUserProfile, getUserProfile };
