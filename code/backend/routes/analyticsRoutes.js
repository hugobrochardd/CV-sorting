import { Router } from 'express';
import { handleGetBias, handleGetSuggestions } from '../controllers/analyticsController.js';

const router = Router();

router.get('/bias', handleGetBias);
router.get('/suggestions', handleGetSuggestions);

export default router;
