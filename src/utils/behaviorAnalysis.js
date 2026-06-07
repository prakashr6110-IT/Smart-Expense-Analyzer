import { format, parseISO, getDay } from 'date-fns';
import { getExpenseType, getMonthlySplitTotals } from './categoryClassification';

export const analyzeBehavior = (expenses) => {
  if (!expenses || expenses.length === 0) return [];

  const insights = [];

  // Analyze time patterns
  const timeInsight = analyzeTimePatterns(expenses);
  if (timeInsight) {
    insights.push({
      insight_type: 'time_pattern',
      insight_data: timeInsight,
    });
  }

  // Analyze weekend spending
  const weekendInsight = analyzeWeekendSpending(expenses);
  if (weekendInsight) {
    insights.push({
      insight_type: 'weekend_spending',
      insight_data: weekendInsight,
    });
  }

  // Analyze top category
  const categoryInsight = analyzeTopCategory(expenses);
  if (categoryInsight) {
    insights.push({
      insight_type: 'top_category',
      insight_data: categoryInsight,
    });
  }

  // NEW: Luxury spending spike
  const luxurySpikeInsight = analyzeLuxurySpendingSpike(expenses);
  if (luxurySpikeInsight) {
    insights.push({
      insight_type: 'luxury_spike',
      insight_data: luxurySpikeInsight,
    });
  }

  // NEW: Weekend luxury pattern
  const weekendLuxuryInsight = analyzeWeekendLuxuryPattern(expenses);
  if (weekendLuxuryInsight) {
    insights.push({
      insight_type: 'weekend_luxury',
      insight_data: weekendLuxuryInsight,
    });
  }

  // NEW: Night luxury pattern
  const nightLuxuryInsight = analyzeNightLuxuryPattern(expenses);
  if (nightLuxuryInsight) {
    insights.push({
      insight_type: 'night_luxury',
      insight_data: nightLuxuryInsight,
    });
  }

  // NEW: Impulse detection
  const impulseInsight = detectImpulseSpending(expenses);
  if (impulseInsight) {
    insights.push({
      insight_type: 'impulse_spending',
      insight_data: impulseInsight,
    });
  }

  return insights;
};

const analyzeTimePatterns = (expenses) => {
  const timeSlots = {
    morning: { count: 0, total: 0, hours: [], luxuryCount: 0, luxuryTotal: 0 },
    afternoon: { count: 0, total: 0, hours: [], luxuryCount: 0, luxuryTotal: 0 },
    evening: { count: 0, total: 0, hours: [], luxuryCount: 0, luxuryTotal: 0 },
    night: { count: 0, total: 0, hours: [], luxuryCount: 0, luxuryTotal: 0 },
  };

  expenses.forEach(expense => {
    const hour = parseInt(expense.expense_time.split(':')[0]);
    const amount = parseFloat(expense.amount);
    const type = expense.expense_type || getExpenseType(expense.category);
    const isLux = type === 'luxury';

    let slot;
    if (hour >= 6 && hour < 12) slot = timeSlots.morning;
    else if (hour >= 12 && hour < 18) slot = timeSlots.afternoon;
    else if (hour >= 18 && hour < 22) slot = timeSlots.evening;
    else slot = timeSlots.night;

    slot.count++;
    slot.total += amount;
    slot.hours.push(hour);
    if (isLux) {
      slot.luxuryCount++;
      slot.luxuryTotal += amount;
    }
  });

  // Find peak time slot
  const peakSlot = Object.entries(timeSlots).reduce((a, b) =>
    a[1].count > b[1].count ? a : b
  );

  if (peakSlot[1].count === 0) return null;

  const avgHour = peakSlot[1].hours.reduce((a, b) => a + b, 0) / peakSlot[1].hours.length;
  const peakHour = Math.round(avgHour);
  const period = peakHour >= 12 ? 'PM' : 'AM';
  const displayHour = peakHour > 12 ? peakHour - 12 : peakHour;

  // Build enhanced insight text
  const luxuryPct = peakSlot[1].count > 0
    ? ((peakSlot[1].luxuryCount / peakSlot[1].count) * 100).toFixed(0)
    : 0;

  let insightText = `You usually spend during ${peakSlot[0]} (around ${displayHour} ${period})`;
  if (parseInt(luxuryPct) > 50) {
    insightText += `. Most of these (${luxuryPct}%) are luxury purchases — consider reviewing this pattern.`;
  }

  return {
    peak_period: peakSlot[0],
    peak_hour: `${displayHour} ${period}`,
    total_transactions: peakSlot[1].count,
    total_amount: peakSlot[1].total.toFixed(2),
    luxury_transactions: peakSlot[1].luxuryCount,
    luxury_amount: peakSlot[1].luxuryTotal.toFixed(2),
    luxury_percentage: luxuryPct,
    insight_text: insightText,
  };
};

