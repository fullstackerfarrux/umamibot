import { Router } from "express";
import {
  getOneOrder,
  getOrders,
  getUsersOrder,
} from "../Controller/orders.controller.js";

const router = Router();

router.get("/orders", getOrders);
router.post("/get/order", getOneOrder);

export default router;
