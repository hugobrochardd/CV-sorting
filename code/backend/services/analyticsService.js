import { getLatestDecisionsWithCandidates } from '../models/decisionModel.js';
import { deriveCandidateSignals, getEmptyAnalytics } from './adaptiveScoring.js';

export function getDecisionAnalytics() {
  const rows = getLatestDecisionsWithCandidates();

  const analytics = getEmptyAnalytics();
  const experienceTotals = {
    accepted: { sum: 0, count: 0 },
    rejected: { sum: 0, count: 0 },
  };

  for (const row of rows) {
    const extractedData = row.extracted_data;
    if (!extractedData) continue;

    const signals = deriveCandidateSignals(extractedData);
    const isAccepted = row.decision === 'accepted';
    const skillBucket = isAccepted ? analytics.acceptedSkillFrequency : analytics.rejectedSkillFrequency;
    const stackBucket = isAccepted ? analytics.acceptedStacks : analytics.rejectedStacks;
    const companyTypeBucket = isAccepted ? analytics.acceptedCompanyTypes : analytics.rejectedCompanyTypes;
    const levelBucket = isAccepted ? analytics.levelDistributionAccepted : analytics.levelDistributionRejected;
    const experienceBucket = isAccepted ? experienceTotals.accepted : experienceTotals.rejected;

    incrementFrequencyMap(skillBucket, signals.skills);
    incrementFrequencyMap(stackBucket, [signals.dominantStack]);
    incrementFrequencyMap(companyTypeBucket, [signals.companyType]);
    incrementFrequencyMap(levelBucket, [signals.level]);

    if (signals.yearsOfExperience != null) {
      experienceBucket.sum += signals.yearsOfExperience;
      experienceBucket.count += 1;
    }
  }

  analytics.avgExperienceAccepted = average(experienceTotals.accepted);
  analytics.avgExperienceRejected = average(experienceTotals.rejected);

  return analytics;
}

function incrementFrequencyMap(target, values) {
  for (const value of values) {
    if (!value) continue;
    target[value] = (target[value] || 0) + 1;
  }
}

function average(bucket) {
  if (!bucket.count) return 0;
  return Math.round((bucket.sum / bucket.count) * 10) / 10;
}
