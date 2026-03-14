import {
  getAllCandidates,
  getCandidate,
  updateCandidateScore,
  updateCandidateStatus,
} from '../models/candidateModel.js';
import { createDecision } from '../models/decisionModel.js';
import { getLatestProfile } from '../models/profileModel.js';
import { getDecisionAnalytics } from '../services/analyticsService.js';
import { scoreCandidate } from '../services/scoreCandidate.js';

export async function handleDecision(req, res) {
  const { id } = req.params;
  const { decision } = req.body;

  if (!['accepted', 'rejected'].includes(decision)) {
    return res.status(400).json({ error: 'decision doit être "accepted" ou "rejected".' });
  }

  const candidate = getCandidate(Number(id));
  if (!candidate) {
    return res.status(404).json({ error: 'Candidat non trouvé.' });
  }

  createDecision(Number(id), decision);
  updateCandidateStatus(Number(id), decision);

  await rescoreNewCandidates();

  const updated = getCandidate(Number(id));
  res.json(updated);
}

async function rescoreNewCandidates() {
  const profile = getLatestProfile();
  if (!profile) return;

  const analytics = getDecisionAnalytics();
  const newCandidates = getAllCandidates().filter(
    candidate => candidate.status === 'new' && candidate.extracted_data
  );

  for (const candidate of newCandidates) {
    try {
      const scoring = await scoreCandidate(candidate.extracted_data, profile, analytics);
      updateCandidateScore(candidate.id, scoring.score, scoring);
    } catch (error) {
      console.error(`Re-scoring candidate ${candidate.id} failed:`, error.message);
    }
  }
}
