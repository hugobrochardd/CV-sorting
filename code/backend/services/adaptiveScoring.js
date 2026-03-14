const FRONTEND_TECHNOLOGIES = [
  { canonical: 'React', aliases: ['react', 'react.js'] },
  { canonical: 'Redux', aliases: ['redux'] },
  { canonical: 'Next.js', aliases: ['next.js', 'nextjs'] },
  { canonical: 'Vue.js', aliases: ['vue', 'vue.js'] },
  { canonical: 'Nuxt', aliases: ['nuxt', 'nuxt.js'] },
  { canonical: 'Angular', aliases: ['angular', 'angularjs'] },
  { canonical: 'Svelte', aliases: ['svelte'] },
  { canonical: 'JavaScript', aliases: ['javascript'] },
  { canonical: 'TypeScript', aliases: ['typescript'] },
  { canonical: 'HTML', aliases: ['html', 'html5'] },
  { canonical: 'CSS', aliases: ['css', 'css3'] },
  { canonical: 'Sass', aliases: ['sass', 'scss'] },
  { canonical: 'Tailwind CSS', aliases: ['tailwind', 'tailwind css'] },
  { canonical: 'Bootstrap', aliases: ['bootstrap'] },
];

const BACKEND_TECHNOLOGIES = [
  { canonical: 'Node.js', aliases: ['node', 'node.js', 'nodejs'] },
  { canonical: 'Express', aliases: ['express', 'express.js'] },
  { canonical: 'NestJS', aliases: ['nestjs', 'nest.js'] },
  { canonical: 'Python', aliases: ['python'] },
  { canonical: 'Django', aliases: ['django'] },
  { canonical: 'Flask', aliases: ['flask'] },
  { canonical: 'FastAPI', aliases: ['fastapi', 'fast api'] },
  { canonical: 'Java', aliases: ['java'] },
  { canonical: 'Spring', aliases: ['spring', 'spring boot'] },
  { canonical: 'PHP', aliases: ['php'] },
  { canonical: 'Laravel', aliases: ['laravel'] },
  { canonical: 'Symfony', aliases: ['symfony'] },
  { canonical: 'Ruby', aliases: ['ruby'] },
  { canonical: 'Ruby on Rails', aliases: ['ruby on rails', 'rails'] },
  { canonical: 'Go', aliases: ['golang'] },
  { canonical: 'C#', aliases: ['c#', 'csharp'] },
  { canonical: '.NET', aliases: ['.net', 'dotnet', 'asp.net'] },
  { canonical: 'SQL', aliases: ['sql'] },
  { canonical: 'MySQL', aliases: ['mysql'] },
  { canonical: 'PostgreSQL', aliases: ['postgresql', 'postgres'] },
  { canonical: 'MongoDB', aliases: ['mongodb', 'mongo'] },
  { canonical: 'Redis', aliases: ['redis'] },
];

const DEVOPS_TOOLS = [
  { canonical: 'Docker', aliases: ['docker'] },
  { canonical: 'Kubernetes', aliases: ['kubernetes', 'k8s'] },
  { canonical: 'AWS', aliases: ['aws', 'amazon web services'] },
  { canonical: 'GCP', aliases: ['gcp', 'google cloud'] },
  { canonical: 'Azure', aliases: ['azure'] },
  { canonical: 'Terraform', aliases: ['terraform'] },
  { canonical: 'Ansible', aliases: ['ansible'] },
  { canonical: 'Jenkins', aliases: ['jenkins'] },
  { canonical: 'GitHub Actions', aliases: ['github actions'] },
  { canonical: 'GitLab CI', aliases: ['gitlab ci', 'gitlab-ci'] },
  { canonical: 'CI/CD', aliases: ['ci/cd', 'cicd', 'ci cd'] },
  { canonical: 'Helm', aliases: ['helm'] },
  { canonical: 'Nginx', aliases: ['nginx'] },
];

const ALL_TECHNOLOGIES = [
  ...FRONTEND_TECHNOLOGIES,
  ...BACKEND_TECHNOLOGIES,
  ...DEVOPS_TOOLS,
];

const CANONICAL_LABEL_BY_ALIAS = ALL_TECHNOLOGIES.reduce((acc, entry) => {
  for (const alias of entry.aliases) {
    acc[normalizeString(alias)] = entry.canonical;
  }
  acc[normalizeString(entry.canonical)] = entry.canonical;
  return acc;
}, {});

