import { useState, useEffect, useCallback, useMemo } from 'react';
import CVUpload from '../components/CVUpload.jsx';
import CandidateList from '../components/CandidateList.jsx';
import {
  getBiasAnalysis,
  getCandidates,
  getSuggestionsAnalysis,
} from '../api.js';

const STATUS_TABS = [
  { key: 'new', label: 'NEW' },
  { key: 'accepted', label: 'ACCEPTED' },
  { key: 'rejected', label: 'REJECTED' },
];

export default function CandidatesPage({ profile }) {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeStatus, setActiveStatus] = useState('new');
  const [biasWarnings, setBiasWarnings] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  const refresh = useCallback(async () => {
    setLoading(true);
    const [candidatesResult, biasResult, suggestionsResult] = await Promise.allSettled([
      getCandidates(),
      getBiasAnalysis(),
      getSuggestionsAnalysis(),
    ]);

    if (candidatesResult.status === 'fulfilled') {
      setCandidates(candidatesResult.value);
    } else {
      console.error(candidatesResult.reason);
    }

    if (biasResult.status === 'fulfilled') {
      setBiasWarnings(biasResult.value.warnings || []);
    } else {
      console.error(biasResult.reason);
      setBiasWarnings([]);
    }

    if (suggestionsResult.status === 'fulfilled') {
      setSuggestions(suggestionsResult.value.suggestions || []);
    } else {
      console.error(suggestionsResult.reason);
      setSuggestions([]);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const counts = useMemo(() => {
    return candidates.reduce(
      (acc, candidate) => {
        const status = STATUS_TABS.some(tab => tab.key === candidate.status) ? candidate.status : 'new';
        acc[status] += 1;
        return acc;
      },
      { new: 0, accepted: 0, rejected: 0 }
    );
  }, [candidates]);

  const visibleCandidates = useMemo(
    () => candidates.filter(candidate => candidate.status === activeStatus),
    [activeStatus, candidates]
  );

  return (
    <div>
      {!profile && (
        <div className="error">
          Aucun profil cible défini. Veuillez d'abord créer un profil.
        </div>
      )}

      <div className="section">
        <h2>Importer un CV</h2>
        <CVUpload onUploaded={refresh} />
      </div>

      <div className="section">
        <div className="section-header">
          <div>
            <h2>Candidats ({candidates.length})</h2>
            <p className="section-subtitle">
              Revue segmentée par statut avec scoring visuel et signaux clés.
            </p>
          </div>
        </div>

        <div className="status-tabs" role="tablist" aria-label="Filtrer les candidats par statut">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.key}
              type="button"
              className={activeStatus === tab.key ? 'active' : ''}
              onClick={() => setActiveStatus(tab.key)}
            >
              {tab.label}
              <span className="status-tab-count">{counts[tab.key]}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading">Chargement...</div>
        ) : (
          <CandidateList
            candidates={visibleCandidates}
            onDecision={refresh}
            emptyMessage={getEmptyMessage(activeStatus)}
          />
        )}
      </div>

      <div className="section analytics-section">
        <div className="section-header">
          <div>
            <h2>Analyse & Biais</h2>
            <p className="section-subtitle">
              Signaux déterministes détectés à partir des décisions ACCEPTED / REJECTED.
            </p>
          </div>
        </div>

        {biasWarnings.length > 0 ? (
          <ul className="insight-list insight-list-warning">
            {biasWarnings.map(item => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : (
          <p className="empty-state">Aucun biais évident détecté pour le moment.</p>
        )}
      </div>

      <div className="section analytics-section">
        <div className="section-header">
          <div>
            <h2>Suggestions intelligentes</h2>
            <p className="section-subtitle">
              Tendances observées parmi les profils ACCEPTED.
            </p>
          </div>
        </div>

        {suggestions.length > 0 ? (
          <ul className="insight-list insight-list-suggestion">
            {suggestions.map(item => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : (
          <p className="empty-state">Pas encore assez de profils validés pour générer des suggestions.</p>
        )}
      </div>
    </div>
  );
}

function getEmptyMessage(status) {
  if (status === 'accepted') return 'Aucun candidat ACCEPTED pour le moment.';
  if (status === 'rejected') return 'Aucun candidat REJECTED pour le moment.';
  return 'Aucun candidat NEW pour le moment.';
}
