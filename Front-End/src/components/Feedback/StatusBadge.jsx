import { STATUS_DOT, STATUS_CLASS } from '../../utils/feedbackShared';

export default function StatusBadge({ status }) {
  return (
    <span className={`fb-sbadge ${STATUS_CLASS[status] || 's-under-review'}`}>
      {STATUS_DOT[status] || '⚪'} {status}
    </span>
  );
}
