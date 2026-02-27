import express from 'express';
import { getAll, getOne, updateStatus, getStats } from '../controllers/orderController.js';

const router = express.Router();

router.get('/', getAll);
router.get('/stats', getStats);
router.get('/:id', getOne);
router.patch('/:id/status', updateStatus);

export default router;
