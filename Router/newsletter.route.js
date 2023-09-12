import { Router } from "express";
import { newsletter } from "../Controller/newsletter.controller";

const router = Router();

router.post("/newsletter", newsletter);

export default router;