export function deriveCandidateSignals(candidate) {
  const skills = sanitizeStringArray(candidate?.skills);
  const education = sanitizeStringArray(candidate?.education);
  const environment = sanitizeStringArray(candidate?.environment);
  const summary = typeof candidate?.summary === 'string' ? candidate.summary.trim() : '';
  const yearsOfExperience = normalizeExperience(candidate?.years_of_experience);

  const skillLabels = getCanonicalSkillLabels(skills);
  const frontendTechnologies = collectTechnologies(skills, FRONTEND_TECHNOLOGIES);
  const backendTechnologies = collectTechnologies(skills, BACKEND_TECHNOLOGIES);
  const devopsTools = collectTechnologies(skills, DEVOPS_TOOLS);
  const dominantStack = inferDominantStack({
    frontendCount: frontendTechnologies.length,
    backendCount: backendTechnologies.length,
    devopsCount: devopsTools.length,
    summary,
  });
  const companyType = inferCompanyType(environment, summary);
  const level = inferLevel(yearsOfExperience);
  const educationProfile = inferEducationProfile(education);

  return {
    skills: skillLabels,
    frontendTechnologies,
    backendTechnologies,
    devopsTools,
    dominantStack,
    companyType,
    level,
    yearsOfExperience,
    education,
    educationScore: educationProfile.score,
    educationLabel: educationProfile.label,
    summary,
  };
}

export function deriveProfileSignals(profile) {
  const requiredSkills = sanitizeStringArray(profile?.required_skills || profile?.requiredSkills);
  const preferredSkills = sanitizeStringArray(profile?.preferred_skills || profile?.preferredSkills);
  const explicitFrontendTechnologies = sanitizeStringArray(
    profile?.frontend_technologies || profile?.frontendTechnologies
  );
  const explicitBackendTechnologies = sanitizeStringArray(
    profile?.backend_technologies || profile?.backendTechnologies
  );
  const explicitDevopsTools = sanitizeStringArray(profile?.devops_tools || profile?.devopsTools);
  const allSkills = [...requiredSkills, ...preferredSkills];
  const inferredFrontendTechnologies = collectTechnologies(allSkills, FRONTEND_TECHNOLOGIES);
  const inferredBackendTechnologies = collectTechnologies(allSkills, BACKEND_TECHNOLOGIES);
  const inferredDevopsTools = collectTechnologies(allSkills, DEVOPS_TOOLS);

  const frontendTechnologies = unique([
    ...collectTechnologies(explicitFrontendTechnologies, FRONTEND_TECHNOLOGIES),
    ...inferredFrontendTechnologies,
  ]);
  const backendTechnologies = unique([
    ...collectTechnologies(explicitBackendTechnologies, BACKEND_TECHNOLOGIES),
    ...inferredBackendTechnologies,
  ]);
  const devopsTools = unique([
    ...collectTechnologies(explicitDevopsTools, DEVOPS_TOOLS),
    ...inferredDevopsTools,
  ]);

  const targetStack =
    normalizeProfileStack(profile?.expected_stack || profile?.expectedStack) ||
    inferDominantStack({
      frontendCount: frontendTechnologies.length,
      backendCount: backendTechnologies.length,
      devopsCount: devopsTools.length,
      summary: '',
    });

  return {
    requiredSkills: getCanonicalSkillLabels(requiredSkills),
    preferredSkills: getCanonicalSkillLabels(preferredSkills),
    frontendTechnologies,
    backendTechnologies,
    devopsTools,
    targetStack,
    targetCompanyType: normalizeProfileCompanyType(
      profile?.expected_company_type || profile?.expectedCompanyType
    ),
    targetLevel: normalizeProfileLevel(profile?.expected_level || profile?.expectedLevel),
    minExperience: Math.max(
      0,
      Number(profile?.min_experience ?? profile?.minExperience) || 0
    ),
    criteriaWeights:
      profile?.criteria_weights ||
      profile?.criteriaWeights ||
      {},
  };
}

