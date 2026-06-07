import { DollarSign, Wallet, TrendingUp, Target, Shield, Gem, Percent, BarChart3 } from 'lucide-react';
import { format, startOfMonth } from 'date-fns';
import { getMonthlyBreakdown } from '../../utils/categoryClassification';
import { predictNextMonthExpense } from '../../utils/prediction';

const StatsCards = ({ expenses, profile, predictions }) => {
  const now = new Date();
  const currentMonth = startOfMonth(now);

  // Filter expenses for current month
  const monthExpenses = expenses.filter(exp => new Date(exp.expense_date) >= currentMonth);
  const hasData = monthExpenses.length > 0;

  // Calculate total expenses for current month
  const totalExpenses = monthExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

  // Get spending breakdown
  const breakdown = getMonthlyBreakdown(expenses);

  // Get budget from profile
  const budget = profile?.monthly_budget || 0;

  // Find top category
  const categoryTotals = {};
  monthExpenses.forEach(exp => {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + parseFloat(exp.amount);
  });

  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];

  // Get latest prediction - compute in real-time from expenses
  const computedPrediction = predictNextMonthExpense(expenses, budget || 10000);
  const latestPrediction = computedPrediction?.predicted_amount || predictions?.[0]?.predicted_amount || 0;

  const stats = [
    {
      label: 'Total Expenses',
      value: hasData ? `₹${totalExpenses.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : '₹0',
      icon: DollarSign,
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      subtext: hasData ? format(now, 'MMMM yyyy') : 'No expenses this month',
      empty: !hasData,
    },
    {
      label: 'Monthly Budget',
      value: budget > 0 ? `₹${budget.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : 'Not Set',
      icon: Wallet,
      color: 'bg-gradient-to-br from-green-500 to-green-600',
      subtext: budget > 0 ? (hasData ? `${((totalExpenses / budget) * 100).toFixed(0)}% used` : 'Ready to track') : 'Set budget in Profile',
      empty: budget === 0,
    },
    {
      label: 'Necessary',
      value: breakdown.total > 0 ? `₹${breakdown.necessary.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : '₹0',
      icon: Shield,
      color: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      subtext: breakdown.total > 0 ? `${breakdown.necessaryPct.toFixed(0)}% of spending` : 'No necessary expenses yet',
      empty: breakdown.total === 0,
    },
    {
      label: 'Luxury',
      value: breakdown.total > 0 ? `₹${breakdown.luxury.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : '₹0',
      icon: Gem,
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
      subtext: breakdown.total > 0 ? `${breakdown.luxuryPct.toFixed(0)}% of spending` : 'No luxury expenses yet',
      empty: breakdown.total === 0,
    },
    {
      label: 'Luxury Ratio',
      value: breakdown.total > 0 ? `${breakdown.luxuryPct.toFixed(0)}%` : '--',
      icon: Percent,
      color: breakdown.luxuryPct > 40
        ? 'bg-gradient-to-br from-red-500 to-red-600'
        : 'bg-gradient-to-br from-teal-500 to-teal-600',
      subtext: breakdown.total > 0
        ? (breakdown.luxuryPct > 40 ? 'High luxury spending' : 'Healthy ratio')
        : 'Add expenses to see ratio',
      empty: breakdown.total === 0,
    },
    {
      label: 'Top Category',
      value: topCategory ? topCategory[0] : 'No Data',
      icon: TrendingUp,
      color: 'bg-gradient-to-br from-amber-500 to-amber-600',
      subtext: topCategory
        ? `₹${topCategory[1].toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
        : 'Start adding expenses',
      empty: !topCategory,
    },
    {
      label: 'Predicted',
      value: latestPrediction > 0 ? `₹${latestPrediction.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : 'Pending',
      icon: Target,
      color: 'bg-gradient-to-br from-orange-500 to-orange-600',
      subtext: latestPrediction > 0 ? 'Next month estimate' : 'Need 3+ months of data',
      empty: latestPrediction === 0,
    },
  ];

  return (
    <div className="mb-6">
      {/* Spending breakdown banner */}
      {breakdown.total > 0 && (
        <div className="card mb-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 border-l-4 border-blue-500 animate-slide-in-up">
          <div className="flex items-center gap-2">
            <BarChart3 size={18} className="text-blue-600 dark:text-blue-400" />
            <p className="text-gray-700 dark:text-gray-300 text-sm font-medium">
              This month: <span className="text-emerald-600 dark:text-emerald-400 font-bold">₹{breakdown.necessary.toLocaleString('en-IN', { maximumFractionDigits: 0 })} ({breakdown.necessaryPct.toFixed(0)}%)</span> was necessary spending and{' '}
              <span className="text-purple-600 dark:text-purple-400 font-bold">₹{breakdown.luxury.toLocaleString('en-IN', { maximumFractionDigits: 0 })} ({breakdown.luxuryPct.toFixed(0)}%)</span> was luxury spending.
            </p>
          </div>
        </div>
      )}

      {/* Empty state message */}
      {!hasData && (
        <div className="card mb-6 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800 dark:to-slate-800 border-l-4 border-gray-400 animate-slide-in-up">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <DollarSign size={20} className="text-gray-500" />
            </div>
            <div>
              <p className="text-gray-700 dark:text-gray-300 font-medium">
                No spending data available yet
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Add your first expense to see detailed statistics and insights
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`card animate-slide-in-up transition-all duration-200 ${stat.empty ? 'opacity-60' : 'hover:shadow-md'}`}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="flex flex-col items-center text-center">
              <div className={`${stat.color} p-3 rounded-lg shadow-lg transform transition-transform hover:scale-110 mb-3 ${stat.empty ? 'opacity-50' : ''}`}>
                <stat.icon size={20} className="text-white" />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{stat.label}</p>
              <p className={`text-lg font-bold ${stat.empty ? 'text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-gray-100'}`}>
                {stat.value}
              </p>
              <p className={`text-xs mt-1 ${stat.empty ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400'}`}>
                {stat.subtext}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsCards;
