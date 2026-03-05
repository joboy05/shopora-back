import express from 'express';
import * as collectionController from '../controllers/collectionController.js';
import { authenticate, authenticateOptional } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authenticateOptional, collectionController.getAll);
router.get('/:id', authenticateOptional, collectionController.getOne);
router.post('/', authenticate, collectionController.create);
router.put('/:id', authenticate, collectionController.update);
router.delete('/:id', authenticate, collectionController.remove);

export default router;