export function computeAdaptiveAdjustment(candidate, analytics) {
  const signals = isDerivedSignals(candidate) ? candidate : deriveCandidateSignals(candidate);
  const safeAnalytics = analytics || getEmptyAnalytics();
  const adjustments = [];

  const skillAdjustment = computeSkillAdjustments(signals.skills, safeAnalytics);
  adjustments.push(...skillAdjustment.adjustments);

  const stackAdjustment = computeDiscreteAdjustment({
    value: signals.dominantStack,
    acceptedFrequency: safeAnalytics.acceptedStacks,
    rejectedFrequency: safeAnalytics.rejectedStacks,
    majorityWeight: 8,
    positiveWeight: 4,
    negativeWeight: -4,
    label: value => `Stack ${formatStack(value)}`,
    positiveReason: value => `${formatStack(value)} dominante chez les profils validés`,
    negativeReason: value => `${formatStack(value)} sur-représentée parmi les profils rejetés`,
  });
  if (stackAdjustment) adjustments.push(stackAdjustment);

  const companyAdjustment = computeDiscreteAdjustment({
    value: signals.companyType,
    acceptedFrequency: safeAnalytics.acceptedCompanyTypes,
    rejectedFrequency: safeAnalytics.rejectedCompanyTypes,
    majorityWeight: 4,
    positiveWeight: 2,
    negativeWeight: -2,
    label: value => `Type d'entreprise ${formatCompanyType(value)}`,
    positiveReason: value => `Profils issus de ${formatCompanyType(value)} davantage validés`,
    negativeReason: value => `${formatCompanyType(value)} davantage observé dans les rejets`,
  });
  if (companyAdjustment) adjustments.push(companyAdjustment);

  const experienceAdjustment = computeExperienceAdjustment(signals.yearsOfExperience, safeAnalytics);
  if (experienceAdjustment) adjustments.push(experienceAdjustment);

  const levelAdjustment = computeDiscreteAdjustment({
    value: signals.level,
    acceptedFrequency: safeAnalytics.levelDistributionAccepted,
    rejectedFrequency: safeAnalytics.levelDistributionRejected,
    majorityWeight: 5,
    positiveWeight: 3,
    negativeWeight: -3,
    label: value => `Niveau ${formatLevel(value)}`,
    positiveReason: value => `${formatLevel(value)} dominant parmi les profils validés`,
    negativeReason: value => `${formatLevel(value)} davantage associé aux rejets`,
  });
  if (levelAdjustment) adjustments.push(levelAdjustment);

  const adaptiveScore = roundToOneDecimal(
    adjustments.reduce((sum, adjustment) => sum + adjustment.delta, 0)
  );
  const influentialFactors = adjustments
    .slice()
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, 5)
    .map(adjustment => formatSignedAdjustment(adjustment.delta, adjustment.reason));

  return {
    adaptiveScore,
    adjustments,
    influentialFactors,
    candidateSignals: signals,
  };
}

export function getEmptyAnalytics() {
  return {
    acceptedSkillFrequency: {},
    rejectedSkillFrequency: {},
    acceptedStacks: {},
    rejectedStacks: {},
    acceptedCompanyTypes: {},
    rejectedCompanyTypes: {},
    avgExperienceAccepted: 0,
    avgExperienceRejected: 0,
    levelDistributionAccepted: {},
    levelDistributionRejected: {},
  };
}

export function formatStack(stack) {
  if (stack === 'fullstack') return 'Fullstack';
  if (stack === 'frontend') return 'Frontend';
  if (stack === 'backend') return 'Backend';
  if (stack === 'devops') return 'DevOps';
  return 'non definie';
}

export function formatCompanyType(companyType) {
  if (companyType === 'startup') return 'startup';
  if (companyType === 'corporate') return 'corporate';
  return 'non defini';
}

export function formatLevel(level) {
  if (level === 'junior') return 'junior';
  if (level === 'confirme') return 'confirmé';
  if (level === 'senior') return 'senior';
  return 'non estime';
}

