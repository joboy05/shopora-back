import express from 'express';
import * as collectionController from '../controllers/collectionController.js';

const router = express.Router();

router.get('/', collectionController.getAll);
router.get('/:id', collectionController.getOne);
router.post('/', collectionController.create);
router.put('/:id', collectionController.update);
router.delete('/:id', collectionController.remove);

export default router;
