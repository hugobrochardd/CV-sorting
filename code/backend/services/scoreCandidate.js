import {
  computeAdaptiveAdjustment,
  deriveCandidateSignals,
  deriveProfileSignals,
  formatCompanyType,
  formatLevel,
  formatStack,
} from './adaptiveScoring.js';
import { getDecisionAnalytics } from './analyticsService.js';

const DEFAULT_WEIGHTS = {
  requiredSkills: 34,
  preferredSkills: 10,
  experience: 14,
  education: 8,
  stackAlignment: 8,
  frontendDepth: 5,
  backendDepth: 5,
  devopsDepth: 4,
  companyType: 4,
  level: 7,
};

export async function scoreCandidate(extractedData, profile, analytics = null) {
  if (!profile) {
    return {
      score: 0,
      satisfied_criteria: [],
      missing_criteria: ['Aucun profil cible défini'],
      explanation: 'Impossible de scorer : aucun profil cible n\'a été défini.',
    };
  }

  if (!extractedData || extractedData.error) {
    return {
      score: 0,
      satisfied_criteria: [],
      missing_criteria: ['Extraction échouée'],
      explanation: 'Impossible de scorer : l\'extraction des données a échoué.',
    };
  }

  const profileSignals = deriveProfileSignals(profile);
  const candidateSignals = deriveCandidateSignals(extractedData);
  const scoringAnalytics = analytics || getDecisionAnalytics();
  const weights = buildWeights(profileSignals);
  const totalBaseWeight = roundToOneDecimal(sumValues(weights));
  const satisfiedCriteria = [];
  const missingCriteria = [];
  const partiallySatisfied = [];

  const matchedRequiredSkills = intersect(profileSignals.requiredSkills, candidateSignals.skills);
  const missingRequiredSkills = exclude(profileSignals.requiredSkills, matchedRequiredSkills);
  const matchedPreferredSkills = intersect(profileSignals.preferredSkills, candidateSignals.skills);
  const missingPreferredSkills = exclude(profileSignals.preferredSkills, matchedPreferredSkills);
  const matchedFrontendTechnologies = intersect(
    profileSignals.frontendTechnologies,
    candidateSignals.frontendTechnologies
  );
  const matchedBackendTechnologies = intersect(
    profileSignals.backendTechnologies,
    candidateSignals.backendTechnologies
  );
  const matchedDevopsTools = intersect(profileSignals.devopsTools, candidateSignals.devopsTools);

  const requiredSkillsScore =
    profileSignals.requiredSkills.length === 0
      ? weights.requiredSkills
      : roundToOneDecimal(
          weights.requiredSkills *
            (matchedRequiredSkills.length / profileSignals.requiredSkills.length)
        );
  const preferredSkillsScore =
    profileSignals.preferredSkills.length === 0
      ? 0
      : roundToOneDecimal(
          weights.preferredSkills *
            (matchedPreferredSkills.length / profileSignals.preferredSkills.length)
        );
  const experienceScore = computeExperienceBaseScore(
    candidateSignals.yearsOfExperience,
    profileSignals.minExperience,
    weights.experience
  );
  const educationScore = roundToOneDecimal(weights.education * candidateSignals.educationScore);
  const stackAlignmentScore = computeStackAlignmentScore(
    candidateSignals.dominantStack,
    profileSignals.targetStack,
    weights.stackAlignment
  );
  const frontendDepthScore = computeCategoryDepthScore({
    matchedCount: matchedFrontendTechnologies.length,
    candidateCount: candidateSignals.frontendTechnologies.length,
    targetCount: profileSignals.frontendTechnologies.length,
    relevant:
      profileSignals.targetStack === 'frontend' ||
      profileSignals.targetStack === 'fullstack' ||
      profileSignals.frontendTechnologies.length > 0,
    maxWeight: weights.frontendDepth,
  });
  const backendDepthScore = computeCategoryDepthScore({
    matchedCount: matchedBackendTechnologies.length,
    candidateCount: candidateSignals.backendTechnologies.length,
    targetCount: profileSignals.backendTechnologies.length,
    relevant:
      profileSignals.targetStack === 'backend' ||
      profileSignals.targetStack === 'fullstack' ||
      profileSignals.backendTechnologies.length > 0,
    maxWeight: weights.backendDepth,
  });
  const devopsDepthScore = computeCategoryDepthScore({
    matchedCount: matchedDevopsTools.length,
    candidateCount: candidateSignals.devopsTools.length,
    targetCount: profileSignals.devopsTools.length,
    relevant: profileSignals.devopsTools.length > 0 || candidateSignals.devopsTools.length > 0,
    maxWeight: weights.devopsDepth,
  });
  const companyTypeScore = computeCompanyTypeScore(
    candidateSignals.companyType,
    profileSignals.targetCompanyType,
    weights.companyType
  );
  const levelScore = computeLevelScore(
    candidateSignals.level,
    profileSignals.targetLevel,
    weights.level
  );

  const baseScore = roundToOneDecimal(
    requiredSkillsScore +
      preferredSkillsScore +
      experienceScore +
      educationScore +
      stackAlignmentScore +
      frontendDepthScore +
      backendDepthScore +
      devopsDepthScore +
      companyTypeScore +
      levelScore
  );

  const mandatoryMet =
    missingRequiredSkills.length === 0 &&
    (profileSignals.minExperience === 0 ||
      (candidateSignals.yearsOfExperience != null &&
        candidateSignals.yearsOfExperience >= profileSignals.minExperience));

  if (matchedRequiredSkills.length > 0) {
    const label =
      profileSignals.requiredSkills.length === matchedRequiredSkills.length
        ? `${matchedRequiredSkills.length}/${profileSignals.requiredSkills.length} compétences obligatoires validées (${matchedRequiredSkills.join(', ')})`
        : `${matchedRequiredSkills.length}/${profileSignals.requiredSkills.length} compétences obligatoires retrouvées (${matchedRequiredSkills.join(', ')})`;

    if (profileSignals.requiredSkills.length === matchedRequiredSkills.length) {
      satisfiedCriteria.push(label);
    } else {
      partiallySatisfied.push(label);
    }
  } else if (profileSignals.requiredSkills.length === 0) {
    satisfiedCriteria.push('Aucune compétence obligatoire définie');
  }

  if (missingRequiredSkills.length > 0) {
    missingCriteria.push(`Compétences obligatoires manquantes : ${missingRequiredSkills.join(', ')}`);
  }

  if (matchedPreferredSkills.length > 0) {
    const label = `${matchedPreferredSkills.length}/${profileSignals.preferredSkills.length} compétences souhaitées retrouvées (${matchedPreferredSkills.join(', ')})`;
    if (missingPreferredSkills.length === 0) {
      satisfiedCriteria.push(label);
    } else {
      partiallySatisfied.push(label);
    }
  } else if (profileSignals.preferredSkills.length > 0) {
    missingCriteria.push(
      `Aucune compétence souhaitée retrouvée (${profileSignals.preferredSkills.join(', ')})`
    );
  }

  if (candidateSignals.yearsOfExperience == null) {
    missingCriteria.push('Expérience non détectée');
  } else if (
    profileSignals.minExperience === 0 ||
    candidateSignals.yearsOfExperience >= profileSignals.minExperience
  ) {
    satisfiedCriteria.push(
      `Expérience : ${candidateSignals.yearsOfExperience} ans pour un minimum attendu de ${profileSignals.minExperience} ans`
    );
  } else {
    missingCriteria.push(
      `Expérience minimale non atteinte : ${candidateSignals.yearsOfExperience} / ${profileSignals.minExperience} ans`
    );
  }

  if (candidateSignals.education.length > 0) {
    satisfiedCriteria.push(
      `Formation détectée (${candidateSignals.educationLabel}) : ${candidateSignals.education.join(', ')}`
    );
  } else {
    partiallySatisfied.push('Formation non précisée');
  }

  addStackMessages({
    candidateStack: candidateSignals.dominantStack,
    targetStack: profileSignals.targetStack,
    score: stackAlignmentScore,
    maxWeight: weights.stackAlignment,
    satisfiedCriteria,
    partiallySatisfied,
    missingCriteria,
  });

  addTechnologyMessages({
    label: 'Technologies frontend',
    targetValues: profileSignals.frontendTechnologies,
    matchedValues: matchedFrontendTechnologies,
    candidateValues: candidateSignals.frontendTechnologies,
    satisfiedCriteria,
    partiallySatisfied,
    missingCriteria,
  });
  addTechnologyMessages({
    label: 'Technologies backend',
    targetValues: profileSignals.backendTechnologies,
    matchedValues: matchedBackendTechnologies,
    candidateValues: candidateSignals.backendTechnologies,
    satisfiedCriteria,
    partiallySatisfied,
    missingCriteria,
  });
  addTechnologyMessages({
    label: 'Outils DevOps / cloud',
    targetValues: profileSignals.devopsTools,
    matchedValues: matchedDevopsTools,
    candidateValues: candidateSignals.devopsTools,
    satisfiedCriteria,
    partiallySatisfied,
    missingCriteria,
  });

  addCompanyTypeMessages({
    candidateCompanyType: candidateSignals.companyType,
    targetCompanyType: profileSignals.targetCompanyType,
    satisfiedCriteria,
    missingCriteria,
    partiallySatisfied,
  });

  addLevelMessages({
    candidateLevel: candidateSignals.level,
    targetLevel: profileSignals.targetLevel,
    score: levelScore,
    maxWeight: weights.level,
    satisfiedCriteria,
    missingCriteria,
    partiallySatisfied,
  });

  const adaptive = computeAdaptiveAdjustment(extractedData, scoringAnalytics);
  const finalScore = Math.max(0, Math.min(100, Math.round(baseScore + adaptive.adaptiveScore)));

  const adaptiveCriteria = adaptive.adjustments.map(adjustment =>
    `${adjustment.delta > 0 ? 'Bonus' : 'Malus'} ${adjustment.delta > 0 ? '+' : ''}${adjustment.delta} : ${adjustment.reason}`
  );
  const adaptiveBonuses = adaptiveCriteria.filter(item => item.startsWith('Bonus'));
  const adaptiveMaluses = adaptiveCriteria.filter(item => item.startsWith('Malus'));

  const explanation = buildExplanation({
    baseScore,
    adaptiveScore: adaptive.adaptiveScore,
    finalScore,
    mandatoryMet,
    adaptiveCriteria,
    totalBaseWeight,
  });

  return {
    score: finalScore,
    satisfied_criteria: [...satisfiedCriteria, ...adaptiveBonuses],
    missing_criteria: missingCriteria,
    partially_satisfied: [...partiallySatisfied, ...adaptiveMaluses],
    mandatory_met: mandatoryMet,
    explanation,
    base_score: baseScore,
    adaptive_score: adaptive.adaptiveScore,
    base_score_details: [
      detail(
        'Compétences obligatoires',
        requiredSkillsScore,
        weights.requiredSkills,
        matchedRequiredSkills.length
          ? `${matchedRequiredSkills.length}/${profileSignals.requiredSkills.length || 0}`
          : '0'
      ),
      detail(
        'Compétences souhaitées',
        preferredSkillsScore,
        weights.preferredSkills,
        matchedPreferredSkills.length
          ? `${matchedPreferredSkills.length}/${profileSignals.preferredSkills.length || 0}`
          : '0'
      ),
      detail(
        'Expérience',
        experienceScore,
        weights.experience,
        candidateSignals.yearsOfExperience == null
          ? 'non détectée'
          : `${candidateSignals.yearsOfExperience} ans`
      ),
      detail('Formation', educationScore, weights.education, candidateSignals.educationLabel),
      detail(
        'Stack dominante',
        stackAlignmentScore,
        weights.stackAlignment,
        candidateSignals.dominantStack ? formatStack(candidateSignals.dominantStack) : 'non définie'
      ),
      detail(
        'Technologies frontend',
        frontendDepthScore,
        weights.frontendDepth,
        describeCategoryDetail(matchedFrontendTechnologies, profileSignals.frontendTechnologies, candidateSignals.frontendTechnologies)
      ),
      detail(
        'Technologies backend',
        backendDepthScore,
        weights.backendDepth,
        describeCategoryDetail(matchedBackendTechnologies, profileSignals.backendTechnologies, candidateSignals.backendTechnologies)
      ),
      detail(
        'DevOps / cloud',
        devopsDepthScore,
        weights.devopsDepth,
        describeCategoryDetail(matchedDevopsTools, profileSignals.devopsTools, candidateSignals.devopsTools)
      ),
      detail(
        'Type d\'entreprise',
        companyTypeScore,
        weights.companyType,
        candidateSignals.companyType ? formatCompanyType(candidateSignals.companyType) : 'non détecté'
      ),
      detail(
        'Niveau',
        levelScore,
        weights.level,
        candidateSignals.level ? formatLevel(candidateSignals.level) : 'non estimé'
      ),
    ],
    adaptive_adjustments: adaptive.adjustments,
    influential_factors: adaptive.influentialFactors,
    detected_dimensions: {
      stack: candidateSignals.dominantStack,
      companyType: candidateSignals.companyType,
      level: candidateSignals.level,
      frontendTechnologies: candidateSignals.frontendTechnologies,
      backendTechnologies: candidateSignals.backendTechnologies,
      devopsTools: candidateSignals.devopsTools,
    },
  };
}

