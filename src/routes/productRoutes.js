import express from 'express';
import { 
    getAll, getOne, create, update, remove, // New names
    listProducts, getProduct, createProduct, updateProduct // Compatibility names
} from '../controllers/productController.js';

const router = express.Router();

// New standard routes
router.get('/', getAll);
router.get('/:id', getOne);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);

// Compatibility aliases
router.patch('/:id', updateProduct);

export default router;
