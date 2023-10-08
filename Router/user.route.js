import { Router } from "express";
import {
  getUser,
  getUserLocation,
  getUsers,
  getUsersOrder,
} from "../Controller/user.controller.js";
const router = Router();

router.get("/user/:id", getUser);
router.get("/users", getUsers);
router.get("/user/:id", getUser);
router.get("/users/order", getUsersOrder);
router.get("/user_location/:id", getUserLocation);

export default router;
