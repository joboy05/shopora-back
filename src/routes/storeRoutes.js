import express from 'express';
import { getStoreInfo, updateStoreInfo } from '../controllers/storeController.js';

const router = express.Router();

router.get('/', getStoreInfo);
router.patch('/', updateStoreInfo);

export default router;
