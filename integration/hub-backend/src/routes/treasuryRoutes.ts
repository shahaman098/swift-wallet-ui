import { Router } from "express";
import { oracleApprove, executeDistribution } from "../controllers/treasuryController";
import authMiddleware from "../middleware/authMiddleware";

const router = Router();

router.post("/oracle-approve", authMiddleware, oracleApprove);
router.post("/execute-distribution", authMiddleware, executeDistribution);

export default router;

