import { Router } from "express";
import { getActivity, getBalance } from "../controllers/walletController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.use(authMiddleware);

router.get("/balance", getBalance);
router.get("/activity", getActivity);

export default router;

