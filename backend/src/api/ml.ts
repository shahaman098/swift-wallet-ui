import { Router } from 'express';

const router = Router();

router.get('/orgs/:orgId/recommendations', (_req, res) => {
  res.status(501).json({
    error: 'ML recommendations are not implemented. Connect the ML service before using this endpoint.'
  });
});

router.post('/evaluate-cycle', (_req, res) => {
  res.status(501).json({
    error: 'Cycle evaluation is not implemented. Connect the ML service before using this endpoint.'
  });
});

export { router as mlRouter };

