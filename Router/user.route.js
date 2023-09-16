import { Router } from "express";
import { getUser, getUsers } from "../Controller/user.controller.js";
const router = Router();

router.get("/user/:id", getUser);
router.get("/users", getUsers);

export default router;