function buildWeights(profileSignals) {
  const configuredWeights = profileSignals.criteriaWeights || {};
  const weights = {
    ...DEFAULT_WEIGHTS,
    ...Object.fromEntries(
      Object.entries(configuredWeights).filter(([, value]) => Number.isFinite(value) && value > 0)
    ),
  };

  if (!profileSignals.targetCompanyType) {
    weights.companyType = 0;
  }

  if (!profileSignals.targetLevel) {
    weights.level = 0;
  }

  return weights;
}

function computeExperienceBaseScore(yearsOfExperience, minExperience, maxWeight) {
  if (yearsOfExperience == null) return 0;

  if (minExperience <= 0) {
    return roundToOneDecimal(Math.min(maxWeight, yearsOfExperience * 2.5));
  }

  return roundToOneDecimal(Math.min(maxWeight, (yearsOfExperience / minExperience) * maxWeight));
}

function computeStackAlignmentScore(candidateStack, targetStack, maxWeight) {
  if (!candidateStack) return 0;
  if (!targetStack) return roundToOneDecimal(maxWeight / 2);
  if (candidateStack === targetStack) return maxWeight;
  if (candidateStack === 'fullstack' && ['frontend', 'backend'].includes(targetStack)) {
    return roundToOneDecimal(maxWeight * 0.75);
  }
  if (targetStack === 'fullstack' && ['frontend', 'backend'].includes(candidateStack)) {
    return roundToOneDecimal(maxWeight * 0.6);
  }
  if (candidateStack === 'devops' && targetStack === 'backend') {
    return roundToOneDecimal(maxWeight * 0.4);
  }
  return 0;
}

