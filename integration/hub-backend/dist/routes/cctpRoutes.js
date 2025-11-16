"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cctpController_1 = require("../controllers/cctpController");
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const router = (0, express_1.Router)();
router.post("/intent", authMiddleware_1.default, cctpController_1.createIntent);
router.post("/transfer", authMiddleware_1.default, cctpController_1.executeBurn);
router.post("/attestation", authMiddleware_1.default, cctpController_1.pollAttestation);
router.post("/receive", authMiddleware_1.default, cctpController_1.executeMint);
exports.default = router;
