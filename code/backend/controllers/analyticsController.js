import { detectPotentialBiases } from '../services/biasDetectionService.js';
import { getSmartSuggestions } from '../services/suggestionService.js';

export function handleGetBias(_req, res) {
  res.json(detectPotentialBiases());
}

export function handleGetSuggestions(_req, res) {
  res.json(getSmartSuggestions());
}
