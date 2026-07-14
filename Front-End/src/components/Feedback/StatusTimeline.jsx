import { timeAgoShort } from '../../utils/feedbackShared';

// The backend records a full status_history table server-side, but
// doesn't expose a GET endpoint for it — so this timeline is built only
// from the fields the public /feedback/:id item actually returns
// (created_at, status, updated_at, admin_response/admin_response_at),
// not a fabricated multi-step audit trail.
export default function StatusTimeline({ item }) {
  const steps = [
    { label: 'Submitted', at: item.created_at, done: true },
    { label: `Status: ${item.status}`, at: item.updated_at || item.created_at, done: true },
  ];
  if (item.admin_response) {
    steps.push({ label: 'Team responded', at: item.admin_response_at || item.updated_at, done: true });
  }

  return (
    <div className="fbc-timeline">
      {steps.map((s, i) => (
        <div key={i} className="fbc-timeline-step">
          <span className="fbc-timeline-dot" />
          <span className="fbc-timeline-label">{s.label}</span>
          <span className="fbc-timeline-date">{timeAgoShort(s.at)}</span>
        </div>
      ))}
    </div>
  );
}
