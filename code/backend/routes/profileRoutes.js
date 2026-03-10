import { Router } from 'express';
import { handleCreateProfile, handleGetProfile } from '../controllers/profileController.js';

const router = Router();

router.post('/', handleCreateProfile);
router.get('/', handleGetProfile);

export default router;