function computeCategoryDepthScore({
  matchedCount,
  candidateCount,
  targetCount,
  relevant,
  maxWeight,
}) {
  if (!relevant || candidateCount === 0) return 0;

  if (targetCount > 0) {
    return roundToOneDecimal(Math.min(maxWeight, (matchedCount / targetCount) * maxWeight));
  }

  return roundToOneDecimal(Math.min(maxWeight, (candidateCount / 2) * maxWeight));
}

function computeCompanyTypeScore(candidateCompanyType, targetCompanyType, maxWeight) {
  if (!targetCompanyType || !candidateCompanyType) return 0;
  return candidateCompanyType === targetCompanyType ? maxWeight : 0;
}

function computeLevelScore(candidateLevel, targetLevel, maxWeight) {
  if (!targetLevel || !candidateLevel) return 0;

  const candidateIndex = levelIndex(candidateLevel);
  const targetIndex = levelIndex(targetLevel);
  if (candidateIndex == null || targetIndex == null) return 0;

  const difference = Math.abs(candidateIndex - targetIndex);
  if (difference === 0) return maxWeight;
  if (difference === 1) return roundToOneDecimal(maxWeight / 2);
  return 0;
}

function buildExplanation({
  baseScore,
  adaptiveScore,
  finalScore,
  mandatoryMet,
  adaptiveCriteria,
  totalBaseWeight,
}) {
  const parts = [
    `Base score ${baseScore}/${totalBaseWeight}`,
    `ajustement adaptatif ${adaptiveScore > 0 ? '+' : ''}${adaptiveScore}`,
    `score final ${finalScore}/100`,
  ];

  if (!mandatoryMet) {
    parts.push('critères obligatoires non satisfaits, profil à écarter malgré le score');
  }

  if (adaptiveCriteria.length > 0) {
    parts.push(adaptiveCriteria.slice(0, 3).join(' | '));
  } else {
    parts.push('aucun ajustement adaptatif significatif');
  }

  return parts.join(' | ');
}

