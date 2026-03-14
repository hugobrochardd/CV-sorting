import CandidateDetail from './CandidateDetail.jsx';

export default function CandidateList({ candidates, onDecision, emptyMessage }) {
  if (candidates.length === 0) {
    return <p className="empty-state">{emptyMessage || 'Aucun candidat importé.'}</p>;
  }

  return (
    <div className="candidate-list">
      {candidates.map(candidate => (
        <CandidateDetail key={candidate.id} candidate={candidate} onDecision={onDecision} />
      ))}
    </div>
  );
}
