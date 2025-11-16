import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware";
import {
  createRequest,
  getRequest,
  payRequest,
} from "../controllers/paymentRequestController";

const router = Router();

router.post("/create", authMiddleware, createRequest);
router.get("/:requestId", getRequest);
router.post("/:requestId/pay", authMiddleware, payRequest);

export default router;

