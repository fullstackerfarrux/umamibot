import { Router } from "express";
import {
  createCategory,
  getCategories,
  getOrders,
} from "../Controller/category.controller.js";
const router = Router();

router.post("/category/create", createCategory);
router.get("/categories", getCategories);
router.get("/orders", getOrders);

export default router;
