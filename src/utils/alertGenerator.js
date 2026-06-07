import { getDay, parseISO, format } from 'date-fns';
import { getExpenseType } from './categoryClassification';

/**
 * Generate budget threshold alerts + luxury alerts
 * Only triggers alerts at specific thresholds: 25%, 50%, 75%, 90%+
 * @param {Array} expenses - All expenses
 * @param {number} monthlyBudget - User's monthly budget
 * @param {Array} existingAlerts - Already stored alerts to avoid duplicates
 */
export const generateAlerts = (expenses, monthlyBudget = 10000, existingAlerts = []) => {
  if (!expenses || expenses.length === 0) return [];

  const alerts = [];

  // Check budget threshold alerts
  const budgetAlerts = checkBudgetThresholds(expenses, monthlyBudget, existingAlerts);
  alerts.push(...budgetAlerts);

  // Check luxury budget warning
  const luxuryAlert = checkLuxuryBudgetWarning(expenses, monthlyBudget, existingAlerts);
  if (luxuryAlert) {
    alerts.push(luxuryAlert);
  }

  // Check weekend luxury trend
  const weekendLuxuryAlert = checkWeekendLuxuryTrend(expenses, existingAlerts);
  if (weekendLuxuryAlert) {
    alerts.push(weekendLuxuryAlert);
  }

  // Check weekend overspending
  const weekendAlert = checkWeekendOverspending(expenses);
  if (weekendAlert) {
    alerts.push(weekendAlert);
  }

  // Check time-based warning (enhanced with luxury info)
  const timeAlert = checkTimeWarning(expenses);
  if (timeAlert) {
    alerts.push(timeAlert);
  }

  // Check category spike
  const categoryAlert = checkCategorySpike(expenses);
  if (categoryAlert) {
    alerts.push(categoryAlert);
  }

  return alerts;
};

