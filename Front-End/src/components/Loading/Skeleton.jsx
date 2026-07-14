export function SkeletonBlock({ width = '100%', height = 16, radius = 8, style = {} }) {
  return <div className="te-skel" style={{ width, height, borderRadius: radius, ...style }} />;
}

export function FeedbackCardSkeleton() {
  return (
    <div className="fbc-card" style={{ pointerEvents: 'none' }}>
      <div className="fbc-vote-col"><SkeletonBlock width={34} height={44} radius={10} /></div>
      <div className="fbc-body">
        <SkeletonBlock width={90} height={18} radius={20} style={{ marginBottom: 10 }} />
        <SkeletonBlock width="70%" height={18} style={{ marginBottom: 8 }} />
        <SkeletonBlock width="95%" height={13} style={{ marginBottom: 6 }} />
        <SkeletonBlock width="60%" height={13} />
      </div>
    </div>
  );
}

export function CardGridSkeleton({ count = 6, ItemSkeleton = FeedbackCardSkeleton }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => <ItemSkeleton key={i} />)}
    </>
  );
}
