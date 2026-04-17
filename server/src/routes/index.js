import { Router } from "express";
import healthRoutes from "./health.routes.js";
import searchRoutes from "./search.routes.js";
import conversationRoutes from "./conversation.routes.js";

const router = Router();

router.use("/health", healthRoutes);
router.use("/search", searchRoutes);
router.use("/conversations", conversationRoutes);

export default router;
