import { Router } from 'express';
import axios from 'axios';

const router = Router();

// Circle Gateway integration placeholder
// Replace with actual Circle Gateway API calls

router.post('/transfer', (_req, res) => {
  res.status(501).json({
    error: 'Circle transfer integration not implemented. Connect to Circle Gateway API before using this endpoint.'
  });
});

router.post('/payout', (_req, res) => {
  res.status(501).json({
    error: 'Circle payout integration not implemented. Connect to Circle Gateway API before using this endpoint.'
  });
});

export { router as gatewayRouter };

