import {
  TrendingUp, AlertTriangle, CheckCircle, Info, Clock,
  Target, Zap
} from 'lucide-react';
import {
  predictNextMonthExpense,
  calculateBudgetExhaustionForecast,
  generatePredictionInsights
} from '../../utils/prediction';
import { format } from 'date-fns';

const PredictionCard = ({ expenses, profile }) => {
  const monthlyBudget = profile?.monthly_budget ? parseFloat(profile.monthly_budget) : 10000;

  const prediction = predictNextMonthExpense(expenses, monthlyBudget);
  const forecast = calculateBudgetExhaustionForecast(expenses, monthlyBudget);
  const insights = generatePredictionInsights(expenses, monthlyBudget);

  const hasEnoughData = prediction !== null;

  if (!hasEnoughData) {
    return (
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-accent-prediction/20 flex items-center justify-center">
            <TrendingUp size={20} className="text-accent-prediction" />
          </div>
          <h3 className="text-lg font-heading font-semibold text-slate-800 dark:text-txt-primary">Spending Predictions</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-16 h-16 bg-accent-prediction/10 rounded-2xl flex items-center justify-center mb-4">
            <TrendingUp size={28} className="text-accent-prediction" />
          </div>
          <p className="text-slate-600 dark:text-txt-secondary font-medium">
            Need more data to generate predictions
          </p>
          <p className="text-sm text-slate-400 dark:text-txt-muted mt-1.5">
            Add expenses over 3+ months to unlock spending forecasts
          </p>
        </div>
      </div>
    );
  }

  const riskConfig = getRiskConfig(forecast.riskLevel);

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-accent-prediction/20 flex items-center justify-center">
          <TrendingUp size={20} className="text-accent-prediction" />
        </div>
        <h3 className="text-lg font-heading font-semibold text-txt-primary">Spending Predictions</h3>
        <span className="text-xs bg-accent-prediction/20 text-accent-prediction px-2.5 py-1 rounded-full font-semibold ml-auto">
          AI-powered
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Predicted Next Month */}
        <div className="glass rounded-2xl p-4 border border-accent-primary/20 hover:border-accent-primary/40 transition-all">
          <div className="flex items-center gap-2 mb-3">
            <Target size={16} className="text-accent-primary" />
            <span className="text-xs font-semibold text-accent-primary">Predicted Next Month</span>
          </div>
          <p className="text-2xl font-heading font-bold text-slate-800 dark:text-txt-primary">
            ₹{prediction.predicted_amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-xs font-semibold ${prediction.trend_percentage > 0 ? 'text-accent-danger' : 'text-accent-success'}`}>
              {prediction.trend_percentage > 0 ? '↑' : '↓'} {Math.abs(prediction.trend_percentage).toFixed(1)}%
            </span>
            <span className="text-xs text-slate-400 dark:text-txt-muted">vs last 3 months avg</span>
          </div>
        </div>

        {/* Confidence */}
        <div className="glass rounded-2xl p-4 border border-accent-insights/20 hover:border-accent-insights/40 transition-all">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={16} className="text-accent-insights" />
            <span className="text-xs font-semibold text-accent-insights">Confidence Level</span>
          </div>
          <p className="text-2xl font-heading font-bold text-slate-800 dark:text-txt-primary">
            {prediction.confidence.toFixed(0)}%
          </p>
          <div className="w-full bg-white/5 rounded-full h-2 mt-3">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-accent-insights to-purple-400 transition-all duration-500"
              style={{ width: `${prediction.confidence}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 dark:text-txt-muted mt-2">
            Based on {prediction.last_3_months_average > 0 ? '3 months' : 'available'} of data
          </p>
        </div>

        {/* Risk Level */}
        <div className={`glass rounded-2xl p-4 border ${riskConfig.border} hover:border-opacity-60 transition-all`}>
          <div className="flex items-center gap-2 mb-3">
            {riskConfig.icon}
            <span className={`text-xs font-semibold ${riskConfig.textColor}`}>Budget Risk</span>
          </div>
          <p className={`text-2xl font-heading font-bold ${riskConfig.textMainColor}`}>
            {riskConfig.label}
          </p>
          <p className="text-xs text-slate-400 dark:text-txt-muted mt-2">
            {forecast.exhaustionDate
              ? `Budget may exhaust by ${format(forecast.exhaustionDate, 'MMM dd')}`
              : 'Budget should last the month'}
          </p>
        </div>
      </div>

      {/* Budget Exhaustion Details */}
      {forecast.dailyRate > 0 && (
        <div className="glass rounded-2xl p-5 mb-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-heading font-semibold text-slate-800 dark:text-txt-primary">Budget Exhaustion Forecast</h4>
            <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${riskConfig.badge}`}>
              {riskConfig.label}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-slate-400 dark:text-txt-muted mb-1">Daily Rate</p>
              <p className="text-sm font-heading font-bold text-slate-800 dark:text-txt-primary">₹{forecast.dailyRate.toLocaleString('en-IN')}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 dark:text-txt-muted mb-1">Days Passed</p>
              <p className="text-sm font-heading font-bold text-slate-800 dark:text-txt-primary">{forecast.daysPassed} / {forecast.daysInMonth}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 dark:text-txt-muted mb-1">Remaining</p>
              <p className={`text-sm font-heading font-bold ${forecast.remainingBudget >= 0 ? 'text-accent-success' : 'text-accent-danger'}`}>
                ₹{forecast.remainingBudget.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 dark:text-txt-muted mb-1">Days Left</p>
              <p className="text-sm font-heading font-bold text-slate-800 dark:text-txt-primary">
                {forecast.daysRemaining !== null ? forecast.daysRemaining : '∞'}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-slate-400 dark:text-txt-muted mb-2">
              <span>Day 1</span>
              <span>Today (Day {forecast.daysPassed})</span>
              <span>Day {forecast.daysInMonth}</span>
            </div>
            <div className="relative w-full bg-white/5 rounded-full h-3">
              <div
                className="absolute h-3 bg-gradient-to-r from-accent-primary to-accent-prediction rounded-full transition-all duration-500"
                style={{ width: `${(forecast.daysPassed / forecast.daysInMonth) * 100}%` }}
              />
              {forecast.exhaustionDate && forecast.daysRemaining !== null && (
                <div
                  className="absolute top-0 h-3 w-1 bg-accent-danger rounded shadow-lg shadow-accent-danger/50"
                  style={{ left: `${Math.min(100, ((forecast.daysPassed + forecast.daysRemaining) / forecast.daysInMonth) * 100)}%` }}
                  title={`Budget exhaustion: Day ${forecast.daysPassed + forecast.daysRemaining}`}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Prediction Insights */}
      {insights.length > 0 && (
        <div>
          <h4 className="text-sm font-heading font-semibold text-slate-800 dark:text-txt-primary mb-3">Prediction Insights</h4>
          <div className="space-y-2">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 p-4 rounded-xl ${getInsightBg(insight.type)} transition-all duration-300 hover:scale-[1.01]`}
              >
                {getInsightIcon(insight.type)}
                <p className="text-sm text-slate-600 dark:text-txt-secondary flex-1">{insight.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Predicted Split */}
      {prediction.predicted_necessary > 0 && (
        <div className="mt-5 pt-5 border-t border-white/10">
          <h4 className="text-sm font-heading font-semibold text-slate-800 dark:text-txt-primary mb-4">Predicted Next Month Split</h4>
          <div className="flex gap-5">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400 dark:text-txt-muted">Necessary</span>
                <span className="text-xs font-heading font-bold text-accent-success">₹{prediction.predicted_necessary?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-2">
                <div className="h-2 rounded-full bg-gradient-to-r from-accent-success to-emerald-400" style={{ width: `${(prediction.predicted_necessary / prediction.predicted_amount) * 100}%` }} />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400 dark:text-txt-muted">Luxury</span>
                <span className="text-xs font-heading font-bold text-accent-insights">₹{prediction.predicted_luxury?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-2">
                <div className="h-2 rounded-full bg-gradient-to-r from-accent-insights to-purple-400" style={{ width: `${(prediction.predicted_luxury / prediction.predicted_amount) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const getRiskConfig = (riskLevel) => {
  switch (riskLevel) {
    case 'critical':
      return {
        border: 'border-accent-danger/30',
        textColor: 'text-accent-danger',
        textMainColor: 'text-accent-danger',
        label: 'Critical',
        icon: <AlertTriangle size={16} className="text-accent-danger" />,
        badge: 'bg-accent-danger text-white',
      };
    case 'high':
      return {
        border: 'border-orange-500/30',
        textColor: 'text-orange-400',
        textMainColor: 'text-orange-400',
        label: 'High Risk',
        icon: <AlertTriangle size={16} className="text-orange-400" />,
        badge: 'bg-orange-500 text-white',
      };
    case 'medium':
      return {
        border: 'border-accent-warning/30',
        textColor: 'text-accent-warning',
        textMainColor: 'text-accent-warning',
        label: 'Medium Risk',
        icon: <Clock size={16} className="text-accent-warning" />,
        badge: 'bg-accent-warning text-white',
      };
    default:
      return {
        border: 'border-accent-success/30',
        textColor: 'text-accent-success',
        textMainColor: 'text-accent-success',
        label: 'Low Risk',
        icon: <CheckCircle size={16} className="text-accent-success" />,
        badge: 'bg-accent-success text-white',
      };
  }
};

const getInsightBg = (type) => {
  switch (type) {
    case 'warning': return 'bg-accent-warning/5';
    case 'success': return 'bg-accent-success/5';
    case 'info': return 'bg-accent-primary/5';
    default: return 'bg-white/5';
  }
};

const getInsightIcon = (type) => {
  switch (type) {
    case 'warning': return <AlertTriangle size={16} className="text-accent-warning flex-shrink-0 mt-0.5" />;
    case 'success': return <CheckCircle size={16} className="text-accent-success flex-shrink-0 mt-0.5" />;
    case 'info': return <Info size={16} className="text-accent-primary flex-shrink-0 mt-0.5" />;
    default: return <Info size={16} className="text-txt-muted flex-shrink-0 mt-0.5" />;
  }
};

export default PredictionCard;
