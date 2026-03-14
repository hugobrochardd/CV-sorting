import { getLatestDecisionsWithCandidates } from '../models/decisionModel.js';
import { deriveCandidateSignals, formatLevel, formatStack } from './adaptiveScoring.js';

const MIN_SKILL_RATIO = 0.5;
const MIN_CATEGORY_RATIO = 0.5;

export function getSmartSuggestions() {
  const acceptedCandidates = getLatestDecisionsWithCandidates().filter(
    row => row.decision === 'accepted' && row.extracted_data
  );

  if (acceptedCandidates.length === 0) {
    return { suggestions: [] };
  }

  const skillFrequency = {};
  const stackFrequency = {};
  const levelFrequency = {};
  const companyTypeFrequency = {};

  for (const row of acceptedCandidates) {
    const signals = deriveCandidateSignals(row.extracted_data);
    incrementMany(skillFrequency, signals.skills);
    incrementOne(stackFrequency, signals.dominantStack);
    incrementOne(levelFrequency, signals.level);
    incrementOne(companyTypeFrequency, signals.companyType);
  }

  const suggestions = [];
  const totalAccepted = acceptedCandidates.length;
  const leadingSkills = Object.entries(skillFrequency)
    .filter(([, count]) => count / totalAccepted >= MIN_SKILL_RATIO)
    .sort(([, left], [, right]) => right - left)
    .slice(0, 2);

  for (const [skill] of leadingSkills) {
    suggestions.push(`Les profils validés ont souvent ${skill}`);
  }

  const dominantStack = getDominantValue(stackFrequency, totalAccepted, MIN_CATEGORY_RATIO);
  if (dominantStack) {
    suggestions.push(`La majorité des profils validés sont ${formatStack(dominantStack)}`);
  }

  const dominantLevel = getDominantValue(levelFrequency, totalAccepted, MIN_CATEGORY_RATIO);
  if (dominantLevel) {
    suggestions.push(`Le niveau ${capitalize(formatLevel(dominantLevel))} est dominant`);
  }

  const dominantCompanyType = getDominantValue(
    companyTypeFrequency,
    totalAccepted,
    MIN_CATEGORY_RATIO
  );
  if (dominantCompanyType) {
    suggestions.push(companyTypeSuggestion(dominantCompanyType));
  }

  return { suggestions: suggestions.slice(0, 6) };
}

function incrementMany(target, values) {
  for (const value of values) {
    incrementOne(target, value);
  }
}

function incrementOne(target, value) {
  if (!value) return;
  target[value] = (target[value] || 0) + 1;
}

function getDominantValue(distribution, total, minRatio) {
  const [value, count] =
    Object.entries(distribution).sort(([, left], [, right]) => right - left)[0] || [];

  if (!value || !count || total <= 0) return null;
  if (count / total < minRatio) return null;

  return value;
}

function companyTypeSuggestion(companyType) {
  if (companyType === 'startup') {
    return 'Les profils validés viennent souvent de startups';
  }

  if (companyType === 'corporate') {
    return 'Les profils validés viennent souvent de grands groupes';
  }

  return null;
}

function capitalize(value) {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}
