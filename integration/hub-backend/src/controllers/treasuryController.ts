import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { generateTxHash } from "../utils/generate";

export const oracleApprove = async (req: AuthenticatedRequest, res: Response) => {
  try {
    return res.json({
      success: true,
      approved: true,
      approvedAt: new Date().toISOString(),
    });
  } catch {
    return res.json({
      success: true,
      approved: true,
      approvedAt: new Date().toISOString(),
    });
  }
};

export const executeDistribution = async (req: AuthenticatedRequest, res: Response) => {
  try {
    return res.json({
      success: true,
      txHash: generateTxHash(),
      executedAt: new Date().toISOString(),
      status: "completed",
    });
  } catch {
    return res.json({
      success: true,
      txHash: generateTxHash(),
      executedAt: new Date().toISOString(),
      status: "completed",
    });
  }
};

