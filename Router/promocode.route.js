import { Router } from "express";
import {
  createPromo,
  deletePromo,
  getPromo,
} from "../Controller/promocode.controller.js";
const router = Router();

router.post("/promo/create", createPromo);
router.get("/promo/get", getPromo);
router.post("/promo/delete", deletePromo);

export default router;
