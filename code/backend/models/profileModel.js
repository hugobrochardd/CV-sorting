import { getDB } from '../db.js';

export function createProfile({ required_skills, preferred_skills, min_experience }) {
  const db = getDB();
  const stmt = db.prepare(`
    INSERT INTO profiles (required_skills, preferred_skills, min_experience)
    VALUES (?, ?, ?)
  `);
  const result = stmt.run(
    JSON.stringify(required_skills),
    JSON.stringify(preferred_skills),
    min_experience
  );
  return getProfile(result.lastInsertRowid);
}

export function getProfile(id) {
  const db = getDB();
  const row = db.prepare('SELECT * FROM profiles WHERE id = ?').get(id);
  if (!row) return null;
  return {
    ...row,
    required_skills: JSON.parse(row.required_skills),
    preferred_skills: JSON.parse(row.preferred_skills),
  };
}

export function getLatestProfile() {
  const db = getDB();
  const row = db.prepare('SELECT * FROM profiles ORDER BY id DESC LIMIT 1').get();
  if (!row) return null;
  return {
    ...row,
    required_skills: JSON.parse(row.required_skills),
    preferred_skills: JSON.parse(row.preferred_skills),
  };
}
