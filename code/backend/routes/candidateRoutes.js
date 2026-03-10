import { Router } from 'express';
import {
  handleCreateCandidate,
  handleGetCandidates,
  handleGetCandidate,
  handleDecision,
} from '../controllers/candidateController.js';

const router = Router();

router.post('/', handleCreateCandidate);
router.get('/', handleGetCandidates);
router.get('/:id', handleGetCandidate);
router.post('/:id/decision', handleDecision);

export default router;
