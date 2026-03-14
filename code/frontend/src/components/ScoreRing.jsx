const SCORE_COLORS = {
  low: '#d64545',
  medium: '#e28b2f',
  strong: '#2f6fdf',
  excellent: '#2d9b62',
  empty: '#c6d0e1',
};

export default function ScoreRing({
  score,
  size = 92,
  strokeWidth = 9,
}) {
  const normalizedScore = Number.isFinite(Number(score))
    ? Math.max(0, Math.min(100, Number(score)))
    : null;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = normalizedScore == null ? 0 : normalizedScore / 100;
  const strokeDashoffset = circumference * (1 - progress);
  const color = getScoreColor(normalizedScore);

  return (
    <div
      className="score-ring"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        '--score-ring-color': color,
      }}
      aria-label={
        normalizedScore == null
          ? 'Score indisponible'
          : `Score candidat ${Math.round(normalizedScore)} sur 100`
      }
    >
      <svg
        className="score-ring-svg"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        <circle
          className="score-ring-track"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <circle
          className="score-ring-progress"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>

      <div className="score-ring-label">
        <span className="score-ring-value">
          {normalizedScore == null ? '—' : Math.round(normalizedScore)}
        </span>
        <span className="score-ring-scale">/100</span>
      </div>
    </div>
  );
}

function getScoreColor(score) {
  if (score == null) return SCORE_COLORS.empty;
  if (score <= 39) return SCORE_COLORS.low;
  if (score <= 69) return SCORE_COLORS.medium;
  if (score <= 84) return SCORE_COLORS.strong;
  return SCORE_COLORS.excellent;
}
