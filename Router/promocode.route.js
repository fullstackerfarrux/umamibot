import { Router } from "express";
import { createPromo } from "../Controller/promocode.controller.js";
const router = Router();

router.post("/promo/create", createPromo);

export default router;
