import './PageSkeleton.css';

export function PageSkeleton() {
  return (
    <div className="page-skeleton-container" aria-busy="true" aria-label="Loading page content...">
      {/* Top subtle progress bar */}
      <div className="page-skeleton-progress-bar" />

      {/* Header skeleton */}
      <div className="page-skeleton-header">
        <div className="page-skeleton-header-text">
          <div className="skeleton page-skeleton-title" />
          <div className="skeleton page-skeleton-subtitle" />
        </div>
        <div className="skeleton page-skeleton-btn" />
      </div>

      {/* Metric Cards Skeleton */}
      <div className="page-skeleton-metrics">
        <div className="skeleton page-skeleton-card" />
        <div className="skeleton page-skeleton-card" />
        <div className="skeleton page-skeleton-card" />
        <div className="skeleton page-skeleton-card" />
      </div>

      {/* Main Content Area Skeleton */}
      <div className="page-skeleton-body">
        <div className="skeleton page-skeleton-block" style={{ height: 260 }} />
        <div className="skeleton page-skeleton-block" style={{ height: 180 }} />
      </div>
    </div>
  );
}

export default PageSkeleton;
