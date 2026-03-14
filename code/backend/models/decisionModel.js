import { getDB } from '../db.js';

export function createDecision(candidateId, decision) {
  const db = getDB();
  const stmt = db.prepare('INSERT INTO decisions (candidate_id, decision) VALUES (?, ?)');
  stmt.run(candidateId, decision);
}

export function getDecisionsForCandidate(candidateId) {
  const db = getDB();
  return db.prepare('SELECT * FROM decisions WHERE candidate_id = ? ORDER BY created_at DESC').all(candidateId);
}

export function getLatestDecisionsWithCandidates() {
  const db = getDB();
  const rows = db.prepare(`
    SELECT d.decision, c.id AS candidate_id, c.extracted_data, c.score
    FROM decisions d
    JOIN (
      SELECT candidate_id, MAX(id) AS latest_decision_id
      FROM decisions
      GROUP BY candidate_id
    ) latest ON latest.latest_decision_id = d.id
    JOIN candidates c ON d.candidate_id = c.id
    WHERE c.extracted_data IS NOT NULL
    ORDER BY d.created_at DESC
  `).all();

  return rows.map(row => ({
    candidate_id: row.candidate_id,
    decision: row.decision,
    score: row.score,
    extracted_data: row.extracted_data ? JSON.parse(row.extracted_data) : null,
  }));
}

export function getAllDecisionsWithCandidates() {
  return getLatestDecisionsWithCandidates();
}
