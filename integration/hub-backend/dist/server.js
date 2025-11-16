"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const db_1 = require("./config/db");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const walletRoutes_1 = __importDefault(require("./routes/walletRoutes"));
const cctpRoutes_1 = __importDefault(require("./routes/cctpRoutes"));
const paymentRoutes_1 = __importDefault(require("./routes/paymentRoutes"));
const paymentRequestRoutes_1 = __importDefault(require("./routes/paymentRequestRoutes"));
const env_1 = require("./config/env");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, morgan_1.default)(":method :url :status :response-time ms - :res[content-length]"));
app.use("/api/auth", authRoutes_1.default);
app.use("/api/wallet", walletRoutes_1.default);
app.use("/api/cctp", cctpRoutes_1.default);
app.use("/api/payments", paymentRoutes_1.default);
app.use("/api/requests", paymentRequestRoutes_1.default);
app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
});
const startServer = async () => {
    await (0, db_1.connectDB)();
    app.listen(Number(env_1.env.port), () => {
        console.log(`Server running on port ${env_1.env.port}`);
    });
};
startServer();
