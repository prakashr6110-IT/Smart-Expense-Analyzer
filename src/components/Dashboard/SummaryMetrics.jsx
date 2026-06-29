import { useMemo } from 'react';
import { Wallet, PieChart, TrendingUp, Brain } from 'lucide-react';
import { startOfMonth } from 'date-fns';
import MetricCard from '../UI/MetricCard';
import Card from '../UI/Card';

/**
 * SummaryMetrics - 4-column summary section below Hero
 * Uses existing expense data only - no new calculations
 */
const SummaryMetrics = ({ expenses, profile }) => {
  const metrics = useMemo(() => {
    const now = new Date();
    const currentMonth = startOfMonth(now);
    const monthExpenses = expenses.filter(exp => new Date(exp.expense_date) >= currentMonth);

    // 1. Total Spent
    const totalSpent = monthExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

    // 2. Top Category
    const categoryTotals = {};
    monthExpenses.forEach(exp => {
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + parseFloat(exp.amount);
    });
    const topCat = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
    const topCategory = topCat ? topCat[0] : 'No data';

    // 3. Avg Per Day
    const daysPassed = now.getDate();
    const avgPerDay = daysPassed > 0 ? totalSpent / daysPassed : 0;

    // 4. AI Risk Score (1-10 based on budget usage)
    const monthlyBudget = profile?.monthly_budget ? parseFloat(profile.monthly_budget) : 10000;
    const budgetUsedPct = monthlyBudget > 0 ? (totalSpent / monthlyBudget) * 100 : 0;
    let riskScore;
    if (budgetUsedPct >= 100) riskScore = 10;
    else if (budgetUsedPct >= 90) riskScore = 8;
    else if (budgetUsedPct >= 80) riskScore = 7;
    else if (budgetUsedPct >= 70) riskScore = 6;
    else if (budgetUsedPct >= 60) riskScore = 5;
    else if (budgetUsedPct >= 50) riskScore = 4;
    else if (budgetUsedPct >= 30) riskScore = 3;
    else if (budgetUsedPct >= 15) riskScore = 2;
    else riskScore = 1;

    const getRiskColor = (score) => {
      if (score <= 3) return '#10B981'; // green
      if (score <= 7) return '#F59E0B'; // yellow
      return '#EF4444'; // red
    };

    return {
      totalSpent: `₹${totalSpent.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
      topCategory,
      avgPerDay: `₹${avgPerDay.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
      riskScore,
      riskColor: getRiskColor(riskScore),
    };
  }, [expenses, profile]);

  if (expenses.length === 0) return null;

  return (
    <div className="px-4 md:px-8 lg:px-12 -mt-10 relative z-10 mb-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Spent"
          value={metrics.totalSpent}
          icon={Wallet}
          accentColor="#00C9A7"
          delay={0}
        />
        <MetricCard
          label="Top Category"
          value={metrics.topCategory}
          icon={PieChart}
          accentColor="#7C6FFF"
          delay={100}
        />
        <MetricCard
          label="Avg Per Day"
          value={metrics.avgPerDay}
          icon={TrendingUp}
          accentColor="#00C9A7"
          delay={200}
        />
        <Card
          hoverable
          className="relative overflow-hidden animate-fade-in-up"
          style={{
            animationDelay: '300ms',
            borderLeft: `4px solid ${metrics.riskColor}`,
          }}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-caption text-slate-500 dark:text-[#94A3B8] uppercase tracking-wider mb-2">
                AI Risk Score
              </p>
              <div className="flex items-center gap-2">
                <span className="text-h1 font-bold text-slate-900 dark:text-white leading-tight">
                  {metrics.riskScore}
                </span>
                <span className="text-sm text-slate-500 dark:text-[#64748B]">/10</span>
              </div>
            </div>
            <div className="flex-shrink-0 ml-3">
              <Brain size={22} style={{ color: metrics.riskColor }} />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SummaryMetrics;
