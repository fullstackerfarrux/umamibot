import { Router } from "express";
import { clickPrepare } from "../Controller/click.controller.js";
const router = Router();

router.post("/click/prepare", clickPrepare);
// router.post("/click/complete", clickComplete);

export default router;
