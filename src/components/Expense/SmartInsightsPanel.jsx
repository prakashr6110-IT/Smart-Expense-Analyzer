import { useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useExpenses } from '../../context/ExpenseContext';
import {
  Wallet, AlertTriangle, PieChart, Activity,
  Brain, Target, Heart, Zap
} from 'lucide-react';

const SmartInsightsPanel = ({ pendingAmount = 0, pendingCategory = '', pendingType = '' }) => {
  const { profile } = useAuth();
  const { expenses } = useExpenses();

  const analytics = useMemo(() => {
    const monthlyBudget = profile?.monthly_budget ? parseFloat(profile.monthly_budget) : 10000;
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyExpenses = expenses.filter(exp => {
      const d = new Date(exp.expense_date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const totalSpent = monthlyExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
    const remaining = Math.max(0, monthlyBudget - totalSpent);
    const usedPct = monthlyBudget > 0 ? Math.min(100, Math.round((totalSpent / monthlyBudget) * 100)) : 0;

    const necessarySpent = monthlyExpenses.filter(e => e.expense_type === 'necessary').reduce((s, e) => s + parseFloat(e.amount), 0);
    const luxurySpent = monthlyExpenses.filter(e => e.expense_type === 'luxury').reduce((s, e) => s + parseFloat(e.amount), 0);
    const luxuryRatio = totalSpent > 0 ? Math.round((luxurySpent / totalSpent) * 100) : 0;

    const dayOfMonth = now.getDate();
    const dailyAvg = dayOfMonth > 0 ? totalSpent / dayOfMonth : 0;
    const projectedMonthEnd = dailyAvg * new Date(currentYear, currentMonth + 1, 0).getDate();

    const catMap = {};
    monthlyExpenses.forEach(e => {
      catMap[e.category] = (catMap[e.category] || 0) + parseFloat(e.amount);
    });
    const topCategories = Object.entries(catMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const txnCount = monthlyExpenses.length;
    const avgPerTxn = txnCount > 0 ? totalSpent / txnCount : 0;
    const daysSinceFirst = monthlyExpenses.length > 0
      ? Math.max(1, Math.ceil((now - new Date(Math.min(...monthlyExpenses.map(e => new Date(e.expense_date))))) / 86400000))
      : dayOfMonth;
    const txnsPerDay = txnCount / Math.max(1, daysSinceFirst);

    const warnings = [];
    if (usedPct >= 90) warnings.push({ level: 'critical', text: `Budget nearly exhausted (${usedPct}%)` });
    else if (usedPct >= 75) warnings.push({ level: 'warning', text: `${usedPct}% of budget consumed` });
    if (luxuryRatio > 40) warnings.push({ level: 'warning', text: `Luxury spending at ${luxuryRatio}% — aim below 30%` });
    if (projectedMonthEnd > monthlyBudget && monthlyBudget > 0) warnings.push({ level: 'info', text: `On track to overspend ₹${Math.round(projectedMonthEnd - monthlyBudget).toLocaleString('en-IN')}` });
    if (dailyAvg > monthlyBudget / 30 * 1.5 && monthlyBudget > 0) warnings.push({ level: 'info', text: `Daily avg ₹${Math.round(dailyAvg).toLocaleString('en-IN')} exceeds 1.5× target` });
    if (warnings.length === 0) warnings.push({ level: 'good', text: 'Spending is within healthy limits' });

    const amt = parseFloat(pendingAmount) || 0;
    const newTotal = totalSpent + amt;
    const newRemaining = Math.max(0, monthlyBudget - newTotal);
    const newUsedPct = monthlyBudget > 0 ? Math.min(100, Math.round((newTotal / monthlyBudget) * 100)) : 0;
    const budgetImpact = amt > 0 && monthlyBudget > 0
      ? (amt > remaining ? 'exceeds' : amt > remaining * 0.5 ? 'high' : amt > remaining * 0.2 ? 'moderate' : 'low')
      : 'none';

    let healthScore = 100;
    if (monthlyBudget > 0) {
      // Budget exhaustion penalties (much more aggressive)
      if (usedPct > 150) healthScore -= 75;
      else if (usedPct > 120) healthScore -= 65;
      else if (usedPct > 100) healthScore -= 55;
      else if (usedPct > 90) healthScore -= 35;
      else if (usedPct > 80) healthScore -= 20;
      else if (usedPct > 60) healthScore -= 10;
      // Additional penalty when almost no budget remains
      const remainingPct = ((monthlyBudget - totalSpent) / monthlyBudget) * 100;
      if (remainingPct <= 0) healthScore -= 15;
      else if (remainingPct <= 10) healthScore -= 10;
      // Luxury ratio penalty
      if (luxuryRatio > 50) healthScore -= 20;
      else if (luxuryRatio > 30) healthScore -= 10;
      // Projected overspend penalty
      if (projectedMonthEnd > monthlyBudget * 1.2) healthScore -= 15;
      else if (projectedMonthEnd > monthlyBudget) healthScore -= 8;
      // Daily average too high
      if (dailyAvg > monthlyBudget / 30 * 2) healthScore -= 10;
    }
    if (monthlyExpenses.length === 0) healthScore = 75;
    healthScore = Math.max(0, Math.min(100, healthScore));

    const scoreLabel = healthScore >= 80 ? 'Excellent' : healthScore >= 60 ? 'Good' : healthScore >= 40 ? 'Fair' : 'Needs Attention';
    const scoreColor = healthScore >= 80 ? 'green' : healthScore >= 60 ? 'blue' : healthScore >= 40 ? 'yellow' : 'red';

    const savingsTarget = monthlyBudget * 0.2;
    const actualSavings = Math.max(0, monthlyBudget - totalSpent);
    const savingsPct = savingsTarget > 0 ? Math.min(100, Math.round((actualSavings / savingsTarget) * 100)) : 0;

    return {
      monthlyBudget, totalSpent, remaining, usedPct,
      necessarySpent, luxurySpent, luxuryRatio,
      dailyAvg, projectedMonthEnd,
      topCategories, txnCount, avgPerTxn, txnsPerDay,
      warnings,
      amt, newRemaining, newUsedPct, budgetImpact,
      healthScore, scoreLabel, scoreColor,
      savingsTarget, actualSavings, savingsPct,
    };
  }, [expenses, profile, pendingAmount]);

  const {
    monthlyBudget, totalSpent, remaining, usedPct,
    luxuryRatio, dailyAvg, projectedMonthEnd,
    topCategories, txnCount, avgPerTxn,
    warnings,
    amt, newRemaining, newUsedPct, budgetImpact,
    healthScore, scoreLabel, scoreColor,
    savingsTarget, actualSavings, savingsPct,
  } = analytics;

  const getScoreStroke = () => {
    switch (scoreColor) {
      case 'green': return 'text-accent-success';
      case 'blue': return 'text-accent-primary';
      case 'yellow': return 'text-accent-warning';
      default: return 'text-accent-danger';
    }
  };

  const getScoreText = () => {
    switch (scoreColor) {
      case 'green': return 'text-accent-success';
      case 'blue': return 'text-accent-primary';
      case 'yellow': return 'text-accent-warning';
      default: return 'text-accent-danger';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-insights to-accent-prediction flex items-center justify-center">
          <Brain size={18} className="text-white" />
        </div>
        <div>
          <h3 className="text-lg font-heading font-bold text-slate-800 dark:text-txt-primary">Smart Insights</h3>
          <p className="text-xs text-slate-400 dark:text-txt-muted">AI-powered spending analytics</p>
        </div>
      </div>

      {/* 1. Monthly Budget Status */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-accent-primary/20 flex items-center justify-center">
            <Wallet size={16} className="text-accent-primary" />
          </div>
          <span className="text-sm font-semibold text-slate-800 dark:text-txt-primary">Budget Status</span>
        </div>
        <div className="flex justify-between items-end mb-3">
          <div>
            <p className="text-2xl font-bold text-slate-800 dark:text-txt-primary">₹{remaining.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
            <p className="text-xs text-slate-400 dark:text-txt-muted mt-0.5">Remaining of ₹{monthlyBudget.toLocaleString('en-IN')}</p>
          </div>
          <div className="text-right">
            <span className={`text-lg font-bold ${usedPct >= 90 ? 'text-accent-danger' : usedPct >= 75 ? 'text-accent-warning' : 'text-accent-success'}`}>{usedPct}%</span>
            <p className="text-xs text-slate-400 dark:text-txt-muted">used</p>
          </div>
        </div>
        <div className="w-full h-3 bg-slate-200 dark:bg-fintech-secondary rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${usedPct >= 90 ? 'bg-gradient-to-r from-accent-danger to-rose-400' : usedPct >= 75 ? 'bg-gradient-to-r from-accent-warning to-orange-400' : 'bg-gradient-to-r from-accent-success to-emerald-400'}`}
            style={{ width: `${Math.min(100, usedPct)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-400 dark:text-txt-muted mt-1.5">
          <span>Spent: ₹{totalSpent.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
          <span>Necessary: ₹{analytics.necessarySpent.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
          <span>Luxury: ₹{analytics.luxurySpent.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
        </div>
      </div>

      {/* 4. Smart Spending Warnings */}
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-accent-warning/20 flex items-center justify-center">
            <AlertTriangle size={16} className="text-accent-warning" />
          </div>
          <span className="text-sm font-semibold text-slate-800 dark:text-txt-primary">Smart Warnings</span>
        </div>
        <div className="space-y-2">
          {warnings.map((w, i) => (
            <div key={i} className={`flex items-start gap-2.5 text-sm p-2.5 rounded-xl ${
              w.level === 'critical' ? 'bg-accent-danger/10 text-accent-danger border border-accent-danger/20' :
              w.level === 'warning' ? 'bg-accent-warning/10 text-accent-warning border border-accent-warning/20' :
              w.level === 'good' ? 'bg-accent-success/10 text-accent-success border border-accent-success/20' :
              'bg-accent-primary/10 text-accent-primary border border-accent-primary/20'
            }`}>
              <span className="mt-0.5 flex-shrink-0 font-bold">{w.level === 'good' ? '✓' : w.level === 'critical' ? '!!' : '!'}</span>
              <span className="text-xs font-medium">{w.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Category Spending Summary */}
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-accent-insights/20 flex items-center justify-center">
            <PieChart size={16} className="text-accent-insights" />
          </div>
          <span className="text-sm font-semibold text-slate-800 dark:text-txt-primary">Top Categories</span>
          <span className="text-xs text-slate-400 dark:text-txt-muted ml-auto">This month</span>
        </div>
        {topCategories.length === 0 ? (
          <p className="text-xs text-slate-400 dark:text-txt-muted text-center py-3">No spending data yet</p>
        ) : (
          <div className="space-y-2.5">
            {topCategories.map(([cat, amount]) => {
              const pct = totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0;
              return (
                <div key={cat}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-600 dark:text-txt-secondary">{cat}</span>
                    <span className="text-slate-400 dark:text-txt-muted">₹{amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })} ({pct}%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-fintech-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-accent-insights to-accent-prediction rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. Expense Frequency Insights */}
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-accent-prediction/20 flex items-center justify-center">
            <Activity size={16} className="text-accent-prediction" />
          </div>
          <span className="text-sm font-semibold text-slate-800 dark:text-txt-primary">Spending Frequency</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-2.5 bg-accent-prediction/10 rounded-xl border border-accent-prediction/20">
            <p className="text-lg font-bold text-accent-prediction">{txnCount}</p>
            <p className="text-[10px] text-slate-400 dark:text-txt-muted font-medium">Transactions</p>
          </div>
          <div className="text-center p-2.5 bg-accent-prediction/10 rounded-xl border border-accent-prediction/20">
            <p className="text-lg font-bold text-accent-prediction">₹{avgPerTxn.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
            <p className="text-[10px] text-slate-400 dark:text-txt-muted font-medium">Avg/Txn</p>
          </div>
          <div className="text-center p-2.5 bg-accent-prediction/10 rounded-xl border border-accent-prediction/20">
            <p className="text-lg font-bold text-accent-prediction">{(analytics.txnsPerDay).toFixed(1)}</p>
            <p className="text-[10px] text-slate-400 dark:text-txt-muted font-medium">Txns/Day</p>
          </div>
        </div>
      </div>

      {/* 8. Expense Impact Preview */}
      {amt > 0 && (
        <div className="rounded-2xl bg-gradient-to-br from-accent-primary/10 to-accent-insights/10 border border-accent-primary/20 p-5 animate-scale-in">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-accent-primary/20 flex items-center justify-center">
              <Zap size={16} className="text-accent-primary" />
            </div>
            <span className="text-sm font-semibold text-slate-800 dark:text-txt-primary">Expense Impact</span>
          </div>
          <div className="space-y-2.5">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400 dark:text-txt-muted">Adding this expense</span>
              <span className="font-bold text-slate-800 dark:text-txt-primary">₹{amt.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400 dark:text-txt-muted">Budget after</span>
              <span className={`font-bold ${newRemaining === 0 ? 'text-accent-danger' : 'text-slate-800 dark:text-txt-primary'}`}>
                ₹{newRemaining.toLocaleString('en-IN', { maximumFractionDigits: 0 })} left
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400 dark:text-txt-muted">Usage after</span>
              <span className={`font-bold ${newUsedPct >= 90 ? 'text-accent-danger' : newUsedPct >= 75 ? 'text-accent-warning' : 'text-accent-success'}`}>
                {newUsedPct}%
              </span>
            </div>
            <div className={`text-xs text-center py-1.5 rounded-lg font-medium ${
              budgetImpact === 'exceeds' ? 'bg-accent-danger/10 text-accent-danger border border-accent-danger/20' :
              budgetImpact === 'high' ? 'bg-accent-warning/10 text-accent-warning border border-accent-warning/20' :
              budgetImpact === 'moderate' ? 'bg-accent-warning/5 text-accent-warning border border-accent-warning/10' :
              'bg-accent-success/10 text-accent-success border border-accent-success/20'
            }`}>
              {budgetImpact === 'exceeds' ? '⚠ This exceeds your remaining budget!' :
               budgetImpact === 'high' ? '⚡ This uses over 50% of remaining budget' :
               budgetImpact === 'moderate' ? '💡 Moderate impact on budget' :
               '✓ Low impact — safe to spend'}
            </div>
          </div>
        </div>
      )}

      {/* 9. Expense Health Score */}
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-accent-success/20 flex items-center justify-center">
            <Heart size={16} className={getScoreStroke()} />
          </div>
          <span className="text-sm font-semibold text-slate-800 dark:text-txt-primary">Health Score</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 flex-shrink-0">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="5" className="text-slate-200 dark:text-white/5" />
              <circle cx="32" cy="32" r="28" fill="none" strokeWidth="5" strokeLinecap="round"
                strokeDasharray={`${(healthScore / 100) * 176} 176`}
                className={getScoreStroke()}
                stroke="currentColor"
                
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-lg font-bold ${getScoreText()}`}>
                {healthScore}
              </span>
            </div>
          </div>
          <div>
            <p className={`text-base font-bold ${getScoreText()}`}>
              {scoreLabel}
            </p>
            <p className="text-xs text-slate-400 dark:text-txt-muted mt-0.5">Based on spending patterns, luxury ratio, and budget adherence</p>
          </div>
        </div>
      </div>

      {/* 10. Goal Progress Card */}
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-accent-success/20 flex items-center justify-center">
            <Target size={16} className="text-accent-success" />
          </div>
          <span className="text-sm font-semibold text-slate-800 dark:text-txt-primary">Savings Goal</span>
          <span className="text-[10px] text-slate-400 dark:text-txt-muted ml-auto">20% of budget</span>
        </div>
        <div className="flex justify-between items-end mb-2">
          <div>
            <p className="text-lg font-bold text-slate-800 dark:text-txt-primary">₹{actualSavings.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
            <p className="text-xs text-slate-400 dark:text-txt-muted">of ₹{savingsTarget.toLocaleString('en-IN', { maximumFractionDigits: 0 })} target</p>
          </div>
          <span className={`text-sm font-bold ${savingsPct >= 100 ? 'text-accent-success' : savingsPct >= 50 ? 'text-accent-primary' : 'text-accent-warning'}`}>{savingsPct}%</span>
        </div>
        <div className="w-full h-2.5 bg-slate-200 dark:bg-fintech-secondary rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${savingsPct >= 100 ? 'bg-gradient-to-r from-accent-success to-emerald-400' : savingsPct >= 50 ? 'bg-gradient-to-r from-accent-primary to-cyan-400' : 'bg-gradient-to-r from-accent-warning to-orange-400'}`}
            style={{ width: `${Math.min(100, savingsPct)}%` }}
          />
        </div>
        {savingsPct >= 100 && (
          <p className="text-xs text-accent-success mt-2 font-medium">🎉 Savings goal achieved this month!</p>
        )}
      </div>
    </div>
  );
};

export default SmartInsightsPanel;
