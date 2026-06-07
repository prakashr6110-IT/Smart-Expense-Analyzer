import { Flame, Trophy, TrendingUp, TrendingDown, Target, Award, Zap } from 'lucide-react';
import { startOfMonth, subMonths, subWeeks, startOfWeek, endOfWeek, format, differenceInDays } from 'date-fns';
import { getExpenseType } from '../../utils/categoryClassification';

const SpendingStreaks = ({ expenses, profile }) => {
  const monthlyBudget = profile?.monthly_budget ? parseFloat(profile.monthly_budget) : 10000;
  const achievements = calculateAchievements(expenses, monthlyBudget);

  if (achievements.length === 0) {
    return (
      <div className="card mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-accent-warning/20 flex items-center justify-center">
            <Trophy size={20} className="text-accent-warning" />
          </div>
          <h3 className="text-lg font-heading font-bold text-txt-primary">Spending Streaks</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-16 h-16 bg-fintech-secondary rounded-2xl flex items-center justify-center mb-4 border border-white/5">
            <Trophy size={28} className="text-txt-muted" />
          </div>
          <p className="text-txt-secondary font-medium">
            Start tracking to earn achievements
          </p>
          <p className="text-sm text-txt-muted mt-1">
            Your spending milestones will appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card mb-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-accent-warning/20 flex items-center justify-center">
          <Trophy size={20} className="text-accent-warning" />
        </div>
        <h3 className="text-lg font-heading font-bold text-txt-primary">Spending Streaks</h3>
        <span className="text-xs bg-accent-warning/10 text-accent-warning px-2.5 py-1 rounded-full font-medium border border-accent-warning/20">
          {achievements.length} achieved
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {achievements.map((achievement, index) => (
          <div
            key={index}
            className={`relative overflow-hidden rounded-xl p-4 border transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${getAchievementStyles(achievement.tier)}`}
          >
            {/* Background decoration */}
            <div className={`absolute top-0 right-0 w-20 h-20 -mr-6 -mt-6 rounded-full opacity-10 ${getAchievementBg(achievement.tier)}`} />
            
            <div className="flex items-start gap-3">
              <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${getAchievementIconBg(achievement.tier)}`}>
                <achievement.icon size={20} className={getAchievementIconColor(achievement.tier)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-txt-primary">
                  {achievement.emoji} {achievement.title}
                </p>
                <p className="text-xs text-txt-muted mt-0.5">
                  {achievement.description}
                </p>
                {achievement.value && (
                  <p className={`text-xs font-semibold mt-1 ${getAchievementValueColor(achievement.tier)}`}>
                    {achievement.value}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const calculateAchievements = (expenses, monthlyBudget) => {
  if (!expenses || expenses.length < 2) return [];

  const now = new Date();
  const achievements = [];

  // Current month expenses
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const monthExpenses = expenses.filter(exp => {
    const date = new Date(exp.expense_date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  const totalThisMonth = monthExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

  // 1. Days Under Budget streak
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const dailyBudget = monthlyBudget / daysInMonth;
  const daysPassed = now.getDate();
  
  // Calculate consecutive days under daily budget
  let streak = 0;
  const dailyTotals = {};
  monthExpenses.forEach(exp => {
    const day = new Date(exp.expense_date).getDate();
    dailyTotals[day] = (dailyTotals[day] || 0) + parseFloat(exp.amount);
  });

  // Count streak from today backwards
  for (let day = daysPassed; day >= 1; day--) {
    const dayTotal = dailyTotals[day] || 0;
    if (dayTotal <= dailyBudget * 1.2) { // Allow 20% buffer
      streak++;
    } else {
      break;
    }
  }

  if (streak >= 3) {
    achievements.push({
      tier: streak >= 14 ? 'gold' : streak >= 7 ? 'silver' : 'bronze',
      icon: Flame,
      emoji: '🔥',
      title: `${streak} Days Under Budget`,
      description: 'Consecutive days staying within daily budget',
      value: streak >= 7 ? 'Amazing streak!' : 'Keep it up!',
    });
  }

  // 2. Savings compared to last week
  const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
  const lastWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
  const lastWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });

  const thisWeekExpenses = expenses.filter(exp => {
    const date = new Date(exp.expense_date);
    return date >= thisWeekStart && date <= now;
  });

  const lastWeekExpenses = expenses.filter(exp => {
    const date = new Date(exp.expense_date);
    return date >= lastWeekStart && date <= lastWeekEnd;
  });

  const thisWeekTotal = thisWeekExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  const lastWeekTotal = lastWeekExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

  if (lastWeekTotal > 0) {
    const saved = lastWeekTotal - thisWeekTotal;
    const percentChange = ((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100;

    if (saved > 0 && saved >= 200) {
      achievements.push({
        tier: saved >= 1000 ? 'gold' : saved >= 500 ? 'silver' : 'bronze',
        icon: TrendingDown,
        emoji: '💰',
        title: `Saved ₹${saved.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
        description: 'Compared to last week',
        value: `${Math.abs(percentChange).toFixed(0)}% reduction`,
      });
    } else if (percentChange > 10 && thisWeekTotal > 500) {
      achievements.push({
        tier: 'warning',
        icon: TrendingUp,
        emoji: '📈',
        title: `Spending Increased ${percentChange.toFixed(0)}%`,
        description: 'Compared to previous week',
        value: 'Consider reviewing expenses',
      });
    }
  }

  // 3. Monthly budget goal achieved
  if (totalThisMonth > 0 && monthlyBudget > 0) {
    const budgetUsedPercent = (totalThisMonth / monthlyBudget) * 100;
    
    if (budgetUsedPercent <= 80 && daysPassed >= 15) {
      achievements.push({
        tier: budgetUsedPercent <= 60 ? 'gold' : 'silver',
        icon: Target,
        emoji: '🎯',
        title: 'Budget Goal On Track',
        description: `${budgetUsedPercent.toFixed(0)}% of budget used with ${daysInMonth - daysPassed} days left`,
        value: `₹${(monthlyBudget - totalThisMonth).toLocaleString('en-IN', { maximumFractionDigits: 0 })} remaining`,
      });
    } else if (budgetUsedPercent <= 100 && daysPassed >= daysInMonth - 2) {
      achievements.push({
        tier: 'gold',
        icon: Award,
        emoji: '🏆',
        title: 'Monthly Budget Achieved!',
        description: 'Successfully stayed within budget this month',
        value: `₹${(monthlyBudget - totalThisMonth).toLocaleString('en-IN', { maximumFractionDigits: 0 })} saved`,
      });
    }
  }

  // 4. Low luxury ratio achievement
  if (monthExpenses.length >= 5) {
    let luxuryTotal = 0;
    monthExpenses.forEach(exp => {
      const type = exp.expense_type || getExpenseType(exp.category);
      if (type === 'luxury') luxuryTotal += parseFloat(exp.amount);
    });
    const luxuryRatio = (luxuryTotal / totalThisMonth) * 100;

    if (luxuryRatio <= 20 && totalThisMonth >= 1000) {
      achievements.push({
        tier: luxuryRatio <= 10 ? 'gold' : 'silver',
        icon: Zap,
        emoji: '⚡',
        title: 'Smart Spending Pattern',
        description: 'Luxury spending kept under 20% of total',
        value: `Only ${luxuryRatio.toFixed(0)}% luxury spending`,
      });
    }
  }

  // 5. Savings compared to last month
  const lastMonth = subMonths(now, 1);
  const lastMonthExpenses = expenses.filter(exp => {
    const date = new Date(exp.expense_date);
    return date.getMonth() === lastMonth.getMonth() && date.getFullYear() === lastMonth.getFullYear();
  });
  const lastMonthTotal = lastMonthExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

  if (lastMonthTotal > 0 && daysPassed >= 10) {
    const monthlySaved = lastMonthTotal - totalThisMonth;
    const monthlyPercentChange = ((totalThisMonth - lastMonthTotal) / lastMonthTotal) * 100;

    if (monthlySaved > 0 && monthlySaved >= 500) {
      achievements.push({
        tier: monthlySaved >= 2000 ? 'gold' : monthlySaved >= 1000 ? 'silver' : 'bronze',
        icon: TrendingDown,
        emoji: '💵',
        title: `Saved ₹${monthlySaved.toLocaleString('en-IN', { maximumFractionDigits: 0 })} vs Last Month`,
        description: 'Great job reducing monthly spending',
        value: `${Math.abs(monthlyPercentChange).toFixed(0)}% reduction`,
      });
    }
  }

  // 6. First expense milestone
  if (expenses.length >= 10) {
    achievements.push({
      tier: 'bronze',
      icon: Award,
      emoji: '📊',
      title: `${expenses.length} Expenses Tracked`,
      description: 'Building good tracking habits',
      value: expenses.length >= 50 ? 'Dedicated tracker!' : 'Keep logging!',
    });
  }

  // Sort by tier priority
  const tierOrder = { gold: 0, silver: 1, bronze: 2, warning: 3 };
  return achievements.sort((a, b) => tierOrder[a.tier] - tierOrder[b.tier]).slice(0, 6);
};

const getAchievementStyles = (tier) => {
  switch (tier) {
    case 'gold':
      return 'bg-accent-warning/5 border-accent-warning/20 hover:border-accent-warning/40 hover:shadow-accent-warning/10';
    case 'silver':
      return 'bg-fintech-secondary border-white/10 hover:border-white/20 hover:shadow-white/5';
    case 'warning':
      return 'bg-accent-danger/5 border-accent-danger/20 hover:border-accent-danger/40 hover:shadow-accent-danger/10';
    default:
      return 'bg-accent-warning/5 border-accent-warning/10 hover:border-accent-warning/30 hover:shadow-accent-warning/5';
  }
};

const getAchievementBg = (tier) => {
  switch (tier) {
    case 'gold':
      return 'bg-accent-warning';
    case 'silver':
      return 'bg-txt-muted';
    case 'warning':
      return 'bg-accent-danger';
    default:
      return 'bg-accent-warning';
  }
};

const getAchievementIconBg = (tier) => {
  switch (tier) {
    case 'gold':
      return 'bg-accent-warning/20';
    case 'silver':
      return 'bg-white/10';
    case 'warning':
      return 'bg-accent-danger/20';
    default:
      return 'bg-accent-warning/20';
  }
};

const getAchievementIconColor = (tier) => {
  switch (tier) {
    case 'gold':
      return 'text-accent-warning';
    case 'silver':
      return 'text-txt-secondary';
    case 'warning':
      return 'text-accent-danger';
    default:
      return 'text-accent-warning';
  }
};

const getAchievementValueColor = (tier) => {
  switch (tier) {
    case 'gold':
      return 'text-accent-warning';
    case 'silver':
      return 'text-txt-secondary';
    case 'warning':
      return 'text-accent-danger';
    default:
      return 'text-accent-warning';
  }
};

export default SpendingStreaks;
