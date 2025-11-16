import express from "express";
import cors from "cors";
import morgan from "morgan";
import { connectDB } from "./config/db";
import authRoutes from "./routes/authRoutes";
import walletRoutes from "./routes/walletRoutes";
import cctpRoutes from "./routes/cctpRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import paymentRequestRoutes from "./routes/paymentRequestRoutes";
import schedulerRoutes from "./routes/schedulerRoutes";
import treasuryRoutes from "./routes/treasuryRoutes";
import eventRoutes from "./routes/eventRoutes";
import { env } from "./config/env";

const app = express();

app.use(cors());
app.use(express.json());
app.use(
  morgan(":method :url :status :response-time ms - :res[content-length]")
);

app.use("/api/auth", authRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/cctp", cctpRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/requests", paymentRequestRoutes);
app.use("/api/scheduler", schedulerRoutes);
app.use("/api/treasury", treasuryRoutes);
app.use("/api/events", eventRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

const startServer = async () => {
  try {
    await connectDB();
  } catch {}
  
  const port = Number(env.port) || 5000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};

startServer().catch(() => {
  const port = Number(env.port) || 5000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
});
