"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Payment = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const paymentSchema = new mongoose_1.default.Schema({
    referenceId: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    sender: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    senderId: {
        type: String,
        required: true,
        index: true,
    },
    recipient: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    recipientId: {
        type: String,
        required: true,
        index: true,
    },
    amount: {
        type: Number,
        required: true,
        min: 0,
    },
    status: {
        type: String,
        required: true,
        default: "pending",
    },
    txHash: {
        type: String,
        default: null,
    },
}, { timestamps: true });
exports.Payment = mongoose_1.default.models.Payment || mongoose_1.default.model("Payment", paymentSchema);
