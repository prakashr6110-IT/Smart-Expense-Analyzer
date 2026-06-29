import { Lightbulb, Clock, TrendingUp, TrendingDown, Calendar, AlertTriangle, ShoppingBag, Coffee } from 'lucide-react';
import { startOfMonth, subMonths, format, parseISO, getDay } from 'date-fns';
import { getExpenseType } from '../../utils/categoryClassification';
import InsightCard from '../UI/InsightCard';
import Card from '../UI/Card';

const BehaviorInsights = ({ expenses, profile }) => {
  const monthlyBudget = profile?.monthly_budget ? parseFloat(profile.monthly_budget) : 10000;
  const insights = generateInsights(expenses, monthlyBudget);

  if (insights.length === 0) {
    return (
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-accent-warning/20 flex items-center justify-center">
            <Lightbulb size={20} className="text-accent-warning" />
          </div>
          <h3 className="text-h3 font-heading text-slate-800 dark:text-txt-primary">Behavior Insights</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4">
            <Lightbulb size={28} className="text-slate-400 dark:text-txt-muted" />
          </div>
          <p className="text-slate-600 dark:text-txt-secondary font-medium">
            Add more expenses to unlock personalized insights
          </p>
          <p className="text-sm text-slate-400 dark:text-txt-muted mt-1.5">
            We need at least a few transactions to analyze your spending patterns
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-accent-warning/20 flex items-center justify-center">
          <Lightbulb size={20} className="text-accent-warning" />
        </div>
        <h3 className="text-h3 font-heading text-slate-800 dark:text-txt-primary">Behavior Insights</h3>
        <span className="text-xs bg-accent-warning/20 text-accent-warning px-2.5 py-1 rounded-full font-semibold">
          {insights.length} insights
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight, index) => (
          <InsightCard
            key={index}
            title={insight.title}
            description={insight.description}
            category={getCategoryFromType(insight.type)}
            icon={insight.icon}
            delay={index * 80}
          />
        ))}
      </div>
    </div>
  );
};

