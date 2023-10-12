import express from "express";
import { Router } from "express";
import { clickComplete, clickPrepare } from "../Controller/click.controller.js";
const router = Router();

const middle = express.urlencoded({ extended: true });

router.post("/click/prepare", middle, clickPrepare);
router.post("/click/complete", middle, clickComplete);

export default router;
