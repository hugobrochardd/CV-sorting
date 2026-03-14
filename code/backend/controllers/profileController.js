import {
  createProfile,
  getLatestProfile,
  normalizeProfilePayload,
} from '../models/profileModel.js';

export function handleCreateProfile(req, res) {
  const profileInput = normalizeProfilePayload(req.body);

  if (!isArrayField(req.body, 'required_skills', 'requiredSkills')) {
    return res.status(400).json({
      error: 'required_skills doit être un tableau.',
    });
  }

  if (!isArrayField(req.body, 'preferred_skills', 'preferredSkills')) {
    return res.status(400).json({
      error: 'preferred_skills doit être un tableau.',
    });
  }

  if (!isArrayField(req.body, 'backend_technologies', 'backendTechnologies')) {
    return res.status(400).json({
      error: 'backend_technologies doit être un tableau.',
    });
  }

  if (!isArrayField(req.body, 'frontend_technologies', 'frontendTechnologies')) {
    return res.status(400).json({
      error: 'frontend_technologies doit être un tableau.',
    });
  }

  if (!isArrayField(req.body, 'devops_tools', 'devopsTools')) {
    return res.status(400).json({
      error: 'devops_tools doit être un tableau.',
    });
  }

  const profile = createProfile(profileInput);

  res.status(201).json(profile);
}

export function handleGetProfile(_req, res) {
  const profile = getLatestProfile();
  if (!profile) {
    return res.status(404).json({ error: 'Aucun profil défini.' });
  }
  res.json(profile);
}

function isArrayField(body, snakeCaseKey, camelCaseKey) {
  if (!body || typeof body !== 'object') return true;
  if (Object.prototype.hasOwnProperty.call(body, snakeCaseKey)) {
    return Array.isArray(body[snakeCaseKey]);
  }
  if (Object.prototype.hasOwnProperty.call(body, camelCaseKey)) {
    return Array.isArray(body[camelCaseKey]);
  }
  return true;
}