const analyzeWeekendSpending = (expenses) => {
  let weekendTotal = 0;
  let weekdayTotal = 0;
  let weekendCount = 0;
  let weekdayCount = 0;
  let weekendLuxury = 0;
  let weekdayLuxury = 0;

  expenses.forEach(expense => {
    const date = parseISO(expense.expense_date);
    const day = getDay(date);
    const amount = parseFloat(expense.amount);
    const type = expense.expense_type || getExpenseType(expense.category);

    if (day === 0 || day === 6) {
      weekendTotal += amount;
      weekendCount++;
      if (type === 'luxury') weekendLuxury += amount;
    } else {
      weekdayTotal += amount;
      weekdayCount++;
      if (type === 'luxury') weekdayLuxury += amount;
    }
  });

  const totalSpending = weekendTotal + weekdayTotal;
  if (totalSpending === 0) return null;

  const weekendRatio = (weekendTotal / totalSpending).toFixed(2);
  const avgWeekend = weekendCount > 0 ? (weekendTotal / weekendCount).toFixed(2) : 0;
  const avgWeekday = weekdayCount > 0 ? (weekdayTotal / weekdayCount).toFixed(2) : 0;
  const weekendLuxuryPct = weekendTotal > 0 ? ((weekendLuxury / weekendTotal) * 100).toFixed(0) : 0;

  let insightText = '';
  if (parseFloat(weekendRatio) > 0.6) {
    insightText = `You spend significantly more on weekends. ${weekendLuxuryPct}% of weekend expenses are luxury purchases.`;
  } else if (parseFloat(weekendRatio) > 0.4) {
    insightText = `You have moderate weekend spending. ${weekendLuxuryPct}% of weekend spending is on luxury items.`;
  } else {
    insightText = `You spend more on weekdays. Weekend luxury spending: ${weekendLuxuryPct}%.`;
  }

  return {
    weekend_total: weekendTotal.toFixed(2),
    weekday_total: weekdayTotal.toFixed(2),
    weekend_ratio: weekendRatio,
    weekend_luxury: weekendLuxury.toFixed(2),
    weekday_luxury: weekdayLuxury.toFixed(2),
    weekend_luxury_pct: weekendLuxuryPct,
    avg_weekend_spending: avgWeekend,
    avg_weekday_spending: avgWeekday,
    insight_text: insightText,
  };
};

const analyzeTopCategory = (expenses) => {
  const categoryTotals = {};

  expenses.forEach(expense => {
    const category = expense.category;
    const amount = parseFloat(expense.amount);
    categoryTotals[category] = (categoryTotals[category] || 0) + amount;
  });

  const totalSpending = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
  if (totalSpending === 0) return null;

  const topCategory = Object.entries(categoryTotals).reduce((a, b) =>
    a[1] > b[1] ? a : b
  );

  const percentage = ((topCategory[1] / totalSpending) * 100).toFixed(1);
  const type = getExpenseType(topCategory[0]);

  return {
    category: topCategory[0],
    total: topCategory[1].toFixed(2),
    percentage: percentage,
    expense_type: type,
    category_breakdown: categoryTotals,
    insight_text: `Your top category is ${topCategory[0]} (${percentage}% of total spending) — classified as ${type}`,
  };
};

// ============ NEW LUXURY ANALYSIS FUNCTIONS ============

const analyzeLuxurySpendingSpike = (expenses) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  const current = getMonthlySplitTotals(expenses, currentMonth, currentYear);
  const previous = getMonthlySplitTotals(expenses, lastMonth, lastMonthYear);

  if (previous.luxury === 0) return null;

  const increase = ((current.luxury - previous.luxury) / previous.luxury) * 100;

  if (increase > 20) {
    return {
      current_luxury: current.luxury.toFixed(2),
      previous_luxury: previous.luxury.toFixed(2),
      increase_percentage: increase.toFixed(0),
      insight_text: `Your luxury spending increased by ${increase.toFixed(0)}% compared to last month (₹${current.luxury.toFixed(0)} vs ₹${previous.luxury.toFixed(0)}).`,
    };
  }

  return null;
};

