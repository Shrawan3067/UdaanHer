import { Router } from "express";
import { automationController } from "./automation.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { requireRole } from "../../middleware/role.middleware.js";
import { Role } from "../../types/models.js";

const router = Router();

// Protected admin endpoints for automation engine
router.use(authenticate, requireRole(Role.ADMIN));

router.get("/status", automationController.getStatus);
router.post("/trigger", automationController.triggerSuite);

export default router;
