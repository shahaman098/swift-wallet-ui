import express from "express";
import { sendPayment, handleWebhook } from "../controllers/paymentController";
import authMiddleware from "../middleware/authMiddleware";

const router = express.Router();

router.post("/send", authMiddleware, sendPayment);

// Webhook endpoint must remain unauthenticated for Circle callbacks
router.post("/webhook", handleWebhook);

export default router;

