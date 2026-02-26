import express from 'express';
import { getTaxRules, createTaxRule, updateTaxRule, deleteTaxRule } from '../controllers/taxRuleController.js';

const router = express.Router();

router.get('/', getTaxRules);
router.post('/', createTaxRule);
router.put('/:id', updateTaxRule);
router.delete('/:id', deleteTaxRule);

export default router;
