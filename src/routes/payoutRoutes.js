import express from 'express';
import { getPayouts, getPayoutSummary } from '../controllers/payoutController.js';

const router = express.Router();

router.get('/', getPayouts);
router.get('/summary', getPayoutSummary);

export default router;
