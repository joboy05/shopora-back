import express from 'express';
import { listOrders, createOrder, getOrder, getOrderStats } from '../controllers/orderController.js';

const router = express.Router();

router.get('/', listOrders);
router.get('/stats', getOrderStats);
router.get('/:id', getOrder);
router.post('/', createOrder);

export default router;
