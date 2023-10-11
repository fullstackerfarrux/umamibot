import { Router } from "express";
import { clickComplete, clickPrepare } from "../Controller/click.controller.js";
const router = Router();

router.get("/click/prepare", clickPrepare);
router.post("/click/complete", clickComplete);

export default router;
