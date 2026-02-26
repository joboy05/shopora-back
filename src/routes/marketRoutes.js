import express from 'express';
import { getMarkets, createMarket, updateMarket, deleteMarket } from '../controllers/marketController.js';

const router = express.Router();

router.get('/', getMarkets);
router.post('/', createMarket);
router.patch('/:id', updateMarket);
router.delete('/:id', deleteMarket);

export default router;
