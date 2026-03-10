import {
  createCandidate,
  getCandidate,
  getAllCandidates,
  updateCandidateExtraction,
  updateCandidateScore,
  updateCandidateStatus,
} from '../models/candidateModel.js';
import { createDecision } from '../models/decisionModel.js';
import { getLatestProfile } from '../models/profileModel.js';
import { extractCV } from '../services/extractCV.js';
import { scoreCandidate } from '../services/scoreCandidate.js';

export async function handleCreateCandidate(req, res) {
  const { raw_text } = req.body;

  if (!raw_text || typeof raw_text !== 'string') {
    return res.status(400).json({ error: 'raw_text est requis.' });
  }

  try {
    const candidate = createCandidate(raw_text);

    // Extract
    const extracted = await extractCV(raw_text);
    updateCandidateExtraction(candidate.id, extracted);

    // Score
    const profile = getLatestProfile();
    const scoring = await scoreCandidate(extracted, profile);
    updateCandidateScore(candidate.id, scoring.score, scoring);

    const updated = getCandidate(candidate.id);
    res.status(201).json(updated);
  } catch (error) {
    console.error('Create candidate error:', error.message);
    res.status(500).json({ error: 'Erreur lors du traitement du CV.' });
  }
}

export function handleGetCandidates(_req, res) {
  const candidates = getAllCandidates();
  res.json(candidates);
}

export function handleGetCandidate(req, res) {
  const candidate = getCandidate(Number(req.params.id));
  if (!candidate) {
    return res.status(404).json({ error: 'Candidat non trouvé.' });
  }
  res.json(candidate);
}

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

  // Re-score all 'new' candidates to reflect updated few-shot learning
  const allCandidates = getAllCandidates();
  const profile = getLatestProfile();
  const newCandidates = allCandidates.filter(c => c.status === 'new' && c.extracted_data);

  for (const c of newCandidates) {
    try {
      const scoring = await scoreCandidate(c.extracted_data, profile);
      updateCandidateScore(c.id, scoring.score, scoring);
    } catch (err) {
      console.error(`Re-scoring candidate ${c.id} failed:`, err.message);
    }
  }

  const updated = getCandidate(Number(id));
  res.json(updated);
}
