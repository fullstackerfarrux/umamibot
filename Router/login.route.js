import { Router } from "express";
import {
  changeDelivery,
  changePassword,
  login,
} from "../Controller/login.controller.js";
const router = Router();

router.post("/login", login);
router.post("/chnage/password", changePassword);
router.post("/chnage/delivery", changeDelivery);

export default router;
