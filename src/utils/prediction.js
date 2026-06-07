import { subMonths, startOfMonth, format, parseISO, getDay } from 'date-fns';
import { getExpenseType, getMonthlySplitTotals } from './categoryClassification';

export const predictNextMonthExpense = (expenses, monthlyBudget = 10000) => {
  if (!expenses || expenses.length < 3) return null;

  // Get last 3 months' totals (split by type)
  const last3Months = getLast3MonthsSplitTotals(expenses);

  if (last3Months.length < 3) return null;

  // Total prediction
  const totalAvg = last3Months.reduce((sum, m) => sum + m.total, 0) / last3Months.length;
  const necessaryAvg = last3Months.reduce((sum, m) => sum + m.necessary, 0) / last3Months.length;
  const luxuryAvg = last3Months.reduce((sum, m) => sum + m.luxury, 0) / last3Months.length;

  // Calculate trends
  const totalTrend = calculateTrend(last3Months.map(m => m.total));
  const necessaryTrend = calculateTrend(last3Months.map(m => m.necessary));
  const luxuryTrend = calculateTrend(last3Months.map(m => m.luxury));

  // Adjust predictions based on trend
  let predictedTotal = totalAvg;
  let predictedNecessary = necessaryAvg;
  let predictedLuxury = luxuryAvg;

  if (totalTrend > 0) predictedTotal = totalAvg * (1 + totalTrend / 100);
  else if (totalTrend < 0) predictedTotal = totalAvg * (1 + totalTrend / 100);

  if (necessaryTrend > 0) predictedNecessary = necessaryAvg * (1 + necessaryTrend / 100);
  else if (necessaryTrend < 0) predictedNecessary = necessaryAvg * (1 + necessaryTrend / 100);

  if (luxuryTrend > 0) predictedLuxury = luxuryAvg * (1 + luxuryTrend / 100);
  else if (luxuryTrend < 0) predictedLuxury = luxuryAvg * (1 + luxuryTrend / 100);

  // Confidence
  const confidence = calculateConfidence(last3Months.map(m => m.total));

  // Financial score
  const financialScore = calculateFinancialScore(expenses, monthlyBudget);

  // Next month
  const nextMonth = startOfMonth(new Date());
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  return {
    predicted_amount: parseFloat(predictedTotal.toFixed(2)),
    predicted_necessary: parseFloat(predictedNecessary.toFixed(2)),
    predicted_luxury: parseFloat(predictedLuxury.toFixed(2)),
    financial_score: parseFloat(financialScore.toFixed(2)),
    prediction_month: format(nextMonth, 'yyyy-MM-dd'),
    confidence: parseFloat(confidence.toFixed(2)),
    trend_percentage: parseFloat(totalTrend.toFixed(2)),
    last_3_months_average: parseFloat(totalAvg.toFixed(2)),
  };
};

/**
 * Calculate Financial Health Score
 *
 * Core formula:
 *   - Start at 100 (no spending = perfect health)
 *   - ANY spending reduces the score
 *   - Luxury spending counts 1.5x more than necessary against the budget
 *   - When budget is fully spent → score = 0
 *   - When spending exceeds budget → score goes NEGATIVE
 *   - Additional small penalties for late-night and weekend luxury purchases
 */
