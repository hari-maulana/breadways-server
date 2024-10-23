import express from "express";
import {
  getOrdersByBakeryId,
  getOrdersByUserId,
  placeOrder,
  updateOrderStatus,
} from "../controllers/orderController";

const router = express.Router();

router.post("/order", placeOrder);
// get orders
router.get("/orders/:userId", getOrdersByUserId);
router.get("/admin/orders/:bakeryId", getOrdersByBakeryId);

router.patch("/admin/orders/:orderId", updateOrderStatus);

export default router;
