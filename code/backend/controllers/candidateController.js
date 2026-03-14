import {
  getAllCandidates,
  getCandidate,
} from '../models/candidateModel.js';
import { processCandidateFromRawText } from '../services/processCandidate.js';

export async function handleCreateCandidate(req, res) {
  const { raw_text } = req.body;

  if (!raw_text || typeof raw_text !== 'string') {
    return res.status(400).json({ error: 'raw_text est requis.' });
  }

  try {
    const candidate = await processCandidateFromRawText(raw_text);
    res.status(201).json(candidate);
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