export const calculateFinancialScore = (expenses, monthlyBudget = 10000) => {
  if (!expenses || expenses.length === 0) return 100;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthExpenses = expenses.filter(exp => {
    const date = new Date(exp.expense_date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  if (monthExpenses.length === 0) return 100;

  // Calculate totals
  let totalSpent = 0;
  let luxurySpent = 0;
  let necessarySpent = 0;
  let lateNightLuxuryCount = 0;
  let weekendLuxuryCount = 0;
  let totalLuxuryCount = 0;

  monthExpenses.forEach(exp => {
    const amount = parseFloat(exp.amount);
    const type = exp.expense_type || getExpenseType(exp.category);
    const hour = parseInt(exp.expense_time.split(':')[0]);
    const day = getDay(parseISO(exp.expense_date));

    totalSpent += amount;
    if (type === 'luxury') {
      luxurySpent += amount;
      totalLuxuryCount++;
      if (hour >= 20 || hour < 6) lateNightLuxuryCount++;
      if (day === 0 || day === 6) weekendLuxuryCount++;
    } else {
      necessarySpent += amount;
    }
  });

  // === CORE SCORE: Budget consumption ===
  // Luxury counts 1.5x more than necessary
  const effectiveSpent = necessarySpent + (luxurySpent * 1.5);
  let score = 100 * (1 - effectiveSpent / monthlyBudget);
  // score=100 when nothing spent, score=0 when budget exhausted, negative when over

  // === BEHAVIOR PENALTIES (small additional deductions) ===

  // Late-night luxury purchases penalty (extra -3 per late-night luxury item, max -15)
  if (lateNightLuxuryCount > 0) {
    score -= Math.min(lateNightLuxuryCount * 3, 15);
  }

  // Weekend impulse luxury penalty (extra -3 per weekend luxury item, max -15)
  if (weekendLuxuryCount > 0) {
    score -= Math.min(weekendLuxuryCount * 3, 15);
  }

  // No clamping — score can go negative when over budget
  return score;
};

/**
 * Get score rating text (supports negative scores)
 */
export const getScoreRating = (score) => {
  if (score >= 90) return { text: 'Excellent', color: 'text-green-600', emoji: '🏆' };
  if (score >= 70) return { text: 'Good spending habits', color: 'text-emerald-600', emoji: '✅' };
  if (score >= 50) return { text: 'Fair — room for improvement', color: 'text-yellow-600', emoji: '⚡' };
  if (score >= 25) return { text: 'Needs improvement', color: 'text-orange-600', emoji: '⚠️' };
  if (score >= 0) return { text: 'Critical — review spending', color: 'text-red-600', emoji: '🚨' };
  return { text: 'Over budget — spending exceeds income', color: 'text-red-700', emoji: '💸' };
};

/**
 * Calculate detailed score breakdown for display
 * The breakdown MUST sum to the main calculateFinancialScore result
 * 
 * Score distribution (100 points total):
 * - Budget Adherence: Up to 50 points (based on budget consumption)
 * - Luxury Control: Up to 25 points (penalty for luxury ratio > 20%)
 * - Weekend Control: Up to 15 points (penalty for weekend luxury)
 * - Savings Potential: Up to 10 points (based on remaining budget)
 * 
 * Note: The main formula uses effectiveSpent = necessary + (luxury * 1.5)
 * This breakdown visualizes where the deductions come from.
 */
export const calculateScoreBreakdown = (expenses, monthlyBudget = 10000) => {
  const defaultBreakdown = {
    budgetAdherence: { score: 50, max: 50, label: 'Budget Adherence' },
    luxuryControl: { score: 25, max: 25, label: 'Luxury Control' },
    weekendControl: { score: 15, max: 15, label: 'Weekend Spending Control' },
    savingsPotential: { score: 10, max: 10, label: 'Savings Potential' },
  };

  if (!expenses || expenses.length === 0) return defaultBreakdown;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthExpenses = expenses.filter(exp => {
    const date = new Date(exp.expense_date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  if (monthExpenses.length === 0) return defaultBreakdown;

  // Calculate totals
  let totalSpent = 0;
  let luxurySpent = 0;
  let necessarySpent = 0;
  let lateNightLuxuryCount = 0;
  let weekendLuxuryCount = 0;

  monthExpenses.forEach(exp => {
    const amount = parseFloat(exp.amount);
    const type = exp.expense_type || getExpenseType(exp.category);
    const hour = parseInt(exp.expense_time?.split(':')[0] || '12');
    const day = getDay(parseISO(exp.expense_date));

    totalSpent += amount;
    if (type === 'luxury') {
      luxurySpent += amount;
      if (hour >= 20 || hour < 6) lateNightLuxuryCount++;
      if (day === 0 || day === 6) weekendLuxuryCount++;
    } else {
      necessarySpent += amount;
    }
  });

  // === ALIGN WITH MAIN SCORE FORMULA ===
  // Main formula: score = 100 * (1 - effectiveSpent / monthlyBudget) - penalties
  // effectiveSpent = necessarySpent + (luxurySpent * 1.5)
  
  const effectiveSpent = necessarySpent + (luxurySpent * 1.5);
  const budgetUsedRatio = monthlyBudget > 0 ? effectiveSpent / monthlyBudget : 0;
  
  // 1. Budget Adherence (50 points)
  // This is the main factor - based on effective budget consumption
  // Full 50 points when nothing spent, decreases as budget is used
  let budgetAdherenceScore = 50 * (1 - Math.min(budgetUsedRatio, 1));
  // Can go negative if over budget, but clamp for display
  budgetAdherenceScore = Math.max(0, budgetAdherenceScore);

  // 2. Luxury Control (25 points)
  // The 1.5x multiplier impact: luxury spending hurts more
  // Show deduction based on luxury ratio of total spending
  const luxuryRatio = totalSpent > 0 ? luxurySpent / totalSpent : 0;
  let luxuryControlScore = 25;
  if (luxuryRatio > 0.3) {
    // Heavy luxury penalty: lose up to 25 points
    luxuryControlScore = Math.max(0, 25 - (luxuryRatio - 0.3) * 50);
  } else if (luxuryRatio > 0.15) {
    // Moderate luxury: lose some points
    luxuryControlScore = 25 - (luxuryRatio - 0.15) * 30;
  }

  // 3. Weekend Spending Control (15 points)
  // Penalty for weekend and late-night luxury purchases
  let weekendControlScore = 15;
  const totalPenaltyCount = weekendLuxuryCount + lateNightLuxuryCount;
  if (totalPenaltyCount > 0) {
    weekendControlScore = Math.max(0, 15 - totalPenaltyCount * 5);
  }

  // 4. Savings Potential (10 points)
  // Based on how much budget remains (actual, not effective)
  const remainingBudget = monthlyBudget - totalSpent;
  let savingsPotentialScore = 10;
  if (remainingBudget < 0) {
    savingsPotentialScore = 0;
  } else if (remainingBudget < monthlyBudget * 0.3) {
    savingsPotentialScore = (remainingBudget / (monthlyBudget * 0.3)) * 10;
  }

  return {
    budgetAdherence: { score: Math.round(budgetAdherenceScore), max: 50, label: 'Budget Adherence' },
    luxuryControl: { score: Math.round(luxuryControlScore), max: 25, label: 'Luxury Control' },
    weekendControl: { score: Math.round(weekendControlScore), max: 15, label: 'Weekend Spending Control' },
    savingsPotential: { score: Math.round(savingsPotentialScore), max: 10, label: 'Savings Potential' },
  };
};

// ============ HELPER FUNCTIONS ============

const getLast3MonthsSplitTotals = (expenses) => {
  const now = new Date();
  const months = [];

  // Start from current month (i=0) and go back 2 more months
  for (let i = 0; i < 3; i++) {
    const monthDate = subMonths(now, i);
    const month = monthDate.getMonth();
    const year = monthDate.getFullYear();

    const split = getMonthlySplitTotals(expenses, month, year);

    months.push({
      month: format(monthDate, 'yyyy-MM'),
      total: split.total,
      necessary: split.necessary,
      luxury: split.luxury,
    });
  }

  // Reverse so oldest month is first — trend calculation needs chronological order
  return months.reverse();
};

const calculateTrend = (values) => {
  if (values.length < 2) return 0;

  const n = values.length;
  const xValues = values.map((_, i) => i);
  const yValues = values;

  const xMean = xValues.reduce((a, b) => a + b, 0) / n;
  const yMean = yValues.reduce((a, b) => a + b, 0) / n;

  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < n; i++) {
    numerator += (xValues[i] - xMean) * (yValues[i] - yMean);
    denominator += (xValues[i] - xMean) ** 2;
  }

  const slope = denominator === 0 ? 0 : numerator / denominator;
  const trendPercentage = yMean === 0 ? 0 : (slope / yMean) * 100;

  return trendPercentage;
};

const calculateConfidence = (values) => {
  if (values.length < 2) return 50;

  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + (val - mean) ** 2, 0) / values.length;
  const stdDev = Math.sqrt(variance);
  const cv = mean === 0 ? 1 : stdDev / mean;
  const confidence = Math.max(0, Math.min(100, (1 - cv) * 100));

  return confidence;
};

/**
 * Calculate Budget Exhaustion Forecast
 * Predicts when the monthly budget will run out based on current spending rate
 */
export const calculateBudgetExhaustionForecast = (expenses, monthlyBudget = 10000) => {
  if (!expenses || expenses.length === 0 || monthlyBudget <= 0) {
    return { riskLevel: 'low', daysRemaining: null, exhaustionDate: null, dailyRate: 0 };
  }

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthExpenses = expenses.filter(exp => {
    const date = new Date(exp.expense_date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  if (monthExpenses.length === 0) {
    return { riskLevel: 'low', daysRemaining: null, exhaustionDate: null, dailyRate: 0 };
  }

  const totalSpent = monthExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  const daysPassed = now.getDate();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const remainingBudget = monthlyBudget - totalSpent;

  // Daily spending rate
  const dailyRate = daysPassed > 0 ? totalSpent / daysPassed : 0;

  // Days until budget exhaustion
  let daysRemaining = null;
  let exhaustionDate = null;
  let riskLevel = 'low';

  if (remainingBudget <= 0) {
    // Already over budget
    riskLevel = 'critical';
    daysRemaining = 0;
  } else if (dailyRate > 0) {
    daysRemaining = Math.floor(remainingBudget / dailyRate);

    if (daysRemaining < daysInMonth - daysPassed) {
      // Budget will run out before month end
      exhaustionDate = new Date(currentYear, currentMonth, daysPassed + daysRemaining);

      if (daysRemaining <= 5) {
        riskLevel = 'critical';
      } else if (daysRemaining <= 10) {
        riskLevel = 'high';
      } else if (daysRemaining <= 15) {
        riskLevel = 'medium';
      } else {
        riskLevel = 'low';
      }
    } else {
      // Budget will last the month
      riskLevel = 'low';
    }
  }

  return {
    riskLevel,
    daysRemaining,
    exhaustionDate,
    dailyRate: parseFloat(dailyRate.toFixed(2)),
    totalSpent: parseFloat(totalSpent.toFixed(2)),
    remainingBudget: parseFloat(remainingBudget.toFixed(2)),
    daysPassed,
    daysInMonth,
  };
};

/**
 * Generate prediction insights
 */
export const generatePredictionInsights = (expenses, monthlyBudget = 10000) => {
  const insights = [];
  const prediction = predictNextMonthExpense(expenses, monthlyBudget);
  const forecast = calculateBudgetExhaustionForecast(expenses, monthlyBudget);

  if (!prediction) return insights;

  // Trend insight
  if (prediction.trend_percentage > 5) {
    insights.push({
      type: 'warning',
      text: `Spending trend is increasing by ${prediction.trend_percentage.toFixed(1)}%. Consider reviewing your expenses.`,
    });
  } else if (prediction.trend_percentage < -5) {
    insights.push({
      type: 'success',
      text: `Spending trend is decreasing by ${Math.abs(prediction.trend_percentage).toFixed(1)}%. Great job!`,
    });
  } else {
    insights.push({
      type: 'info',
      text: 'Current spending pattern is stable.',
    });
  }

  // Budget forecast insight
  if (forecast.riskLevel === 'critical') {
    insights.push({
      type: 'warning',
      text: 'Budget already exceeded! Reduce spending immediately.',
    });
  } else if (forecast.exhaustionDate) {
    insights.push({
      type: forecast.riskLevel === 'high' ? 'warning' : 'info',
      text: `At your current rate, budget may be exhausted by ${format(forecast.exhaustionDate, 'MMM dd')}.`,
    });
  }

  // Prediction amount insight
  const budgetDiff = prediction.predicted_amount - monthlyBudget;
  if (budgetDiff > 0) {
    insights.push({
      type: 'warning',
      text: `Predicted to exceed budget by ₹${budgetDiff.toFixed(0)} next month.`,
    });
  } else if (budgetDiff < -500) {
    insights.push({
      type: 'success',
      text: `Predicted to save ₹${Math.abs(budgetDiff).toFixed(0)} next month at current rate.`,
    });
  }

  return insights;
};
