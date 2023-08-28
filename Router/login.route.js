import { Router } from "express";
import { login } from "../Controller/login.controller.js";
const router = Router();

router.post("/login", login);

export default router;
