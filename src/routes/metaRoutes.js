import express from 'express';
import { 
  listDefinitions, createDefinition, 
  listEntries, createEntry,
  getMetafields, createMetafield
} from '../controllers/metaController.js';

const router = express.Router();

// Definitions
router.get('/definitions', listDefinitions);
router.post('/definitions', createDefinition);

// Entries
router.get('/entries/:type', listEntries);
router.post('/entries', createEntry);

// Metafields
router.get('/metafields', getMetafields);
router.post('/metafields', createMetafield);

export default router;
