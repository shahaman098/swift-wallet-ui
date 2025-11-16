import { Router } from "express";
import { getEvents } from "../controllers/eventController";
import authMiddleware from "../middleware/authMiddleware";

const router = Router();

router.get("/", authMiddleware, getEvents);

export default router;