function computeSkillAdjustments(skills, analytics) {
  const rawAdjustments = skills.map(skill => {
    const accepted = analytics.acceptedSkillFrequency[skill] || 0;
    const rejected = analytics.rejectedSkillFrequency[skill] || 0;
    const evidence = accepted + rejected;

    if (evidence === 0) return null;

    const delta = Math.max(-5, Math.min(5, roundToOneDecimal((accepted - rejected) * 1.5)));
    if (delta === 0) return null;

    return {
      label: `Competence ${skill}`,
      delta,
      reason:
        delta > 0
          ? `${skill} fortement corrélée aux acceptations`
          : `${skill} davantage corrélée aux rejets`,
      source: 'skills',
    };
  }).filter(Boolean);

  const cappedAdjustments = [];
  let runningTotal = 0;

  for (const adjustment of rawAdjustments.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))) {
    if (runningTotal >= 10 && adjustment.delta > 0) continue;
    if (runningTotal <= -10 && adjustment.delta < 0) continue;

    const remainingCap = adjustment.delta > 0 ? 10 - runningTotal : -10 - runningTotal;
    const allowedDelta =
      adjustment.delta > 0
        ? Math.min(adjustment.delta, remainingCap)
        : Math.max(adjustment.delta, remainingCap);

    if (allowedDelta === 0) continue;

    cappedAdjustments.push({
      ...adjustment,
      delta: roundToOneDecimal(allowedDelta),
    });
    runningTotal = roundToOneDecimal(runningTotal + allowedDelta);
  }

  return {
    adjustments: cappedAdjustments,
    total: runningTotal,
  };
}

function computeDiscreteAdjustment({
  value,
  acceptedFrequency,
  rejectedFrequency,
  majorityWeight,
  positiveWeight,
  negativeWeight,
  label,
  positiveReason,
  negativeReason,
}) {
  if (!value) return null;

  const acceptedCount = acceptedFrequency[value] || 0;
  const rejectedCount = rejectedFrequency[value] || 0;
  const majorityAccepted = getDominantKey(acceptedFrequency);
  const evidence = acceptedCount + rejectedCount;
  const confidenceMultiplier = getConfidenceMultiplier(evidence);

  let delta = 0;
  if (majorityAccepted && value === majorityAccepted && acceptedCount > 0) {
    delta = majorityWeight;
  } else if (acceptedCount > rejectedCount) {
    delta = positiveWeight;
  } else if (rejectedCount > acceptedCount) {
    delta = negativeWeight;
  }

  delta = roundToOneDecimal(delta * confidenceMultiplier);
  if (delta === 0) return null;

  return {
    label: label(value),
    delta,
    reason: delta > 0 ? positiveReason(value) : negativeReason(value),
    source: 'history',
  };
}

function computeExperienceAdjustment(yearsOfExperience, analytics) {
  if (yearsOfExperience == null || analytics.avgExperienceAccepted <= 0) return null;

  const diff = yearsOfExperience - analytics.avgExperienceAccepted;
  const delta = Math.max(-6, Math.min(6, roundToOneDecimal(diff * 1.5)));

  if (delta === 0) return null;

  return {
    label: "Experience",
    delta,
    reason:
      delta > 0
        ? "Experience superieure a la moyenne des profils valides"
        : "Experience inferieure a la moyenne des profils valides",
    source: 'experience',
  };
}

function inferDominantStack({ frontendCount, backendCount, devopsCount, summary }) {
  const summaryValue = normalizeString(summary);

  if (summaryValue.includes('full stack') || summaryValue.includes('fullstack')) {
    return 'fullstack';
  }
  if (summaryValue.includes('frontend') || summaryValue.includes('front end')) {
    return 'frontend';
  }
  if (summaryValue.includes('backend') || summaryValue.includes('back end')) {
    return 'backend';
  }
  if (summaryValue.includes('devops')) {
    return 'devops';
  }

  if (frontendCount > 0 && backendCount > 0) {
    const difference = Math.abs(frontendCount - backendCount);
    if (difference <= 1) return 'fullstack';
    return frontendCount > backendCount ? 'frontend' : 'backend';
  }
  if (backendCount > 0) return 'backend';
  if (frontendCount > 0) return 'frontend';
  if (devopsCount > 0) return 'devops';
  return null;
}

function inferCompanyType(environment, summary) {
  const haystack = [...environment, summary].map(normalizeString).filter(Boolean);

  if (haystack.some(value => value.includes('startup'))) return 'startup';
  if (haystack.some(value => value.includes('grand groupe') || value.includes('corporate'))) {
    return 'corporate';
  }
  return null;
}

function inferLevel(yearsOfExperience) {
  if (yearsOfExperience == null) return null;
  if (yearsOfExperience < 2) return 'junior';
  if (yearsOfExperience < 6) return 'confirme';
  return 'senior';
}

