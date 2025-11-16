import { Router } from "express";
import {
  createIntent,
  executeBurn,
  executeMint,
  pollAttestation,
  bridge,
} from "../controllers/cctpController";
import authMiddleware from "../middleware/authMiddleware";

const router = Router();

router.post("/intent", authMiddleware, createIntent);
router.post("/transfer", authMiddleware, executeBurn);
router.post("/attestation", authMiddleware, pollAttestation);
router.post("/receive", authMiddleware, executeMint);
router.post("/bridge", authMiddleware, bridge);

export default router;

