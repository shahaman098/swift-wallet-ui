import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = jwt.verify(token, env.jwtSecret) as { userId: string };
        req.userId = decoded.userId;
      } catch {
        req.userId = `user_${Date.now()}`;
      }
    } else {
      req.userId = `user_${Date.now()}`;
    }
    
    return next();
  } catch {
    req.userId = `user_${Date.now()}`;
    return next();
  }
};

export default authMiddleware;