function inferEducationProfile(education) {
  const values = education.map(normalizeString);

  if (values.some(value => value.includes('doctorat') || value.includes('phd'))) {
    return { score: 1, label: 'doctorat' };
  }
  if (
    values.some(
      value =>
        value.includes('master') ||
        value.includes('msc') ||
        value.includes('ingenieur') ||
        value.includes("ecole d'ingenieur")
    )
  ) {
    return { score: 1, label: 'master' };
  }
  if (
    values.some(
      value =>
        value.includes('licence') ||
        value.includes('bachelor') ||
        value.includes('but') ||
        value.includes('universite')
    )
  ) {
    return { score: 0.75, label: 'licence' };
  }
  if (
    values.some(
      value =>
        value.includes('dut') ||
        value.includes('bts') ||
        value.includes('bootcamp') ||
        value.includes('titre professionnel')
    )
  ) {
    return { score: 0.55, label: 'formation professionnalisante' };
  }
  if (values.length > 0) {
    return { score: 0.4, label: 'formation mentionnee' };
  }
  return { score: 0, label: 'non precisee' };
}

function collectTechnologies(skills, catalog) {
  const normalizedSkills = skills.map(normalizeString).filter(Boolean);

  return unique(
    catalog
      .filter(entry => entry.aliases.some(alias => normalizedSkills.some(skill => matchesAlias(skill, alias))))
      .map(entry => entry.canonical)
  );
}

function getCanonicalSkillLabels(skills) {
  return unique(
    skills
      .map(skill => {
        const normalized = normalizeString(skill);
        return CANONICAL_LABEL_BY_ALIAS[normalized] || normalizeSkillLabel(skill);
      })
      .filter(Boolean)
  );
}

function normalizeSkillLabel(skill) {
  const value = typeof skill === 'string' ? skill.trim() : '';
  if (!value) return '';
  return value
    .split(/\s+/)
    .map(token => {
      const lowerToken = token.toLowerCase();
      if (['js', 'css', 'html', 'sql', 'aws', 'gcp', 'php'].includes(lowerToken)) {
        return lowerToken.toUpperCase();
      }
      return token.charAt(0).toUpperCase() + token.slice(1);
    })
    .join(' ');
}

function matchesAlias(skill, alias) {
  const normalizedAlias = normalizeString(alias);
  if (skill === normalizedAlias) return true;

  const skillTokens = tokenize(skill);
  const aliasTokens = tokenize(normalizedAlias);

  if (aliasTokens.length === 0) return false;
  if (aliasTokens.length === 1) {
    return skillTokens.includes(aliasTokens[0]);
  }

  const skillValue = skillTokens.join(' ');
  const aliasValue = aliasTokens.join(' ');
  return skillValue.includes(aliasValue);
}

function sanitizeStringArray(values) {
  if (!Array.isArray(values)) return [];
  return values
    .filter(value => typeof value === 'string' && value.trim().length > 0)
    .map(value => value.trim());
}

function normalizeProfileStack(value) {
  const normalized = normalizeString(value);
  if (['frontend', 'backend', 'fullstack', 'devops'].includes(normalized)) {
    return normalized;
  }
  return null;
}

function normalizeProfileCompanyType(value) {
  const normalized = normalizeString(value);
  if (normalized === 'startup' || normalized === 'corporate') {
    return normalized;
  }
  return null;
}

function normalizeProfileLevel(value) {
  const normalized = normalizeString(value);
  if (normalized === 'junior' || normalized === 'senior') {
    return normalized;
  }
  if (normalized === 'confirme' || normalized === 'confirmee') {
    return 'confirme';
  }
  return null;
}

function normalizeExperience(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null;
}

function normalizeString(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9+#.\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(value) {
  return normalizeString(value)
    .replace(/[+#.]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function unique(values) {
  return [...new Set(values)];
}

function isDerivedSignals(candidate) {
  return Boolean(
    candidate &&
      Array.isArray(candidate.frontendTechnologies) &&
      Array.isArray(candidate.backendTechnologies) &&
      Array.isArray(candidate.devopsTools)
  );
}

function getDominantKey(frequency) {
  return Object.entries(frequency || {}).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
}

function getConfidenceMultiplier(evidence) {
  if (evidence <= 1) return 0.5;
  if (evidence === 2) return 0.75;
  return 1;
}

function roundToOneDecimal(value) {
  return Math.round(value * 10) / 10;
}

function formatSignedAdjustment(delta, reason) {
  const rounded = roundToOneDecimal(delta);
  return `${rounded > 0 ? 'Bonus' : 'Malus'} ${rounded > 0 ? '+' : ''}${rounded} : ${reason}`;
}
