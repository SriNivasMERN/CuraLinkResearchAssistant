import { Router } from "express";
import { searchResearch } from "../controllers/search.controller.js";

const router = Router();

router.post("/", searchResearch);

export default router;

