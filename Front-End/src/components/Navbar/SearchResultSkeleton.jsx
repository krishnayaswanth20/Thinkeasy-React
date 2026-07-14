export default function SearchResultSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '6px 4px' }}>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="te-skel" style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div className="te-skel" style={{ width: `${60 + i * 8}%`, height: 12, marginBottom: 6 }} />
            <div className="te-skel" style={{ width: '35%', height: 10 }} />
          </div>
        </div>
      ))}
    </div>
  );
}
