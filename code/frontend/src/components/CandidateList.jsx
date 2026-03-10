import CandidateDetail from './CandidateDetail.jsx';

export default function CandidateList({ candidates, onDecision }) {
  if (candidates.length === 0) {
    return <p>Aucun candidat importé.</p>;
  }

  return (
    <div>
      {candidates.map(candidate => (
        <CandidateDetail key={candidate.id} candidate={candidate} onDecision={onDecision} />
      ))}
    </div>
  );
}