function detail(criterion, score, weight, detailValue) {
  return {
    criterion,
    score: roundToOneDecimal(score),
    weight,
    detail: detailValue,
  };
}

function addStackMessages({
  candidateStack,
  targetStack,
  score,
  maxWeight,
  satisfiedCriteria,
  partiallySatisfied,
  missingCriteria,
}) {
  if (candidateStack) {
    const target = targetStack ? formatStack(targetStack) : 'non défini';
    const message = `Stack dominante ${formatStack(candidateStack)} (cible ${target})`;

    if (!targetStack || score >= maxWeight * 0.75) {
      satisfiedCriteria.push(message);
      return;
    }

    if (score > 0) {
      partiallySatisfied.push(message);
      return;
    }

    missingCriteria.push(message);
    return;
  }

  partiallySatisfied.push('Stack dominante non détectée');
}

function addTechnologyMessages({
  label,
  targetValues,
  matchedValues,
  candidateValues,
  satisfiedCriteria,
  partiallySatisfied,
  missingCriteria,
}) {
  if (targetValues.length === 0) {
    if (candidateValues.length > 0) {
      satisfiedCriteria.push(`${label} détectées : ${candidateValues.join(', ')}`);
    }
    return;
  }

  if (matchedValues.length > 0) {
    const message = `${label} retrouvées : ${matchedValues.length}/${targetValues.length} (${matchedValues.join(', ')})`;
    if (matchedValues.length === targetValues.length) {
      satisfiedCriteria.push(message);
    } else {
      partiallySatisfied.push(message);
    }
  }

  const missingValues = exclude(targetValues, matchedValues);
  if (missingValues.length > 0) {
    missingCriteria.push(`${label} manquantes : ${missingValues.join(', ')}`);
  }
}

