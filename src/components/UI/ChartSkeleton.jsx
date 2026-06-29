/**
 * ChartSkeleton - Loading placeholder for chart containers
 * 320px height, 16px radius, pulse animation
 */
const ChartSkeleton = ({ height = 320, className = '' }) => {
  return (
    <div
      className={`
        rounded-2xl animate-pulse
        bg-white dark:bg-white/[0.05]
        border border-slate-200 dark:border-white/[0.07]
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      style={{ height: `${height}px` }}
      role="status"
      aria-label="Loading chart"
    >
      <div className="p-6 h-full flex flex-col">
        {/* Title placeholder */}
        <div className="h-5 w-40 rounded-lg bg-slate-200 dark:bg-white/[0.08] mb-6" />

        {/* Chart area placeholder */}
        <div className="flex-1 flex items-end gap-3 px-4">
          <div className="flex-1 rounded-t-lg bg-slate-200/60 dark:bg-white/[0.04]" style={{ height: '60%' }} />
          <div className="flex-1 rounded-t-lg bg-slate-200/60 dark:bg-white/[0.06]" style={{ height: '80%' }} />
          <div className="flex-1 rounded-t-lg bg-slate-200/60 dark:bg-white/[0.04]" style={{ height: '45%' }} />
          <div className="flex-1 rounded-t-lg bg-slate-200/60 dark:bg-white/[0.08]" style={{ height: '90%' }} />
          <div className="flex-1 rounded-t-lg bg-slate-200/60 dark:bg-white/[0.05]" style={{ height: '70%' }} />
          <div className="flex-1 rounded-t-lg bg-slate-200/60 dark:bg-white/[0.04]" style={{ height: '55%' }} />
        </div>
      </div>
    </div>
  );
};

export default ChartSkeleton;
