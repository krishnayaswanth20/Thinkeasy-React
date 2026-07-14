export default function AdminComingSoon({ title, note }) {
  return (
    <div>
      <div className="admin-topbar">
        <div>
          <div className="admin-page-title">{title}</div>
          <div className="admin-page-sub">Coming next</div>
        </div>
      </div>
      <div className="admin-card">
        <div className="admin-empty">
          <i className="ti ti-tool" style={{ fontSize: 28, display: 'block', marginBottom: 10 }} />
          {note || `${title} management hasn't been migrated to React yet.`}
        </div>
      </div>
    </div>
  );
}
