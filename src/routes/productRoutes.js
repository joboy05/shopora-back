import express from 'express';
import { 
    getAll, getOne, create, update, remove, updateInventory, // New names
    listProducts, getProduct, createProduct, updateProduct // Compatibility names
} from '../controllers/productController.js';
import { authenticate, authenticateOptional } from '../middleware/authMiddleware.js';

const router = express.Router();

// New standard routes
router.get('/', authenticateOptional, getAll);
router.get('/:id', authenticateOptional, getOne);
router.post('/', authenticate, create);
router.put('/:id', authenticate, update);
router.delete('/:id', authenticate, remove);
router.patch('/:productId/variants/:variantId/inventory', authenticate, updateInventory);

// Compatibility aliases
router.patch('/:id', authenticate, updateProduct);

export default router;
