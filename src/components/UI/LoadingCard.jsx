/**
 * LoadingCard - Skeleton placeholder for card content
 * Maintains layout stability during loading
 */
const LoadingCard = ({ lines = 3, className = '' }) => {
  return (
    <div
      className={`
        rounded-2xl p-6 animate-pulse
        bg-white dark:bg-[#111827]
        border border-slate-200 dark:border-white/[0.07]
        shadow-[0_4px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)]
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      role="status"
      aria-label="Loading content"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-white/[0.08]" />
        <div className="h-5 w-32 rounded-lg bg-slate-200 dark:bg-white/[0.08]" />
      </div>

      {/* Content lines */}
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-4 rounded-lg bg-slate-200 dark:bg-white/[0.06]"
            style={{ width: `${100 - i * 15}%` }}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * MetricSkeleton - Skeleton for metric/summary cards
 */
export const MetricSkeleton = ({ className = '' }) => (
  <div
    className={`
      rounded-2xl p-6 animate-pulse
      bg-white dark:bg-[#111827]
      border border-slate-200 dark:border-white/[0.07]
      shadow-[0_4px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)]
      ${className}
    `.trim().replace(/\s+/g, ' ')}
    role="status"
    aria-label="Loading metric"
  >
    <div className="h-3 w-20 rounded bg-slate-200 dark:bg-white/[0.08] mb-3" />
    <div className="h-8 w-28 rounded-lg bg-slate-200 dark:bg-white/[0.08]" />
  </div>
);

export default LoadingCard;
