import { Router } from "express";
import {
  createCategory,
  getCategories,
} from "../Controller/category.controller.js";
const router = Router();

router.post("/category/create", createCategory);
router.get("/categories", getCategories);

export default router;
