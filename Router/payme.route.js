import express from "express";
import { Router } from "express";
import { accept_order } from "../Controller/payme.controller.js";
const router = Router();

const middle = express.urlencoded({ extended: true });

router.post("/payme/accept-order", middle, accept_order);
export default router;
