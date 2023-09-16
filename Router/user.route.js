import { Router } from "express";
import {
  getUser,
  getUsers,
  getUsersOrder,
} from "../Controller/user.controller.js";
const router = Router();

router.get("/user/:id", getUser);
router.get("/users", getUsers);
router.get("/users/order", getUsersOrder);

export default router;
