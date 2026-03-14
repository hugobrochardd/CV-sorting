import { getLatestDecisionsWithCandidates } from '../models/decisionModel.js';
import { deriveCandidateSignals, formatLevel, formatStack } from './adaptiveScoring.js';

const MIN_SAMPLE_SIZE = 2;

export function detectPotentialBiases() {
  const decisions = getLatestDecisionsWithCandidates();
  const distributions = {
    levels: {},
    companyTypes: {},
    stacks: {},
  };

  for (const row of decisions) {
    if (!row.extracted_data) continue;

    const signals = deriveCandidateSignals(row.extracted_data);
    registerDecision(distributions.levels, signals.level, row.decision);
    registerDecision(distributions.companyTypes, signals.companyType, row.decision);
    registerDecision(distributions.stacks, signals.dominantStack, row.decision);
  }

  const warnings = [
    ...buildWarnings(distributions.levels, describeLevel),
    ...buildWarnings(distributions.companyTypes, describeCompanyType),
    ...buildWarnings(distributions.stacks, describeStack),
  ].slice(0, 6);

  return { warnings };
}

function registerDecision(target, value, decision) {
  if (!value || !['accepted', 'rejected'].includes(decision)) return;

  if (!target[value]) {
    target[value] = { accepted: 0, rejected: 0, total: 0 };
  }

  target[value][decision] += 1;
  target[value].total += 1;
}

function buildWarnings(distribution, describeValue) {
  return Object.entries(distribution)
    .filter(([, stats]) =>
      stats.total >= MIN_SAMPLE_SIZE &&
      (stats.accepted === stats.total || stats.rejected === stats.total)
    )
    .sort(([, left], [, right]) => right.total - left.total)
    .map(([value, stats]) => {
      const label = describeValue(value);
      if (!label) return null;

      if (stats.rejected === stats.total) {
        return `Vous avez rejeté 100% des profils ${label}`;
      }

      return `Tous les profils ${label} ont été acceptés`;
    })
    .filter(Boolean);
}

function describeLevel(level) {
  return capitalize(formatLevel(level));
}

function describeCompanyType(companyType) {
  if (companyType === 'startup') return 'Startup';
  if (companyType === 'corporate') return 'Corporate';
  return null;
}

function describeStack(stack) {
  const label = formatStack(stack);
  return label === 'non definie' ? null : label;
}

function capitalize(value) {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}
