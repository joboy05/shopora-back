import express from 'express';
import { getAll, getOne, create, update } from '../controllers/customerController.js';

const router = express.Router();

router.get('/', getAll);
router.get('/:id', getOne);
router.post('/', create);
router.put('/:id', update);

export default router;
