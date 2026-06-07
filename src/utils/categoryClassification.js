/**
 * Category Classification Utility
 * Classifies expenses as "necessary" or "luxury" based on category
 */

export const NECESSARY_CATEGORIES = [
  'Rent',
  'Groceries',
  'Utilities',
  'Transportation',
  'Healthcare',
  'Education',
  'Insurance',
  'Bills',
  // Legacy categories that map to necessary
  'Food',
  'Transport',
  'Health',
];

export const LUXURY_CATEGORIES = [
  'Dining Out',
  'Coffee Shops',
  'Shopping',
  'Entertainment',
  'Gaming',
  'Subscriptions',
  'Travel',
  'Gadgets',
];

// All categories available in the app
export const ALL_CATEGORIES = [
  'Food',
  'Rent',
  'Groceries',
  'Utilities',
  'Transportation',
  'Healthcare',
  'Education',
  'Insurance',
  'Bills',
  'Transport',
  'Health',
  'Dining Out',
  'Coffee Shops',
  'Shopping',
  'Entertainment',
  'Gaming',
  'Subscriptions',
  'Travel',
  'Gadgets',
  'Other',
];

/**
 * Get the expense type for a given category
 * @param {string} category
 * @returns {'necessary' | 'luxury'}
 */
export const getExpenseType = (category) => {
  if (!category) return 'luxury';
  const normalized = category.trim();
  if (NECESSARY_CATEGORIES.includes(normalized)) return 'necessary';
  if (LUXURY_CATEGORIES.includes(normalized)) return 'luxury';
  // Custom/unknown categories default to luxury
  return 'luxury';
};

/**
 * Check if a category is necessary
 */
export const isNecessary = (category) => getExpenseType(category) === 'necessary';

/**
 * Check if a category is luxury
 */
export const isLuxury = (category) => getExpenseType(category) === 'luxury';

/**
 * Calculate total necessary spending from expenses array
 * Uses expense_type field if available, falls back to category classification
 */
export const getNecessaryTotal = (expenses) => {
  if (!expenses || expenses.length === 0) return 0;
  return expenses.reduce((sum, exp) => {
    const type = exp.expense_type || getExpenseType(exp.category);
    return type === 'necessary' ? sum + parseFloat(exp.amount) : sum;
  }, 0);
};

/**
 * Calculate total luxury spending from expenses array
 * Uses expense_type field if available, falls back to category classification
 */
export const getLuxuryTotal = (expenses) => {
  if (!expenses || expenses.length === 0) return 0;
  return expenses.reduce((sum, exp) => {
    const type = exp.expense_type || getExpenseType(exp.category);
    return type === 'luxury' ? sum + parseFloat(exp.amount) : sum;
  }, 0);
};

/**
 * Get full spending breakdown
 * @param {Array} expenses - Array of expense objects
 * @returns {{ necessary: number, luxury: number, total: number, necessaryPct: number, luxuryPct: number }}
 */
export const getSpendingBreakdown = (expenses) => {
  if (!expenses || expenses.length === 0) {
    return { necessary: 0, luxury: 0, total: 0, necessaryPct: 0, luxuryPct: 0 };
  }

  const necessary = getNecessaryTotal(expenses);
  const luxury = getLuxuryTotal(expenses);
  const total = necessary + luxury;

  return {
    necessary,
    luxury,
    total,
    necessaryPct: total > 0 ? (necessary / total) * 100 : 0,
    luxuryPct: total > 0 ? (luxury / total) * 100 : 0,
  };
};

/**
 * Get spending breakdown for current month only
 * @param {Array} expenses
 * @returns {object}
 */
export const getMonthlyBreakdown = (expenses) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthExpenses = (expenses || []).filter(exp => {
    const date = new Date(exp.expense_date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  return getSpendingBreakdown(monthExpenses);
};

/**
 * Get necessary and luxury totals for a specific month/year
 */
export const getMonthlySplitTotals = (expenses, month, year) => {
  const monthExpenses = (expenses || []).filter(exp => {
    const date = new Date(exp.expense_date);
    return date.getMonth() === month && date.getFullYear() === year;
  });

  let necessary = 0;
  let luxury = 0;

  monthExpenses.forEach(exp => {
    const type = exp.expense_type || getExpenseType(exp.category);
    const amount = parseFloat(exp.amount);
    if (type === 'necessary') {
      necessary += amount;
    } else {
      luxury += amount;
    }
  });

  return { necessary, luxury, total: necessary + luxury };
};
