import { Award, CheckCircle, AlertCircle } from 'lucide-react';
import { calculateFinancialScore, getScoreRating, calculateScoreBreakdown } from '../../utils/prediction';
import { getMonthlyBreakdown } from '../../utils/categoryClassification';

const FinancialScoreCard = ({ expenses, profile, predictions }) => {
  const monthlyBudget = profile?.monthly_budget ? parseFloat(profile.monthly_budget) : 10000;

  // Calculate score and breakdown
  const score = calculateFinancialScore(expenses, monthlyBudget);
  const rating = getScoreRating(score);
  const breakdown = calculateScoreBreakdown(expenses, monthlyBudget);

  // Get score color for the circular progress
  const getScoreColor = () => {
    if (score >= 70) return { stroke: '#10b981', text: 'text-accent-success' };
    if (score >= 50) return { stroke: '#84cc16', text: 'text-lime-400' };
    if (score >= 25) return { stroke: '#f59e0b', text: 'text-accent-warning' };
    if (score >= 0) return { stroke: '#ef4444', text: 'text-accent-danger' };
    return { stroke: '#991b1b', text: 'text-red-700' };
  };

  const colors = getScoreColor();

  // SVG circular progress
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const visualScore = Math.max(0, Math.min(100, score));
  const strokeDashoffset = circumference - (visualScore / 100) * circumference;

  // Monthly breakdown for display
  const monthlyBreakdown = getMonthlyBreakdown(expenses);

  // Score breakdown items for display
  const scoreBreakdownItems = [
    { ...breakdown.budgetAdherence, color: getBreakdownColor(breakdown.budgetAdherence.score, breakdown.budgetAdherence.max) },
    { ...breakdown.luxuryControl, color: getBreakdownColor(breakdown.luxuryControl.score, breakdown.luxuryControl.max) },
    { ...breakdown.weekendControl, color: getBreakdownColor(breakdown.weekendControl.score, breakdown.weekendControl.max) },
    { ...breakdown.savingsPotential, color: getBreakdownColor(breakdown.savingsPotential.score, breakdown.savingsPotential.max) },
  ];

  return (
    <div className="card mb-6 animate-slide-in-up">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-accent-primary/20 flex items-center justify-center">
          <Award size={20} className="text-accent-primary" />
        </div>
        <h3 className="text-lg font-heading font-semibold text-slate-800 dark:text-txt-primary">Financial Health Score</h3>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: Circular Score Gauge */}
        <div className="flex-shrink-0 flex flex-col items-center">
          <div className="relative w-40 h-40">
            <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 130 130">
              {/* Background circle */}
              <circle
                cx="65"
                cy="65"
                r={radius}
                fill="none"
                className="stroke-white/5"
                strokeWidth="10"
              />
              {/* Progress circle */}
              <circle
                cx="65"
                cy="65"
                r={radius}
                fill="none"
                stroke={colors.stroke}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-4xl font-heading font-bold ${colors.text}`}>
                {Math.round(score)}
              </span>
              <span className="text-xs text-slate-400 dark:text-txt-muted">
                {score < 0 ? 'over budget' : '/ 100'}
              </span>
            </div>
          </div>
          <p className={`text-sm font-semibold mt-4 text-center ${colors.text}`}>
            {rating.emoji} {rating.text}
          </p>
        </div>

        {/* Right: Score Breakdown */}
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-slate-600 dark:text-txt-secondary mb-4">Score Breakdown</h4>
          <div className="space-y-4">
            {scoreBreakdownItems.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                {/* Icon */}
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${item.score === item.max ? 'bg-accent-success/20' : item.score >= item.max * 0.5 ? 'bg-accent-warning/20' : 'bg-accent-danger/20'}`}>
                  {item.score === item.max ? 
                    <CheckCircle size={14} className="text-accent-success" /> : 
                    <AlertCircle size={14} className={item.score >= item.max * 0.5 ? 'text-accent-warning' : 'text-accent-danger'} />
                  }
                </div>
                
                {/* Label and bar */}
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm text-slate-600 dark:text-txt-secondary">{item.label}</span>
                    <span className={`text-sm font-semibold ${item.color}`}>
                      {item.score}/{item.max}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.score === item.max ? 'bg-gradient-to-r from-accent-success to-emerald-400' : 
                        item.score >= item.max * 0.7 ? 'bg-gradient-to-r from-lime-500 to-green-400' : 
                        item.score >= item.max * 0.4 ? 'bg-gradient-to-r from-accent-warning to-amber-400' : 'bg-gradient-to-r from-accent-danger to-red-400'
                      }`}
                      style={{ width: `${(item.score / item.max) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-slate-200 dark:border-white/10">
            <div className="text-center">
              <p className="text-xs text-slate-400 dark:text-txt-muted mb-1">This Month</p>
              <p className="text-sm font-heading font-bold text-slate-800 dark:text-txt-primary">₹{monthlyBreakdown.total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-400 dark:text-txt-muted mb-1">Necessary</p>
              <p className="text-sm font-heading font-bold text-accent-success">₹{monthlyBreakdown.necessary.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-400 dark:text-txt-muted mb-1">Luxury</p>
              <p className="text-sm font-heading font-bold text-accent-insights">₹{monthlyBreakdown.luxury.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Next Month Prediction */}
      {predictions?.[0]?.predicted_amount > 0 && (
        <div className="mt-6 p-5 glass rounded-2xl border border-accent-prediction/20">
          <p className="text-xs font-semibold text-accent-prediction mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-prediction animate-pulse"></span>
            Next Month Prediction
          </p>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="text-accent-success">
              Necessary: <strong className="font-heading">₹{parseFloat(predictions[0].predicted_necessary || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</strong>
            </span>
            <span className="text-accent-insights">
              Luxury: <strong className="font-heading">₹{parseFloat(predictions[0].predicted_luxury || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</strong>
            </span>
            <span className="text-slate-800 dark:text-txt-primary font-heading font-bold">
              Total: ₹{parseFloat(predictions[0].predicted_amount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper to get color based on score percentage
const getBreakdownColor = (score, max) => {
  const pct = (score / max) * 100;
  if (pct >= 90) return 'text-accent-success';
  if (pct >= 70) return 'text-lime-400';
  if (pct >= 40) return 'text-accent-warning';
  return 'text-accent-danger';
};

export default FinancialScoreCard;
