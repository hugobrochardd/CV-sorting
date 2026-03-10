import { useState } from 'react';
import { makeDecision } from '../api.js';

export default function CandidateDetail({ candidate, onDecision }) {
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleDecision = async (decision) => {
    setLoading(true);
    try {
      await makeDecision(candidate.id, decision);
      onDecision();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const justification = candidate.score_justification;
  const extracted = candidate.extracted_data;

  return (
    <div className="candidate-card">
      <div className="header">
        <div>
          <span className="score">{candidate.score ?? '—'}</span>
          <span>/100</span>
        </div>
        <span className={`status ${candidate.status}`}>{candidate.status}</span>
      </div>

      {extracted && (
        <div>
          <p><strong>{extracted.summary || 'Pas de résumé'}</strong></p>
          {extracted.skills?.length > 0 && (
            <div className="tags">
              {extracted.skills.map((s, i) => <span key={i} className="tag">{s}</span>)}
            </div>
          )}
          <p style={{ fontSize: '13px', marginTop: '6px', color: '#666' }}>
            Expérience : {extracted.years_of_experience ?? '?'} ans
            {extracted.education?.length > 0 && ` | Formation : ${extracted.education.join(', ')}`}
          </p>
        </div>
      )}

      <button
        style={{ marginTop: '10px', fontSize: '12px', background: 'none', border: 'none', color: '#1a1a2e', textDecoration: 'underline', cursor: 'pointer', padding: 0 }}
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? 'Masquer les détails' : 'Voir les détails'}
      </button>

      {expanded && justification && (
        <div style={{ marginTop: '10px', fontSize: '13px' }}>
          <p><strong>Explication :</strong> {justification.explanation}</p>

          {justification.satisfied_criteria?.length > 0 && (
            <>
              <p className="satisfied"><strong>Critères satisfaits :</strong></p>
              <ul className="criteria-list">
                {justification.satisfied_criteria.map((c, i) => (
                  <li key={i} className="satisfied">{c}</li>
                ))}
              </ul>
            </>
          )}

          {justification.missing_criteria?.length > 0 && (
            <>
              <p className="missing"><strong>Critères manquants :</strong></p>
              <ul className="criteria-list">
                {justification.missing_criteria.map((c, i) => (
                  <li key={i} className="missing">{c}</li>
                ))}
              </ul>
            </>
          )}

          {justification.partially_satisfied?.length > 0 && (
            <>
              <p className="partial"><strong>Critères partiels :</strong></p>
              <ul className="criteria-list">
                {justification.partially_satisfied.map((c, i) => (
                  <li key={i} className="partial">{c}</li>
                ))}
              </ul>
            </>
          )}

          {justification.mandatory_met === false && (
            <p className="missing" style={{ marginTop: '8px' }}>
              ⚠ Critères obligatoires non satisfaits — score plafonné.
            </p>
          )}
        </div>
      )}

      {candidate.status === 'new' && (
        <div style={{ marginTop: '12px' }}>
          <button className="btn-accept" onClick={() => handleDecision('accepted')} disabled={loading}>
            Accepter
          </button>
          <button className="btn-reject" onClick={() => handleDecision('rejected')} disabled={loading}>
            Rejeter
          </button>
        </div>
      )}
    </div>
  );
}
