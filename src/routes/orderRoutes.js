import express from 'express';
import { 
    getAll, getOne, updateStatus, getStats, // New names
    listOrders, getOrder, createOrder, getOrderStats // Compatibility names
} from '../controllers/orderController.js';

const router = express.Router();

// New standard routes
router.get('/', getAll);
router.get('/stats', getStats);
router.get('/:id', getOne);
router.patch('/:id/status', updateStatus);

// Compatibility aliases
router.post('/', createOrder);

export default router;
