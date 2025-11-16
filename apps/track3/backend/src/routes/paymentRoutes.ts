import { Router } from "express";
import { sendPayment } from "../controllers/paymentController";
import authMiddleware from "../middleware/authMiddleware";

const router = Router();

router.post("/send", authMiddleware, sendPayment);

export default router;

