import Card from './Card';

/**
 * MetricCard - Summary metric display with left accent bar and icon
 * Used in the dashboard summary section below Hero
 */
const MetricCard = ({ label, value, icon: Icon, accentColor = '#00C9A7', delay = 0 }) => {
  return (
    <Card 
      hoverable 
      className="relative overflow-hidden animate-fade-in-up"
      style={{ 
        animationDelay: `${delay}ms`,
        borderLeft: `4px solid ${accentColor}` 
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-caption text-slate-500 dark:text-[#94A3B8] uppercase tracking-wider mb-2">
            {label}
          </p>
          <p className="text-h1 font-bold text-slate-900 dark:text-white leading-tight truncate">
            {value}
          </p>
        </div>
        {Icon && (
          <div className="flex-shrink-0 ml-3">
            <Icon size={22} className="text-slate-400 dark:text-[#64748B]" />
          </div>
        )}
      </div>
    </Card>
  );
};

export default MetricCard;
