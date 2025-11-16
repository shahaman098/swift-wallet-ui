"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const paymentRequestController_1 = require("../controllers/paymentRequestController");
const router = (0, express_1.Router)();
router.post("/create", authMiddleware_1.default, paymentRequestController_1.createRequest);
router.get("/:requestId", paymentRequestController_1.getRequest);
router.post("/:requestId/pay", authMiddleware_1.default, paymentRequestController_1.payRequest);
exports.default = router;
