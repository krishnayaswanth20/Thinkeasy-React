export default function PageFallback() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="te-skel" style={{ width: 40, height: 40, borderRadius: '50%' }} />
    </div>
  );
}
