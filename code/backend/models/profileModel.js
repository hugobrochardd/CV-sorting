import { getDB } from '../db.js';

const STACK_VALUES = ['frontend', 'backend', 'fullstack', 'devops'];
const COMPANY_TYPE_VALUES = ['startup', 'corporate'];
const LEVEL_VALUES = ['junior', 'confirme', 'senior'];
const WEIGHT_KEYS = [
  'requiredSkills',
  'preferredSkills',
  'experience',
  'education',
  'stackAlignment',
  'frontendDepth',
  'backendDepth',
  'devopsDepth',
  'companyType',
  'level',
];

export function createProfile(input) {
  const db = getDB();
  const profile = normalizeProfilePayload(input);
  const stmt = db.prepare(`
    INSERT INTO profiles (
      required_skills,
      preferred_skills,
      min_experience,
      expected_stack,
      expected_company_type,
      expected_level,
      backend_technologies,
      frontend_technologies,
      devops_tools,
      criteria_weights
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    JSON.stringify(profile.required_skills),
    JSON.stringify(profile.preferred_skills),
    profile.min_experience,
    profile.expected_stack,
    profile.expected_company_type,
    profile.expected_level,
    JSON.stringify(profile.backend_technologies),
    JSON.stringify(profile.frontend_technologies),
    JSON.stringify(profile.devops_tools),
    JSON.stringify(profile.criteria_weights)
  );

  return getProfile(result.lastInsertRowid);
}

export function getProfile(id) {
  const db = getDB();
  const row = db.prepare('SELECT * FROM profiles WHERE id = ?').get(id);
  if (!row) return null;
  return mapProfileRow(row);
}

export function getLatestProfile() {
  const db = getDB();
  const row = db.prepare('SELECT * FROM profiles ORDER BY id DESC LIMIT 1').get();
  if (!row) return null;
  return mapProfileRow(row);
}

export function normalizeProfilePayload(input = {}) {
  return {
    required_skills: sanitizeStringArray(readField(input, 'required_skills', 'requiredSkills')),
    preferred_skills: sanitizeStringArray(readField(input, 'preferred_skills', 'preferredSkills')),
    min_experience: normalizeMinExperience(readField(input, 'min_experience', 'minExperience')),
    expected_stack: normalizeExpectedValue(
      readField(input, 'expected_stack', 'expectedStack'),
      STACK_VALUES
    ),
    expected_company_type: normalizeExpectedValue(
      readField(input, 'expected_company_type', 'expectedCompanyType'),
      COMPANY_TYPE_VALUES
    ),
    expected_level: normalizeLevel(readField(input, 'expected_level', 'expectedLevel')),
    backend_technologies: sanitizeStringArray(
      readField(input, 'backend_technologies', 'backendTechnologies')
    ),
    frontend_technologies: sanitizeStringArray(
      readField(input, 'frontend_technologies', 'frontendTechnologies')
    ),
    devops_tools: sanitizeStringArray(readField(input, 'devops_tools', 'devopsTools')),
    criteria_weights: sanitizeCriteriaWeights(
      readField(input, 'criteria_weights', 'criteriaWeights')
    ),
  };
}

function mapProfileRow(row) {
  const requiredSkills = parseJsonArray(row.required_skills);
  const preferredSkills = parseJsonArray(row.preferred_skills);
  const backendTechnologies = parseJsonArray(row.backend_technologies);
  const frontendTechnologies = parseJsonArray(row.frontend_technologies);
  const devopsTools = parseJsonArray(row.devops_tools);
  const criteriaWeights = parseJsonObject(row.criteria_weights);
  const minExperience = normalizeMinExperience(row.min_experience);
  const expectedStack = normalizeExpectedValue(row.expected_stack, STACK_VALUES);
  const expectedCompanyType = normalizeExpectedValue(
    row.expected_company_type,
    COMPANY_TYPE_VALUES
  );
  const expectedLevel = normalizeLevel(row.expected_level);

  return {
    ...row,
    required_skills: requiredSkills,
    preferred_skills: preferredSkills,
    min_experience: minExperience,
    expected_stack: expectedStack,
    expected_company_type: expectedCompanyType,
    expected_level: expectedLevel,
    backend_technologies: backendTechnologies,
    frontend_technologies: frontendTechnologies,
    devops_tools: devopsTools,
    criteria_weights: criteriaWeights,
    requiredSkills,
    preferredSkills,
    minExperience,
    expectedStack,
    expectedCompanyType,
    expectedLevel,
    backendTechnologies,
    frontendTechnologies,
    devopsTools,
    criteriaWeights,
  };
}

function readField(source, snakeCaseKey, camelCaseKey) {
  if (Object.prototype.hasOwnProperty.call(source, snakeCaseKey)) {
    return source[snakeCaseKey];
  }

  return camelCaseKey ? source[camelCaseKey] : undefined;
}

function sanitizeStringArray(values) {
  if (!Array.isArray(values)) return [];

  return [...new Set(
    values
      .filter(value => typeof value === 'string')
      .map(value => value.trim())
      .filter(Boolean)
  )];
}

function normalizeMinExperience(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.round(parsed * 10) / 10;
}

function normalizeExpectedValue(value, allowedValues) {
  if (value == null) return null;

  const normalized = String(value).trim().toLowerCase();
  if (!normalized || ['any', 'all', 'peu importe'].includes(normalized)) {
    return null;
  }

  return allowedValues.includes(normalized) ? normalized : null;
}

function normalizeLevel(value) {
  if (value == null) return null;

  const normalized = String(value)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (!normalized || ['any', 'all', 'peu importe'].includes(normalized)) {
    return null;
  }

  if (normalized === 'confirme') return 'confirme';
  return LEVEL_VALUES.includes(normalized) ? normalized : null;
}

function sanitizeCriteriaWeights(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    WEIGHT_KEYS
      .map(key => [key, Number(value[key])])
      .filter(([, weight]) => Number.isFinite(weight) && weight > 0)
  );
}

function parseJsonArray(value) {
  try {
    const parsed = JSON.parse(value || '[]');
    return sanitizeStringArray(parsed);
  } catch {
    return [];
  }
}

function parseJsonObject(value) {
  try {
    return sanitizeCriteriaWeights(JSON.parse(value || '{}'));
  } catch {
    return {};
  }
}
