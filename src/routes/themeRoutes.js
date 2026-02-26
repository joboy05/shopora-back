import express from 'express';
import { getThemes, createTheme, updateTheme, publishTheme, deleteTheme } from '../controllers/themeController.js';

const router = express.Router();

router.get('/', getThemes);
router.post('/', createTheme);
router.put('/:id', updateTheme);
router.post('/:id/publish', publishTheme);
router.delete('/:id', deleteTheme);

export default router;
