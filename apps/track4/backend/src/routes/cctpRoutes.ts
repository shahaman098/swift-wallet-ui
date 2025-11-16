import { Router } from "express";
import {
  createIntent,
  executeBurn,
  executeMint,
  pollAttestation,
} from "../controllers/cctpController";
import authMiddleware from "../middleware/authMiddleware";

const router = Router();

router.post("/intent", authMiddleware, createIntent);
router.post("/transfer", authMiddleware, executeBurn);
router.post("/attestation", authMiddleware, pollAttestation);
router.post("/receive", authMiddleware, executeMint);

export default router;