function addCompanyTypeMessages({
  candidateCompanyType,
  targetCompanyType,
  satisfiedCriteria,
  missingCriteria,
  partiallySatisfied,
}) {
  if (targetCompanyType) {
    const expected = formatCompanyType(targetCompanyType);
    if (!candidateCompanyType) {
      missingCriteria.push(`Type d'entreprise attendu non détecté (${expected})`);
      return;
    }

    if (candidateCompanyType === targetCompanyType) {
      satisfiedCriteria.push(`Type d'entreprise aligné : ${expected}`);
      return;
    }

    missingCriteria.push(
      `Type d'entreprise attendu ${expected}, détecté ${formatCompanyType(candidateCompanyType)}`
    );
    return;
  }

  if (candidateCompanyType) {
    partiallySatisfied.push(
      `Type d'entreprise détecté : ${formatCompanyType(candidateCompanyType)}`
    );
  }
}

function addLevelMessages({
  candidateLevel,
  targetLevel,
  score,
  maxWeight,
  satisfiedCriteria,
  missingCriteria,
  partiallySatisfied,
}) {
  if (targetLevel) {
    const expected = formatLevel(targetLevel);

    if (!candidateLevel) {
      missingCriteria.push(`Niveau attendu non estimé (${expected})`);
      return;
    }

    const message = `Niveau estimé ${formatLevel(candidateLevel)} (cible ${expected})`;
    if (score >= maxWeight) {
      satisfiedCriteria.push(message);
      return;
    }

    if (score > 0) {
      partiallySatisfied.push(message);
      return;
    }

    missingCriteria.push(message);
    return;
  }

  if (candidateLevel) {
    partiallySatisfied.push(`Niveau estimé : ${formatLevel(candidateLevel)}`);
  }
}

function describeCategoryDetail(matchedValues, targetValues, candidateValues) {
  if (targetValues.length > 0) {
    return `${matchedValues.length}/${targetValues.length} cibles (${matchedValues.join(', ') || 'aucune'})`;
  }

  return candidateValues.join(', ') || 'aucune';
}

function intersect(left, right) {
  return left.filter(value => right.includes(value));
}

function exclude(left, right) {
  return left.filter(value => !right.includes(value));
}

function levelIndex(level) {
  if (level === 'junior') return 0;
  if (level === 'confirme') return 1;
  if (level === 'senior') return 2;
  return null;
}

function sumValues(values) {
  return Object.values(values).reduce((sum, value) => sum + value, 0);
}

function roundToOneDecimal(value) {
  return Math.round(value * 10) / 10;
}
