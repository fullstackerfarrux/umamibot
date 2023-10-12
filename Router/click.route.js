// import express from "express";
import { Router } from "express";
import { clickPrepare } from "../Controller/click.controller.js";
const router = Router();

// const middle = express.urlencoded({ extended: true });

router.post("/click/prepare", middle, clickPrepare);
// router.post("/click/complete", clickComplete);

export default router;