const analyzeWeekendLuxuryPattern = (expenses) => {
  let weekendLuxury = 0;
  let weekendTotal = 0;
  let weekdayLuxury = 0;
  let weekdayTotal = 0;

  expenses.forEach(expense => {
    const date = parseISO(expense.expense_date);
    const day = getDay(date);
    const amount = parseFloat(expense.amount);
    const type = expense.expense_type || getExpenseType(expense.category);

    if (day === 0 || day === 6) {
      weekendTotal += amount;
      if (type === 'luxury') weekendLuxury += amount;
    } else {
      weekdayTotal += amount;
      if (type === 'luxury') weekdayLuxury += amount;
    }
  });

  if (weekendTotal === 0 || weekdayTotal === 0) return null;

  const weekendLuxuryPct = (weekendLuxury / weekendTotal) * 100;
  const weekdayLuxuryPct = (weekdayLuxury / weekdayTotal) * 100;
  const diff = weekendLuxuryPct - weekdayLuxuryPct;

  if (diff > 20) {
    return {
      weekend_luxury_pct: weekendLuxuryPct.toFixed(0),
      weekday_luxury_pct: weekdayLuxuryPct.toFixed(0),
      difference: diff.toFixed(0),
      insight_text: `${weekendLuxuryPct.toFixed(0)}% of weekend expenses are luxury purchases, compared to ${weekdayLuxuryPct.toFixed(0)}% on weekdays. You spend ${diff.toFixed(0)}% more on luxury during weekends.`,
    };
  }

  return null;
};

const analyzeNightLuxuryPattern = (expenses) => {
  let nightLuxuryCount = 0;
  let nightTotalCount = 0;
  let nightLuxuryAmount = 0;
  let nightTotalAmount = 0;

  expenses.forEach(expense => {
    const hour = parseInt(expense.expense_time.split(':')[0]);
    const amount = parseFloat(expense.amount);
    const type = expense.expense_type || getExpenseType(expense.category);

    // Night = 8 PM to 11 PM (20:00 - 23:00)
    if (hour >= 20 && hour < 24) {
      nightTotalCount++;
      nightTotalAmount += amount;
      if (type === 'luxury') {
        nightLuxuryCount++;
        nightLuxuryAmount += amount;
      }
    }
  });

  if (nightTotalCount < 3) return null;

  const luxuryPct = (nightLuxuryCount / nightTotalCount) * 100;

  if (luxuryPct > 50) {
    return {
      night_luxury_count: nightLuxuryCount,
      night_total_count: nightTotalCount,
      night_luxury_amount: nightLuxuryAmount.toFixed(2),
      luxury_percentage: luxuryPct.toFixed(0),
      insight_text: `Most luxury purchases (${luxuryPct.toFixed(0)}%) occur between 8 PM and 11 PM. ₹${nightLuxuryAmount.toFixed(0)} spent on luxury during night hours.`,
    };
  }

  return null;
};

const detectImpulseSpending = (expenses) => {
  if (expenses.length < 5) return null;

  // Calculate average luxury expense
  const luxuryExpenses = expenses.filter(exp => {
    const type = exp.expense_type || getExpenseType(exp.category);
    return type === 'luxury';
  });

  if (luxuryExpenses.length < 3) return null;

  const avgLuxury = luxuryExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0) / luxuryExpenses.length;

  // Find impulse candidates: above average + late night + weekend
  const impulseExpenses = luxuryExpenses.filter(exp => {
    const amount = parseFloat(exp.amount);
    const hour = parseInt(exp.expense_time.split(':')[0]);
    const day = getDay(parseISO(exp.expense_date));
    const isWeekend = day === 0 || day === 6;
    const isLateNight = hour >= 20 || hour < 6;

    return amount > avgLuxury * 1.5 && isLateNight && isWeekend;
  });

  if (impulseExpenses.length > 0) {
    const totalImpulse = impulseExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    return {
      impulse_count: impulseExpenses.length,
      total_impulse_amount: totalImpulse.toFixed(2),
      avg_luxury: avgLuxury.toFixed(2),
      insight_text: `Possible impulse spending detected: ${impulseExpenses.length} expensive luxury purchases (₹${totalImpulse.toFixed(0)}) made late at night on weekends — above your average luxury spend of ₹${avgLuxury.toFixed(0)}.`,
    };
  }

  return null;
};

export const generateInsightsText = (insights) => {
  if (!insights || insights.length === 0) return [];

  return insights.map(insight => {
    const data = insight.insight_data;
    return data.insight_text || 'New spending pattern detected';
  });
};
