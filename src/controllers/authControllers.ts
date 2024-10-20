import { PrismaClient } from "@prisma/client";
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

const register = async (req: express.Request, res: express.Response) => {
  try {
    const { email, password, fullName, gender, phone, role } = req.body;

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);
    if (role === "ADMIN") {
      const user = await prisma.user.create({
        data: {
          email,
          password: passwordHash,
          fullName,
          gender,
          phone,
          role,
          bakery: {
            create: {
              name: fullName,
              description: "",
              address: "",
              location: {},
              image: "",
            },
          },
          profile: {
            create: {
              address: "",
              profilePict: "",
              location: {},
            },
          },
        },
      });

      res.status(201).json(user);
    } else if (role === "USER") {
      const user = await prisma.user.create({
        data: {
          email,
          password: passwordHash,
          fullName,
          gender,
          phone,
          role,
          profile: {
            create: {
              address: "",
              profilePict: "",
              location: {},
            },
          },
        },
      });

      res.status(201).json(user);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const admRegister = async (req: express.Request, res: express.Response) => {
  try {
    const { email, password, fullName, gender, phone, role } = req.body;

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        email,
        password: passwordHash,
        fullName,
        gender,
        phone,
        role,
        bakery: {
          create: {
            name: fullName,
            description: "",
            address: "",
            location: {},
          },
        },
      },
    });

    res.status(201).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const login = async (req: express.Request, res: express.Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });
    const role = user.role;
    const userId = user.id;

    res.status(200).json({ userId, role, token: token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export { register, login };
