import { getDB } from '../db.js';

export function createCandidate(rawText) {
  const db = getDB();
  const stmt = db.prepare('INSERT INTO candidates (raw_text) VALUES (?)');
  const result = stmt.run(rawText);
  return getCandidate(result.lastInsertRowid);
}

export function getCandidate(id) {
  const db = getDB();
  const row = db.prepare('SELECT * FROM candidates WHERE id = ?').get(id);
  if (!row) return null;
  return {
    ...row,
    extracted_data: row.extracted_data ? JSON.parse(row.extracted_data) : null,
    score_justification: row.score_justification ? JSON.parse(row.score_justification) : null,
  };
}

export function getAllCandidates() {
  const db = getDB();
  const rows = db.prepare('SELECT * FROM candidates ORDER BY score DESC').all();
  return rows.map(row => ({
    ...row,
    extracted_data: row.extracted_data ? JSON.parse(row.extracted_data) : null,
    score_justification: row.score_justification ? JSON.parse(row.score_justification) : null,
  }));
}

export function updateCandidateExtraction(id, extractedData) {
  const db = getDB();
  db.prepare('UPDATE candidates SET extracted_data = ? WHERE id = ?')
    .run(JSON.stringify(extractedData), id);
}

export function updateCandidateScore(id, score, justification) {
  const db = getDB();
  db.prepare('UPDATE candidates SET score = ?, score_justification = ? WHERE id = ?')
    .run(score, JSON.stringify(justification), id);
}

export function updateCandidateStatus(id, status) {
  const db = getDB();
  db.prepare('UPDATE candidates SET status = ? WHERE id = ?').run(status, id);
}
