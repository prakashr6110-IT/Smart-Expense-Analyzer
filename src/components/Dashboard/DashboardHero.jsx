import { IndianRupee, TrendingUp, Wallet, Heart, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { startOfMonth, subMonths, format } from 'date-fns';
import { calculateFinancialScore, getScoreRating } from '../../utils/prediction';
import { getMonthlyBreakdown } from '../../utils/categoryClassification';
import UserAvatar, { getUserDisplayName } from '../Common/UserAvatar';

const DashboardHero = ({ user, profile, expenses }) => {
  const now = new Date();
  const currentMonth = startOfMonth(now);
  const lastMonth = startOfMonth(subMonths(now, 1));

  // Current month expenses
  const monthExpenses = expenses.filter(exp => new Date(exp.expense_date) >= currentMonth);
  const totalSpent = monthExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

  // Last month for comparison
  const lastMonthExpenses = expenses.filter(exp => {
    const d = new Date(exp.expense_date);
    return d >= lastMonth && d < currentMonth;
  });
  const lastMonthTotal = lastMonthExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

  // Trend
  const trendPct = lastMonthTotal > 0 ? ((totalSpent - lastMonthTotal) / lastMonthTotal) * 100 : 0;
  const isUp = trendPct > 0;

  const budget = profile?.monthly_budget || 0;
  const budgetUsed = budget > 0 ? (totalSpent / budget) * 100 : 0;
  const remaining = budget - totalSpent;

  // Score
  const score = calculateFinancialScore(expenses, budget || 10000);
  const rating = getScoreRating(score);

  // SVG gauge
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const visualScore = Math.max(0, Math.min(100, score));
  const strokeDashoffset = circumference - (visualScore / 100) * circumference;

  const getScoreStroke = () => {
    if (score >= 70) return '#10b981';
    if (score >= 50) return '#84cc16';
    if (score >= 25) return '#f59e0b';
    return '#ef4444';
  };

  const getBudgetColor = () => {
    if (budgetUsed > 100) return 'from-accent-danger to-red-500';
    if (budgetUsed > 80) return 'from-accent-warning to-orange-500';
    return 'from-accent-success to-emerald-400';
  };

  const displayName = getUserDisplayName(user, profile);
  const firstName = displayName.split(' ')[0];

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-fintech-sidebar via-fintech-card to-slate-800 p-6 sm:p-8 mb-6 shadow-2xl border border-white/5">
      {/* Decorative gradient orbs */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-accent-primary/15 rounded-full -translate-y-1/2 translate-x-1/4 blur-[100px]" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-insights/15 rounded-full translate-y-1/2 -translate-x-1/4 blur-[100px]" />
      <div className="absolute top-1/2 right-1/4 w-40 h-40 bg-accent-prediction/10 rounded-full blur-[80px]" />

      <div className="relative z-10">
        {/* Top row: Avatar + Welcome */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <UserAvatar
                user={user}
                profile={profile}
                size="lg"
                ringColor="ring-2 ring-accent-primary/40"
                className="!shadow-xl relative"
              />
            </div>
            <div>
              <p className="text-txt-muted text-sm font-medium">Welcome back,</p>
              <h1 className="text-2xl sm:text-3xl font-heading font-bold text-txt-primary mt-0.5">
                {firstName}
              </h1>
              <p className="text-txt-muted text-xs mt-1.5">{format(now, 'EEEE, MMMM d, yyyy')}</p>
            </div>
          </div>

          {/* Score gauge */}
          <div className="hidden sm:flex flex-col items-center">
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r={radius} fill="none" stroke="currentColor" className="text-white/5" strokeWidth="8" />
                <circle
                  cx="50" cy="50" r={radius} fill="none"
                  stroke={getScoreStroke()}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-heading font-bold text-txt-primary">{Math.round(score)}</span>
                <span className="text-[10px] text-txt-muted">/100</span>
              </div>
            </div>
            <p className="text-[11px] text-txt-muted mt-1.5 font-medium">{rating.text}</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Total Spent */}
          <div className="glass rounded-2xl p-4 hover:bg-slate-200 dark:hover:bg-white/10 transition-all duration-300 group">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-accent-primary/20 flex items-center justify-center group-hover:bg-accent-primary/30 transition-colors">
                <IndianRupee size={15} className="text-accent-primary" />
              </div>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-txt-muted uppercase tracking-wider">Spent</span>
            </div>
            <p className="text-xl sm:text-2xl font-heading font-bold text-slate-800 dark:text-txt-primary">
              ₹{totalSpent.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
            <div className="flex items-center gap-1 mt-2">
              {lastMonthTotal > 0 && (
                <>
                  {isUp ? (
                    <ArrowUpRight size={12} className="text-accent-danger" />
                  ) : (
                    <ArrowDownRight size={12} className="text-accent-success" />
                  )}
                  <span className={`text-[11px] font-semibold ${isUp ? 'text-accent-danger' : 'text-accent-success'}`}>
                    {Math.abs(trendPct).toFixed(0)}%
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-txt-muted ml-0.5">vs last month</span>
                </>
              )}
            </div>
          </div>

          {/* Budget */}
          <div className="glass rounded-2xl p-4 hover:bg-slate-200 dark:hover:bg-white/10 transition-all duration-300 group">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-accent-insights/20 flex items-center justify-center group-hover:bg-accent-insights/30 transition-colors">
                <Wallet size={15} className="text-accent-insights" />
              </div>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-txt-muted uppercase tracking-wider">Budget</span>
            </div>
            <p className="text-xl sm:text-2xl font-heading font-bold text-slate-800 dark:text-txt-primary">
              {budget > 0 ? `₹${budget.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : 'Not Set'}
            </p>
            {budget > 0 && (
              <div className="mt-3">
                <div className="flex justify-between text-[10px] text-slate-500 dark:text-txt-muted mb-1.5">
                  <span>{budgetUsed.toFixed(0)}% used</span>
                  <span>₹{Math.max(0, remaining).toLocaleString('en-IN', { maximumFractionDigits: 0 })} left</span>
                </div>
                <div className="h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${getBudgetColor()} transition-all duration-700 shadow-lg`}
                    style={{ width: `${Math.min(budgetUsed, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Transactions */}
          <div className="glass rounded-2xl p-4 hover:bg-slate-200 dark:hover:bg-white/10 transition-all duration-300 group">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-accent-prediction/20 flex items-center justify-center group-hover:bg-accent-prediction/30 transition-colors">
                <TrendingUp size={15} className="text-accent-prediction" />
              </div>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-txt-muted uppercase tracking-wider">Txns</span>
            </div>
            <p className="text-xl sm:text-2xl font-heading font-bold text-slate-800 dark:text-txt-primary">{monthExpenses.length}</p>
            <p className="text-[11px] text-slate-500 dark:text-txt-muted mt-2">this month</p>
          </div>

          {/* Score (mobile) */}
          <div className="sm:hidden glass rounded-2xl p-4 hover:bg-slate-200 dark:hover:bg-white/10 transition-all duration-300 group">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-accent-danger/20 flex items-center justify-center group-hover:bg-accent-danger/30 transition-colors">
                <Heart size={15} className="text-accent-danger" fill="currentColor" />
              </div>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-txt-muted uppercase tracking-wider">Score</span>
            </div>
            <p className="text-xl font-heading font-bold" style={{ color: getScoreStroke() }}>{Math.round(score)}</p>
            <p className="text-[11px] text-slate-500 dark:text-txt-muted mt-2">{rating.text}</p>
          </div>

          {/* Avg per expense (desktop) */}
          <div className="hidden sm:block glass rounded-2xl p-4 hover:bg-slate-200 dark:hover:bg-white/10 transition-all duration-300 group">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-accent-warning/20 flex items-center justify-center group-hover:bg-accent-warning/30 transition-colors">
                <IndianRupee size={15} className="text-accent-warning" />
              </div>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-txt-muted uppercase tracking-wider">Avg/Expense</span>
            </div>
            <p className="text-xl sm:text-2xl font-heading font-bold text-slate-800 dark:text-txt-primary">
              ₹{monthExpenses.length > 0 ? (totalSpent / monthExpenses.length).toLocaleString('en-IN', { maximumFractionDigits: 0 }) : '0'}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-txt-muted mt-2">per transaction</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHero;
