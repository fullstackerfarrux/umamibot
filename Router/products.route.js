import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  editProduct,
  getProduct,
  getProducts,
} from "../Controller/products.controller.js";
const router = Router();

router.post("/product/create", createProduct);
router.get("/products", getProducts);
router.post("/product", getProduct);
router.post("/product/edit", editProduct);
router.post("/product/delete", deleteProduct);
export default router;
