import express from "express";
import cors from "cors";
import { connectDB } from "./config/db";
import authRoutes from "./routes/authRoutes";
import walletRoutes from "./routes/walletRoutes";
import cctpRoutes from "./routes/cctpRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import paymentRequestRoutes from "./routes/paymentRequestRoutes";
import { env } from "./config/env";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/cctp", cctpRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/requests", paymentRequestRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

const startServer = async () => {
  await connectDB();
  app.listen(Number(env.port), () => {
    console.log(`Server running on port ${env.port}`);
  });
};

startServer();
