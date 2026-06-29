import { Wallet, Plus } from 'lucide-react';

/**
 * EmptyState - Premium empty state when no expenses exist
 * Centered layout with clickable wallet icon, heading, and subheading
 */
const EmptyState = ({ 
  heading = 'No expenses yet',
  subheading = 'Add your first expense to start seeing insights',
  onIconClick,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-fade-in">
      {/* Clickable Icon container */}
      <div
        className={`relative mb-8 ${onIconClick ? 'cursor-pointer group' : ''}`}
        onClick={onIconClick}
        role={onIconClick ? 'button' : undefined}
        tabIndex={onIconClick ? 0 : undefined}
        onKeyDown={onIconClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onIconClick(); } : undefined}
        aria-label={onIconClick ? 'Go to Add Expense' : undefined}
      >
        <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br from-brand-teal/10 to-brand-purple/10 dark:from-brand-teal/5 dark:to-brand-purple/5 flex items-center justify-center border border-slate-200 dark:border-white/[0.07] transition-all duration-200 ${onIconClick ? 'group-hover:scale-105 group-hover:border-brand-teal/30 group-hover:shadow-lg group-hover:shadow-brand-teal/10' : ''}`}>
          <Wallet size={40} className="text-brand-teal" />
        </div>
        <div className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-brand-teal flex items-center justify-center shadow-lg transition-transform duration-200 ${onIconClick ? 'group-hover:scale-110' : ''}`}>
          <Plus size={16} className="text-white" />
        </div>
      </div>

      {/* Text */}
      <h3 className="text-h2 font-heading text-slate-900 dark:text-white mb-3">
        {heading}
      </h3>
      <p className="text-body text-slate-500 dark:text-[#94A3B8] max-w-md">
        {subheading}
      </p>
    </div>
  );
};

export default EmptyState;
