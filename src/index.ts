import { PrismaClient } from "@prisma/client";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import partnerRoutes from "./routes/partnerRoutes";
import productRoutes from "./routes/productRoutes";
import orderRoutes from "./routes/orderRoutes";

const prisma = new PrismaClient();
const app = express();
dotenv.config();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ROUTES
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/partner", partnerRoutes);
app.use("/", productRoutes);
app.use("/", orderRoutes);

app.get("/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        bakery: true,
      },
    });

    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/", (req, res) => {
  res.send("Backend is running!");
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server listening on port ${process.env.PORT}`);
});
