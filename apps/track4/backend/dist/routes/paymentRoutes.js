"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const paymentController_1 = require("../controllers/paymentController");
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const router = express_1.default.Router();
router.post("/send", authMiddleware_1.default, paymentController_1.sendPayment);
// Webhook endpoint must remain unauthenticated for Circle callbacks
router.post("/webhook", paymentController_1.handleWebhook);
exports.default = router;
