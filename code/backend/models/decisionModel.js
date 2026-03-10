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

export function getAllDecisionsWithCandidates() {
  const db = getDB();
  const rows = db.prepare(`
    SELECT d.decision, c.extracted_data, c.score
    FROM decisions d
    JOIN candidates c ON d.candidate_id = c.id
    WHERE c.extracted_data IS NOT NULL
    ORDER BY d.created_at DESC
    LIMIT 10
  `).all();

  return rows.map(row => ({
    decision: row.decision,
    score: row.score,
    extracted_data: row.extracted_data ? JSON.parse(row.extracted_data) : null,
  }));
}
