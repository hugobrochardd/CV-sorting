import { useState, useEffect, useCallback } from 'react';
import CVUpload from '../components/CVUpload.jsx';
import CandidateList from '../components/CandidateList.jsx';
import { getCandidates } from '../api.js';

export default function CandidatesPage({ profile }) {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCandidates();
      setCandidates(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

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
        <h2>Candidats ({candidates.length})</h2>
        {loading ? (
          <div className="loading">Chargement...</div>
        ) : (
          <CandidateList candidates={candidates} onDecision={refresh} />
        )}
      </div>
    </div>
  );
}
