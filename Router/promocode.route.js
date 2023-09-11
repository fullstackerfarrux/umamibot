import { Router } from "express";
import { createPromo, getPromo } from "../Controller/promocode.controller.js";
const router = Router();

router.post("/promo/create", createPromo);
router.get("/promo/get", getPromo);

export default router;
