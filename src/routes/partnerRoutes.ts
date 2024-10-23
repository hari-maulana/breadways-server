import express from "express";
import {
  getAllBakeries,
  getBakeryProducts,
} from "../controllers/partnerController";

const router = express.Router();

router.get("/bakeries", getAllBakeries);
router.get("/bakery/:id/products", getBakeryProducts);

export default router;