const generateInsights = (expenses, monthlyBudget) => {
  if (!expenses || expenses.length < 3) return [];

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Current month expenses
  const monthExpenses = expenses.filter(exp => {
    const date = new Date(exp.expense_date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  if (monthExpenses.length < 2) return [];

  // Last month expenses for comparison
  const lastMonth = subMonths(now, 1);
  const lastMonthExpenses = expenses.filter(exp => {
    const date = new Date(exp.expense_date);
    return date.getMonth() === lastMonth.getMonth() && date.getFullYear() === lastMonth.getFullYear();
  });

  const insights = [];

  // 1. Peak spending time analysis
  const hourBuckets = { morning: 0, afternoon: 0, evening: 0, night: 0 };
  monthExpenses.forEach(exp => {
    const hour = parseInt(exp.expense_time?.split(':')[0] || '12');
    const amount = parseFloat(exp.amount);
    if (hour >= 6 && hour < 12) hourBuckets.morning += amount;
    else if (hour >= 12 && hour < 17) hourBuckets.afternoon += amount;
    else if (hour >= 17 && hour < 21) hourBuckets.evening += amount;
    else hourBuckets.night += amount;
  });

  const peakTime = Object.entries(hourBuckets).sort((a, b) => b[1] - a[1])[0];
  if (peakTime && peakTime[1] > 0) {
    const timeLabels = {
      morning: '6 AM and 12 PM',
      afternoon: '12 PM and 5 PM',
      evening: '5 PM and 9 PM',
      night: '9 PM and 6 AM',
    };
    insights.push({
      type: 'info',
      icon: Clock,
      title: `Peak spending between ${timeLabels[peakTime[0]]}`,
      description: `₹${peakTime[1].toLocaleString('en-IN', { maximumFractionDigits: 0 })} spent during this time period`,
    });
  }

  // 2. Category comparison with last month
  const getCategoryTotals = (exps) => {
    const totals = {};
    exps.forEach(exp => {
      totals[exp.category] = (totals[exp.category] || 0) + parseFloat(exp.amount);
    });
    return totals;
  };

  const currentCategories = getCategoryTotals(monthExpenses);
  const lastMonthCategories = getCategoryTotals(lastMonthExpenses);

  // Find categories with significant changes
  Object.entries(currentCategories).forEach(([category, currentAmount]) => {
    const lastAmount = lastMonthCategories[category] || 0;
    if (lastAmount > 0) {
      const change = ((currentAmount - lastAmount) / lastAmount) * 100;
      if (Math.abs(change) >= 20 && currentAmount >= 500) {
        const type = getExpenseType(category);
        insights.push({
          type: change > 0 ? (type === 'luxury' ? 'warning' : 'info') : 'positive',
          icon: change > 0 ? TrendingUp : TrendingDown,
          title: `${category} spending ${change > 0 ? 'increased' : 'decreased'}`,
          description: `${change > 0 ? '+' : ''}${change.toFixed(0)}% compared to last month (₹${currentAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })})`,
        });
      }
    }
  });

  // 3. Weekend vs Weekday spending
  let weekendSpending = 0;
  let weekdaySpending = 0;
  let weekendCount = 0;
  let weekdayCount = 0;

  monthExpenses.forEach(exp => {
    const day = getDay(parseISO(exp.expense_date));
    const amount = parseFloat(exp.amount);
    if (day === 0 || day === 6) {
      weekendSpending += amount;
      weekendCount++;
    } else {
      weekdaySpending += amount;
      weekdayCount++;
    }
  });

  if (weekendCount > 0 && weekdayCount > 0) {
    const weekendAvg = weekendSpending / weekendCount;
    const weekdayAvg = weekdaySpending / weekdayCount;
    const ratio = weekendAvg / weekdayAvg;

    if (ratio > 1.5) {
      insights.push({
        type: 'warning',
        icon: Calendar,
        title: 'Weekend spending is higher',
        description: `Average weekend spend (₹${weekendAvg.toFixed(0)}) is ${((ratio - 1) * 100).toFixed(0)}% more than weekday (₹${weekdayAvg.toFixed(0)})`,
      });
    } else if (ratio < 0.7) {
      insights.push({
        type: 'positive',
        icon: Calendar,
        title: 'Consistent weekday spending',
        description: 'Your spending is well-balanced across the week',
      });
    }
  }

  // 4. Luxury spending trend
  let currentLuxury = 0;
  let lastMonthLuxury = 0;

  monthExpenses.forEach(exp => {
    const type = exp.expense_type || getExpenseType(exp.category);
    if (type === 'luxury') currentLuxury += parseFloat(exp.amount);
  });

  lastMonthExpenses.forEach(exp => {
    const type = exp.expense_type || getExpenseType(exp.category);
    if (type === 'luxury') lastMonthLuxury += parseFloat(exp.amount);
  });

  if (lastMonthLuxury > 0) {
    const luxuryChange = ((currentLuxury - lastMonthLuxury) / lastMonthLuxury) * 100;
    if (luxuryChange > 25) {
      insights.push({
        type: 'warning',
        icon: ShoppingBag,
        title: 'Luxury purchases are increasing',
        description: `Up ${luxuryChange.toFixed(0)}% from last month (₹${currentLuxury.toLocaleString('en-IN', { maximumFractionDigits: 0 })} total)`,
      });
    } else if (luxuryChange < -20) {
      insights.push({
        type: 'positive',
        icon: ShoppingBag,
        title: 'Great job reducing luxury spending!',
        description: `Down ${Math.abs(luxuryChange).toFixed(0)}% from last month`,
      });
    }
  }

  // 5. Budget risk warning
  const totalSpent = monthExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysPassed = now.getDate();
  const dailyAvg = totalSpent / daysPassed;
  const projectedTotal = dailyAvg * daysInMonth;

  if (projectedTotal > monthlyBudget && daysPassed < daysInMonth) {
    const overBy = projectedTotal - monthlyBudget;
    insights.push({
      type: 'danger',
      icon: AlertTriangle,
      title: 'High risk of exceeding budget',
      description: `At current pace, you'll overspend by ~₹${overBy.toLocaleString('en-IN', { maximumFractionDigits: 0 })} this month`,
    });
  } else if (projectedTotal < monthlyBudget * 0.7 && daysPassed > daysInMonth * 0.5) {
    insights.push({
      type: 'positive',
      icon: TrendingDown,
      title: 'On track to stay under budget',
      description: `Projected to spend ₹${(monthlyBudget - projectedTotal).toLocaleString('en-IN', { maximumFractionDigits: 0 })} less than budget`,
    });
  }

  // 6. Late night spending
  let lateNightCount = 0;
  let lateNightAmount = 0;
  monthExpenses.forEach(exp => {
    const hour = parseInt(exp.expense_time?.split(':')[0] || '12');
    if (hour >= 22 || hour < 5) {
      lateNightCount++;
      lateNightAmount += parseFloat(exp.amount);
    }
  });

  if (lateNightCount >= 3) {
    insights.push({
      type: 'warning',
      icon: Coffee,
      title: 'Frequent late-night purchases',
      description: `${lateNightCount} transactions after 10 PM totaling ₹${lateNightAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
    });
  }

  return insights.slice(0, 6);
};

// Map insight types to InsightCard categories
const getCategoryFromType = (type) => {
  switch (type) {
    case 'warning':
    case 'danger':
      return 'warning';
    case 'positive':
      return 'suggestion';
    default:
      return 'pattern';
  }
};

export default BehaviorInsights;
