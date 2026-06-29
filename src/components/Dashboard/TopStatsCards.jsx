import { Shield, Gem, Percent, TrendingUp, Clock, BarChart3 } from 'lucide-react';
import { startOfMonth, startOfWeek, endOfWeek } from 'date-fns';
import { getMonthlyBreakdown } from '../../utils/categoryClassification';

const TopStatsCards = ({ expenses, profile }) => {
  const now = new Date();
  const currentMonth = startOfMonth(now);

  const monthExpenses = expenses.filter(exp => new Date(exp.expense_date) >= currentMonth);
  const totalExpenses = monthExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  const breakdown = getMonthlyBreakdown(expenses);
  const budget = profile?.monthly_budget || 0;

  // Daily average
  const daysPassed = now.getDate();
  const dailyAvg = daysPassed > 0 ? totalExpenses / daysPassed : 0;

  // Weekly spending
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const weekExpenses = expenses.filter(exp => {
    const d = new Date(exp.expense_date);
    return d >= weekStart && d <= weekEnd;
  });
  const weeklyTotal = weekExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

  // Top category
  const categoryTotals = {};
  monthExpenses.forEach(exp => {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + parseFloat(exp.amount);
  });
  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];

  const stats = [
    {
      label: 'Necessary',
      value: breakdown.total > 0 ? `₹${breakdown.necessary.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : '₹0',
      subtext: breakdown.total > 0 ? `${breakdown.necessaryPct.toFixed(0)}% of spending` : 'Essential expenses',
      icon: Shield,
      accent: 'border-l-accent-success',
      iconBg: 'bg-accent-success/20',
      iconColor: 'text-accent-success',
    },
    {
      label: 'Luxury',
      value: breakdown.total > 0 ? `₹${breakdown.luxury.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : '₹0',
      subtext: breakdown.total > 0 ? `${breakdown.luxuryPct.toFixed(0)}% of spending` : 'Discretionary expenses',
      icon: Gem,
      accent: 'border-l-accent-insights',
      iconBg: 'bg-accent-insights/20',
      iconColor: 'text-accent-insights',
    },
    {
      label: 'Luxury Ratio',
      value: breakdown.total > 0 ? `${breakdown.luxuryPct.toFixed(0)}%` : '--',
      subtext: breakdown.luxuryPct > 40 ? 'High luxury spending' : breakdown.total > 0 ? 'Healthy ratio' : 'Add expenses to see',
      icon: Percent,
      accent: breakdown.luxuryPct > 40 ? 'border-l-accent-danger' : 'border-l-accent-prediction',
      iconBg: breakdown.luxuryPct > 40 ? 'bg-accent-danger/20' : 'bg-accent-prediction/20',
      iconColor: breakdown.luxuryPct > 40 ? 'text-accent-danger' : 'text-accent-prediction',
    },
    {
      label: 'Daily Average',
      value: `₹${dailyAvg.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
      subtext: `${daysPassed} days this month`,
      icon: Clock,
      accent: 'border-l-accent-warning',
      iconBg: 'bg-accent-warning/20',
      iconColor: 'text-accent-warning',
    },
    {
      label: 'This Week',
      value: `₹${weeklyTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
      subtext: `${weekExpenses.length} transactions`,
      icon: BarChart3,
      accent: 'border-l-accent-primary',
      iconBg: 'bg-accent-primary/20',
      iconColor: 'text-accent-primary',
    },
  ];

  return (
    <div className="mb-6">
      {/* Spending summary banner */}
      {breakdown.total > 0 && (
        <div className="glass rounded-2xl p-5 mb-5 border border-slate-200 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-primary/20 flex items-center justify-center flex-shrink-0">
              <TrendingUp size={18} className="text-accent-primary" />
            </div>
            <p className="text-sm text-slate-600 dark:text-txt-secondary">
              This month:{' '}
              <span className="font-bold text-accent-success">
                ₹{breakdown.necessary.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </span>{' '}
              necessary and{' '}
              <span className="font-bold text-accent-insights">
                ₹{breakdown.luxury.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </span>{' '}
              luxury spending
              {topCategory && (
                <>
                  {' '}— Top:{' '}
                  <span className="font-bold text-slate-800 dark:text-txt-primary">{topCategory[0]}</span>
                </>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`card border-l-4 ${stat.accent} p-4 animate-slide-in-up group`}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-8 h-8 rounded-lg ${stat.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <stat.icon size={15} className={stat.iconColor} />
              </div>
              <span className="text-[11px] font-semibold text-slate-400 dark:text-txt-muted uppercase tracking-wider">
                {stat.label}
              </span>
            </div>
            <p className="text-xl font-heading font-bold text-slate-800 dark:text-txt-primary">{stat.value}</p>
            <p className="text-[11px] text-slate-400 dark:text-txt-muted mt-1.5">{stat.subtext}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopStatsCards;
