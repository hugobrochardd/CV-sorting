import { useState } from 'react';
import { makeDecision } from '../api.js';
import ScoreRing from './ScoreRing.jsx';

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

  const justification = candidate.score_justification || {};
  const extracted = candidate.extracted_data || {};
  const dimensions = justification.detected_dimensions || {};
  const strongSignals = (justification.satisfied_criteria || [])
    .filter(item => !item.startsWith('Bonus'))
    .slice(0, 2);
  const bonusSignals = (justification.satisfied_criteria || [])
    .filter(item => item.startsWith('Bonus'))
    .slice(0, 2);
  const malusSignals = (justification.partially_satisfied || [])
    .filter(item => item.startsWith('Malus'))
    .slice(0, 2);
  const detailGroups = [
    {
      title: 'Critères satisfaits',
      items: justification.satisfied_criteria || [],
      tone: 'satisfied',
    },
    {
      title: 'Critères partiels',
      items: justification.partially_satisfied || [],
      tone: 'partial',
    },
    {
      title: 'Critères manquants',
      items: justification.missing_criteria || [],
      tone: 'missing',
    },
  ].filter(group => group.items.length > 0);

  return (
    <article className="candidate-card">
      <div className="candidate-card-top">
        <ScoreRing score={candidate.score} />

        <div className="candidate-card-main">
          <div className="candidate-card-header">
            <span className={`status ${candidate.status}`}>{formatStatus(candidate.status)}</span>
            <span className="candidate-caption">Score adaptatif global</span>
          </div>

          <h3 className="candidate-title">{extracted.summary || 'Profil sans résumé structuré.'}</h3>

          <div className="candidate-badges">
            {renderBadge('Stack', formatStack(dimensions.stack))}
            {renderBadge('Niveau', formatLevel(dimensions.level))}
            {renderBadge('Entreprise', formatCompanyType(dimensions.companyType))}
            {renderBadge('Expérience', formatExperience(extracted.years_of_experience))}
          </div>
        </div>
      </div>

      {extracted.skills?.length > 0 && (
        <div className="tags">
          {extracted.skills.map((skill, index) => (
            <span key={`${skill}-${index}`} className="tag">
              {skill}
            </span>
          ))}
        </div>
      )}

      {(strongSignals.length > 0 || bonusSignals.length > 0 || malusSignals.length > 0) && (
        <div className="candidate-signal-grid">
          {strongSignals.length > 0 && (
            <div className="signal-card signal-card-positive">
              <p className="signal-title">Critères validés</p>
              <ul className="signal-list">
                {strongSignals.map(item => (
                  <li key={item} className="signal-item satisfied">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(bonusSignals.length > 0 || malusSignals.length > 0) && (
            <div className="signal-card signal-card-adaptive">
              <p className="signal-title">Bonus / Malus</p>
              <div className="adaptive-chip-list">
                {bonusSignals.map(item => (
                  <span key={item} className="adaptive-chip adaptive-chip-bonus">
                    {item}
                  </span>
                ))}
                {malusSignals.map(item => (
                  <span key={item} className="adaptive-chip adaptive-chip-malus">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {extracted.education?.length > 0 && (
        <p className="candidate-education">
          Formation : {extracted.education.join(', ')}
        </p>
      )}

      <button className="link-button candidate-toggle" onClick={() => setExpanded(!expanded)}>
        {expanded ? 'Masquer les détails' : 'Voir les détails'}
      </button>

      {expanded && (
        <div className="candidate-details">
          {justification.explanation && (
            <p className="candidate-explanation">
              <strong>Explication :</strong> {justification.explanation}
            </p>
          )}

          <div className="criteria-columns">
            {detailGroups.map(group => (
              <div key={group.title} className="criteria-panel">
                <p className={`criteria-panel-title ${group.tone}`}>{group.title}</p>
                <ul className="criteria-list">
                  {group.items.map(item => (
                    <li key={item} className={group.tone}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {justification.mandatory_met === false && (
            <p className="mandatory-warning">
              Critères obligatoires non satisfaits, score plafonné.
            </p>
          )}
        </div>
      )}

      {candidate.status === 'new' && (
        <div className="candidate-actions">
          <button className="btn-accept" onClick={() => handleDecision('accepted')} disabled={loading}>
            Accepter
          </button>
          <button className="btn-reject" onClick={() => handleDecision('rejected')} disabled={loading}>
            Rejeter
          </button>
        </div>
      )}
    </article>
  );
}

function renderBadge(label, value) {
  if (!value) return null;

  return (
    <span className="meta-badge">
      <strong>{label}</strong>
      <span>{value}</span>
    </span>
  );
}

function formatStatus(status) {
  if (status === 'accepted') return 'ACCEPTED';
  if (status === 'rejected') return 'REJECTED';
  return 'NEW';
}

function formatStack(value) {
  if (value === 'frontend') return 'Frontend';
  if (value === 'backend') return 'Backend';
  if (value === 'fullstack') return 'Fullstack';
  if (value === 'devops') return 'DevOps';
  return null;
}

function formatLevel(value) {
  if (value === 'junior') return 'Junior';
  if (value === 'confirme') return 'Confirmé';
  if (value === 'senior') return 'Senior';
  return null;
}

function formatCompanyType(value) {
  if (value === 'startup') return 'Startup';
  if (value === 'corporate') return 'Corporate';
  return null;
}

function formatExperience(value) {
  if (!Number.isFinite(value)) return null;
  return `${value} ans`;
}
