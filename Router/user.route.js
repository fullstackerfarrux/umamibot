import { Router } from "express";
import { getUser } from "../Controller/user.controller";
const router = Router();

router.get("/user/:id", getUser);

export default router;
