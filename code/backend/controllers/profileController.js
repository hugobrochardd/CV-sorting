import { createProfile, getLatestProfile } from '../models/profileModel.js';

export function handleCreateProfile(req, res) {
  const { required_skills, preferred_skills, min_experience } = req.body;

  if (!Array.isArray(required_skills) || !Array.isArray(preferred_skills)) {
    return res.status(400).json({ error: 'required_skills et preferred_skills doivent être des tableaux.' });
  }

  const profile = createProfile({
    required_skills,
    preferred_skills,
    min_experience: Number(min_experience) || 0,
  });

  res.status(201).json(profile);
}

export function handleGetProfile(_req, res) {
  const profile = getLatestProfile();
  if (!profile) {
    return res.status(404).json({ error: 'Aucun profil défini.' });
  }
  res.json(profile);
}
