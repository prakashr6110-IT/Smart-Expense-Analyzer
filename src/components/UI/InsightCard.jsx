import { Sparkles, AlertTriangle, Brain } from 'lucide-react';

/**
 * InsightCard - Premium AI insight card with gradient background
 * Categories: pattern, warning, suggestion
 */

const CATEGORY_CONFIG = {
  pattern: {
    icon: Sparkles,
    badge: 'Spending Pattern',
    borderLeft: '#7C6FFF',
  },
  warning: {
    icon: AlertTriangle,
    badge: 'Warning',
    borderLeft: '#F59E0B',
  },
  suggestion: {
    icon: Brain,
    badge: 'Suggestion',
    borderLeft: '#00C9A7',
  },
};

const InsightCard = ({ 
  title, 
  description, 
  category = 'pattern', 
  icon: CustomIcon,
  delay = 0,
}) => {
  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.pattern;
  const Icon = CustomIcon || config.icon;

  return (
    <div
      className="
        group relative rounded-2xl p-6
        bg-gradient-to-br from-[#1a1040] to-[#0f172a]
        border-l-[3px]
        shadow-[0_4px_24px_rgba(0,0,0,0.3)]
        transition-all duration-200 ease-in-out
        hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]
        animate-fade-in-up
      "
      style={{ 
        borderLeftColor: config.borderLeft,
        animationDelay: `${delay}ms`,
      }}
    >
      {/* Badge */}
      <div className="flex items-center justify-between mb-4">
        <span 
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
          style={{ 
            backgroundColor: 'rgba(124,111,255,0.15)', 
            color: '#7C6FFF',
          }}
        >
          <Sparkles size={12} />
          AI Insight
        </span>
        <span 
          className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full"
          style={{ 
            backgroundColor: `${config.borderLeft}15`,
            color: config.borderLeft,
          }}
        >
          {config.badge}
        </span>
      </div>

      {/* Icon + Content */}
      <div className="flex items-start gap-3">
        <div 
          className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${config.borderLeft}20` }}
        >
          <Icon size={18} style={{ color: config.borderLeft }} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-[15px] font-semibold text-white mb-1.5 leading-snug">
            {title}
          </h4>
          <p className="text-[15px] text-white/70 leading-[1.7]">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default InsightCard;
