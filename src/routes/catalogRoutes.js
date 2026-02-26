import express from 'express';
import { getCatalogs, createCatalog, updateCatalog, deleteCatalog } from '../controllers/catalogController.js';

const router = express.Router();

router.get('/', getCatalogs);
router.post('/', createCatalog);
router.patch('/:id', updateCatalog);
router.delete('/:id', deleteCatalog);

export default router;
