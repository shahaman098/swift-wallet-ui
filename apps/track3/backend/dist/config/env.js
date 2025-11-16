"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const validateEnv_1 = require("../utils/validateEnv");
dotenv_1.default.config();
exports.env = {
    circleApiKey: (0, validateEnv_1.validateEnv)("CIRCLE_API_KEY"),
    entitySecretOverride: (0, validateEnv_1.validateEnv)("CIRCLE_WALLET_ENTITY_SECRET", undefined, {
        optional: true,
    }),
    circleApiBase: (0, validateEnv_1.validateEnv)("CIRCLE_API_BASE", "https://api.circle.com/v1"),
    mongoUri: (0, validateEnv_1.validateEnv)("MONGODB_URI"),
    jwtSecret: (0, validateEnv_1.validateEnv)("JWT_SECRET"),
    port: (0, validateEnv_1.validateEnv)("PORT", "5000"),
    frontendUrl: (0, validateEnv_1.validateEnv)("FRONTEND_URL", "http://localhost:5173"),
    nodeEnv: process.env.NODE_ENV ?? "development",
};
