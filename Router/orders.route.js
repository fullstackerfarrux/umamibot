import { Router } from "express";
import { getOneOrder, getOrders, getOrderById } from "../Controller/orders.controller.js";

const router = Router();

router.get("/orders", getOrders);
router.post("/get/order", getOneOrder);
router.post("/get/order-by-id", getOrderById);

export default router;
