import { Router } from "express";
import { deployContract, executeDistribution } from "../controllers/schedulerController";
import authMiddleware from "../middleware/authMiddleware";

const router = Router();

router.post("/deploy", authMiddleware, deployContract);
router.post("/execute", authMiddleware, executeDistribution);

export default router;