const checkBudgetThresholds = (expenses, monthlyBudget, existingAlerts = []) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthExpenses = expenses.filter(exp => {
    const date = new Date(exp.expense_date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  const totalSpent = monthExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  const percentage = (totalSpent / monthlyBudget) * 100;

  // Define thresholds
  const thresholds = [
    {
      level: 90,
      alert_type: 'danger',
      label: 'CRITICAL',
      message: (pct, spent, budget) =>
        `🚨 DANGER ZONE: You've spent ${pct.toFixed(1)}% of your monthly budget (₹${spent.toFixed(2)} / ₹${budget.toFixed(2)}). You are in the CRITICAL zone! Reduce spending immediately!`,
    },
    {
      level: 75,
      alert_type: 'warning',
      label: 'High',
      message: (pct, spent, budget) =>
        `⚠️ High Spending Alert: You've used ${pct.toFixed(1)}% of your monthly budget (₹${spent.toFixed(2)} / ₹${budget.toFixed(2)}). Only ${(100 - pct).toFixed(1)}% remaining — spend carefully!`,
    },
    {
      level: 50,
      alert_type: 'info',
      label: 'Medium',
      message: (pct, spent, budget) =>
        `📊 Budget Update: You've spent ${pct.toFixed(1)}% of your monthly budget (₹${spent.toFixed(2)} / ₹${budget.toFixed(2)}). Half your budget is used — stay on track!`,
    },
    {
      level: 25,
      alert_type: 'info',
      label: 'Low',
      message: (pct, spent, budget) =>
        `📌 Spending Notice: You've used ${pct.toFixed(1)}% of your monthly budget (₹${spent.toFixed(2)} / ₹${budget.toFixed(2)}). Keep monitoring your expenses.`,
    },
  ];

  const alerts = [];

  for (const threshold of thresholds) {
    if (percentage >= threshold.level) {
      const alreadyExists = existingAlerts.some(existing => {
        const alertDate = new Date(existing.created_at);
        const sameMonth = alertDate.getMonth() === currentMonth && alertDate.getFullYear() === currentYear;
        const sameType = existing.alert_type === threshold.alert_type;
        const sameLevel = existing.message && existing.message.includes(threshold.label);
        return sameMonth && sameType && sameLevel;
      });

      if (!alreadyExists) {
        alerts.push({
          alert_type: threshold.alert_type,
          message: threshold.message(percentage, totalSpent, monthlyBudget),
        });
      }

      for (const lower of thresholds) {
        if (lower.level < threshold.level && percentage >= lower.level) {
          const lowerExists = existingAlerts.some(existing => {
            const alertDate = new Date(existing.created_at);
            const sameMonth = alertDate.getMonth() === currentMonth && alertDate.getFullYear() === currentYear;
            const sameLevel = existing.message && existing.message.includes(lower.label);
            return sameMonth && sameLevel;
          });

          if (!lowerExists) {
            alerts.push({
              alert_type: lower.alert_type,
              message: lower.message(percentage, totalSpent, monthlyBudget),
            });
          }
        }
      }

      break;
    }
  }

  return alerts;
};

// ============ NEW: LUXURY BUDGET WARNING ============

const checkLuxuryBudgetWarning = (expenses, monthlyBudget, existingAlerts = []) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Implicit luxury budget = 40% of total monthly budget
  const luxuryBudget = monthlyBudget * 0.4;

  const monthExpenses = expenses.filter(exp => {
    const date = new Date(exp.expense_date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  let luxurySpent = 0;
  monthExpenses.forEach(exp => {
    const type = exp.expense_type || getExpenseType(exp.category);
    if (type === 'luxury') {
      luxurySpent += parseFloat(exp.amount);
    }
  });

  if (luxuryBudget <= 0) return null;

  const luxuryPct = (luxurySpent / luxuryBudget) * 100;

  if (luxuryPct >= 85) {
    // Check if alert already exists this month
    const alreadyExists = existingAlerts.some(existing => {
      const alertDate = new Date(existing.created_at);
      const sameMonth = alertDate.getMonth() === currentMonth && alertDate.getFullYear() === currentYear;
      return sameMonth && existing.message && existing.message.includes('luxury budget');
    });

    if (!alreadyExists) {
      const severity = luxuryPct >= 100 ? 'danger' : 'warning';
      const msg = luxuryPct >= 100
        ? `🚨 Luxury Overspending: You've used ${luxuryPct.toFixed(0)}% of your luxury budget (₹${luxurySpent.toFixed(0)} / ₹${luxuryBudget.toFixed(0)}). You've exceeded your luxury limit — cut back on non-essential spending!`
        : `⚠️ Luxury spending has reached ${luxuryPct.toFixed(0)}% of your monthly luxury budget (₹${luxurySpent.toFixed(0)} / ₹${luxuryBudget.toFixed(0)}). Review your luxury purchases before proceeding.`;

      return { alert_type: severity, message: msg };
    }
  }

  return null;
};

// ============ NEW: WEEKEND LUXURY TREND ============

const checkWeekendLuxuryTrend = (expenses, existingAlerts = []) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthExpenses = expenses.filter(exp => {
    const date = new Date(exp.expense_date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  let weekendLuxury = 0;
  let weekendTotal = 0;
  let weekdayLuxury = 0;
  let weekdayTotal = 0;

  monthExpenses.forEach(exp => {
    const date = new Date(exp.expense_date);
    const day = date.getDay();
    const amount = parseFloat(exp.amount);
    const type = exp.expense_type || getExpenseType(exp.category);

    if (day === 0 || day === 6) {
      weekendTotal += amount;
      if (type === 'luxury') weekendLuxury += amount;
    } else {
      weekdayTotal += amount;
      if (type === 'luxury') weekdayLuxury += amount;
    }
  });

  if (weekendTotal === 0 || weekdayTotal === 0) return null;

  const weekendLuxPct = (weekendLuxury / weekendTotal) * 100;
  const weekdayLuxPct = (weekdayLuxury / weekdayTotal) * 100;
  const diff = weekendLuxPct - weekdayLuxPct;

  if (diff >= 40) {
    const alreadyExists = existingAlerts.some(existing => {
      const alertDate = new Date(existing.created_at);
      const sameMonth = alertDate.getMonth() === currentMonth && alertDate.getFullYear() === currentYear;
      return sameMonth && existing.message && existing.message.includes('Weekend spending trend');
    });

    if (!alreadyExists) {
      return {
        alert_type: 'warning',
        message: `📅 Weekend spending trend detected: You spend ${diff.toFixed(0)}% more on luxury items during weekends. ${weekendLuxPct.toFixed(0)}% of weekend expenses are luxury purchases.`,
      };
    }
  }

  return null;
};

// ============ EXISTING ALERTS (ENHANCED) ============

const checkWeekendOverspending = (expenses) => {
  const now = new Date();
  const last30Days = expenses.filter(exp => {
    const date = parseISO(exp.expense_date);
    const diffDays = (now - date) / (1000 * 60 * 60 * 24);
    return diffDays <= 30;
  });

  let weekendTotal = 0;
  let totalCount = 0;

  last30Days.forEach(expense => {
    const date = parseISO(expense.expense_date);
    const day = getDay(date);
    const amount = parseFloat(expense.amount);

    if (day === 0 || day === 6) {
      weekendTotal += amount;
    }
    totalCount += amount;
  });

  if (totalCount === 0) return null;

  const weekendRatio = weekendTotal / totalCount;

  if (weekendRatio > 0.7) {
    return {
      alert_type: 'warning',
      message: `Weekend overspending detected: You spend most of your money on weekends (₹${weekendTotal.toLocaleString('en-IN')})`,
    };
  }

  return null;
};

const checkTimeWarning = (expenses) => {
  const now = new Date();
  const currentHour = now.getHours();

  // Analyze spending patterns by hour (separate luxury)
  const hourData = {};
  expenses.forEach(expense => {
    const hour = parseInt(expense.expense_time.split(':')[0]);
    const type = expense.expense_type || getExpenseType(expense.category);

    if (!hourData[hour]) hourData[hour] = { count: 0, luxuryCount: 0 };
    hourData[hour].count++;
    if (type === 'luxury') hourData[hour].luxuryCount++;
  });

  // Find peak hour
  const peakEntry = Object.entries(hourData).reduce((a, b) =>
    a[1].count > b[1].count ? a : b
  );

  if (!peakEntry || peakEntry[1].count < 3) return null;

  const peakHourInt = parseInt(peakEntry[0]);
  const period = peakHourInt >= 12 ? 'PM' : 'AM';
  const displayHour = peakHourInt > 12 ? peakHourInt - 12 : peakHourInt;
  const luxuryPct = ((peakEntry[1].luxuryCount / peakEntry[1].count) * 100).toFixed(0);

  // If current time is near peak spending time
  if (Math.abs(currentHour - peakHourInt) <= 1) {
    const isLuxuryHeavy = parseInt(luxuryPct) > 50;
    const msg = isLuxuryHeavy
      ? `You usually make luxury purchases around ${displayHour} ${period}. Consider reviewing this purchase before proceeding.`
      : `You usually spend around ${displayHour} ${period}. Be mindful of your spending today!`;

    return { alert_type: 'info', message: msg };
  }

  return null;
};

const checkCategorySpike = (expenses) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  const categoryComparison = {};

  expenses.forEach(expense => {
    const date = new Date(expense.expense_date);
    const category = expense.category;
    const amount = parseFloat(expense.amount);

    if (!categoryComparison[category]) {
      categoryComparison[category] = { current: 0, last: 0 };
    }

    if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
      categoryComparison[category].current += amount;
    } else if (date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear) {
      categoryComparison[category].last += amount;
    }
  });

  for (const [category, data] of Object.entries(categoryComparison)) {
    if (data.last > 0) {
      const increase = ((data.current - data.last) / data.last) * 100;
      if (increase > 50) {
        const type = getExpenseType(category);
        return {
          alert_type: 'warning',
          message: `Unusual spending spike in ${category} (${type}): ${increase.toFixed(0)}% increase from last month`,
        };
      }
    }
  }

  return null;
};
