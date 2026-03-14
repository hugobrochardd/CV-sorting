import {
  createCandidate,
  getCandidate,
  updateCandidateExtraction,
  updateCandidateScore,
} from '../models/candidateModel.js';
import { getLatestProfile } from '../models/profileModel.js';
import { extractCV } from './extractCV.js';
import { scoreCandidate } from './scoreCandidate.js';

export async function processCandidateFromRawText(rawText) {
  const candidate = createCandidate(rawText);
  const extracted = await extractCV(rawText);
  updateCandidateExtraction(candidate.id, extracted);

  const profile = getLatestProfile();
  const scoring = await scoreCandidate(extracted, profile);
  updateCandidateScore(candidate.id, scoring.score, scoring);

  return getCandidate(candidate.id);
}
