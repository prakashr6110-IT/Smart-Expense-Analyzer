import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format, parseISO, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, endOfYear, subMonths, differenceInDays } from 'date-fns';
import { getSpendingBreakdown, getExpenseType } from './categoryClassification';
import { calculateFinancialScore, getScoreRating, predictNextMonthExpense, calculateBudgetExhaustionForecast } from './prediction';
import { analyzeBehavior, generateInsightsText } from './behaviorAnalysis';

// ===================== FORMATTING UTILITIES =====================

const CURRENCY = 'Rs.';
const DATE_FORMAT = 'dd MMM yyyy';
const TIME_FORMAT = 'hh:mm a';
const DECIMALS_CURRENCY = 2;
const DECIMALS_PERCENT = 1;

const fmtCurrency = (value) => {
  if (value == null || isNaN(value)) return `${CURRENCY}0.00`;
  return `${CURRENCY}${Number(value).toLocaleString('en-IN', { minimumFractionDigits: DECIMALS_CURRENCY, maximumFractionDigits: DECIMALS_CURRENCY })}`;
};

const fmtCurrencyWhole = (value) => {
  if (value == null || isNaN(value)) return `${CURRENCY}0`;
  return `${CURRENCY}${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
};

const fmtPercent = (value) => {
  if (value == null || isNaN(value)) return '0.0%';
  return `${Number(value).toFixed(DECIMALS_PERCENT)}%`;
};

const fmtNumber = (value) => {
  if (value == null || isNaN(value)) return '0';
  return Number(value).toLocaleString('en-IN');
};

const fmtDate = (date) => {
  if (!date) return 'N/A';
  return format(date, DATE_FORMAT);
};

const fmtDateTime = (date) => {
  if (!date) return 'N/A';
  return `${format(date, DATE_FORMAT)}, ${format(date, TIME_FORMAT)}`;
};

// ===================== PERIOD RESOLUTION =====================

const resolvePeriod = (period, now = new Date()) => {
  let startDate, endDate, periodLabel, previousStart, previousEnd;
  switch (period) {
    case 'weekly':
      startDate = startOfWeek(now, { weekStartsOn: 1 });
      endDate = endOfWeek(now, { weekStartsOn: 1 });
      periodLabel = 'Weekly';
      previousStart = startOfWeek(subMonths(now, 0), { weekStartsOn: 1 });
      previousStart.setDate(previousStart.getDate() - 7);
      previousEnd = endOfWeek(subMonths(now, 0), { weekStartsOn: 1 });
      previousEnd.setDate(previousEnd.getDate() - 7);
      break;
    case 'monthly':
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
      periodLabel = 'Monthly';
      previousStart = startOfMonth(subMonths(now, 1));
      previousEnd = endOfMonth(subMonths(now, 1));
      break;
    case 'yearly':
      startDate = startOfYear(now);
      endDate = endOfYear(now);
      periodLabel = 'Yearly';
      previousStart = startOfYear(new Date(now.getFullYear() - 1, 0, 1));
      previousEnd = endOfYear(new Date(now.getFullYear() - 1, 0, 1));
      break;
    default:
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
      periodLabel = 'Monthly';
      previousStart = startOfMonth(subMonths(now, 1));
      previousEnd = endOfMonth(subMonths(now, 1));
  }
  return { startDate, endDate, periodLabel, previousStart, previousEnd };
};

// ===================== DATA AGGREGATION =====================

const computeReportData = (expenses, period, profile, userEmail) => {
  const now = new Date();
  const { startDate, endDate, periodLabel, previousStart, previousEnd } = resolvePeriod(period, now);

  // Filter expenses
  const filteredExpenses = expenses.filter(exp => {
    const expDate = parseISO(exp.expense_date);
    return expDate >= startDate && expDate <= endDate;
  });

  const previousExpenses = expenses.filter(exp => {
    const expDate = parseISO(exp.expense_date);
    return expDate >= previousStart && expDate <= previousEnd;
  });

  // Core metrics
  const totalSpent = filteredExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  const totalTransactions = filteredExpenses.length;
  const avgPerTransaction = totalTransactions > 0 ? totalSpent / totalTransactions : 0;
  const daysInRange = Math.max(1, differenceInDays(endDate, startDate) + 1);
  const dailyAverage = totalSpent / daysInRange;

  // Previous period comparison
  const prevTotalSpent = previousExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  const prevTransactions = previousExpenses.length;
  const spendingChange = prevTotalSpent > 0 ? ((totalSpent - prevTotalSpent) / prevTotalSpent) * 100 : null;
  const transactionChange = prevTransactions > 0 ? ((totalTransactions - prevTransactions) / prevTransactions) * 100 : null;

  // Category breakdown
  const categoryBreakdown = {};
  filteredExpenses.forEach(exp => {
    const cat = exp.category || 'Uncategorized';
    if (!categoryBreakdown[cat]) categoryBreakdown[cat] = { total: 0, count: 0 };
    categoryBreakdown[cat].total += parseFloat(exp.amount);
    categoryBreakdown[cat].count += 1;
  });
  const sortedCategories = Object.entries(categoryBreakdown).sort((a, b) => b[1].total - a[1].total);
  const topCategory = sortedCategories.length > 0 ? sortedCategories[0] : null;

  // Budget analysis
  const budget = profile?.monthly_budget || 0;
  const budgetUsed = budget > 0 ? (totalSpent / budget) * 100 : 0;
  const budgetRemaining = budget > 0 ? budget - totalSpent : 0;

  // Necessary vs Luxury split
  const splitBreakdown = getSpendingBreakdown(filteredExpenses);

  // Financial health
  const financialScore = calculateFinancialScore(expenses, budget || 10000);
  const scoreRating = getScoreRating(financialScore);

  // Predictions (only if historical data exists)
  const prediction = predictNextMonthExpense(expenses, budget || 10000);
  const forecast = calculateBudgetExhaustionForecast(expenses, budget || 10000);

  // Behavioral insights
  const behaviorInsights = analyzeBehavior(filteredExpenses);
  const insightTexts = generateInsightsText(behaviorInsights);

  // Largest transactions
  const sortedByAmount = [...filteredExpenses].sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount));
  const largestTransaction = sortedByAmount.length > 0 ? sortedByAmount[0] : null;

  return {
    now, startDate, endDate, periodLabel,
    filteredExpenses, previousExpenses,
    totalSpent, totalTransactions, avgPerTransaction, dailyAverage, daysInRange,
    prevTotalSpent, prevTransactions, spendingChange, transactionChange,
    categoryBreakdown, sortedCategories, topCategory,
    budget, budgetUsed, budgetRemaining,
    splitBreakdown, financialScore, scoreRating,
    prediction, forecast,
    behaviorInsights, insightTexts,
    largestTransaction, sortedByAmount,
    userEmail,
  };
};

// ===================== EXECUTIVE SUMMARY BUILDER =====================

const buildExecutiveSummary = (data) => {
  const lines = [];

  if (data.totalTransactions === 0) {
    lines.push(`No expenses were recorded during this ${data.periodLabel.toLowerCase()} period.`);
    return lines;
  }

  lines.push(`Total spending of ${fmtCurrency(data.totalSpent)} across ${data.totalTransactions} transactions during the ${data.periodLabel.toLowerCase()} period (${fmtDate(data.startDate)} – ${fmtDate(data.endDate)}).`);

  if (data.spendingChange != null) {
    const direction = data.spendingChange > 0 ? 'increase' : 'decrease';
    lines.push(`This represents a ${fmtPercent(Math.abs(data.spendingChange))} ${direction} compared to the previous period (${fmtCurrency(data.prevTotalSpent)}).`);
  }

  if (data.topCategory) {
    lines.push(`Highest spending category: ${data.topCategory[0]} at ${fmtCurrency(data.topCategory[1].total)} (${fmtPercent((data.topCategory[1].total / data.totalSpent) * 100)} of total).`);
  }

  if (data.budget > 0) {
    if (data.budgetUsed > 100) {
      lines.push(`⚠ Budget exceeded: ${fmtPercent(data.budgetUsed)} of monthly budget used. Over by ${fmtCurrency(Math.abs(data.budgetRemaining))}.`);
    } else if (data.budgetUsed > 80) {
      lines.push(`⚠ Budget nearing limit: ${fmtPercent(data.budgetUsed)} utilized. ${fmtCurrency(data.budgetRemaining)} remaining.`);
    } else {
      lines.push(`Budget utilization at ${fmtPercent(data.budgetUsed)}. ${fmtCurrency(data.budgetRemaining)} remaining.`);
    }
  }

  if (data.splitBreakdown.total > 0 && data.splitBreakdown.luxuryPct > 40) {
    lines.push(`Note: Luxury spending is ${fmtPercent(data.splitBreakdown.luxuryPct)} of total — above recommended threshold.`);
  }

  return lines;
};

// ===================== RECOMMENDATIONS BUILDER =====================

const buildRecommendations = (data) => {
  const recs = [];

  if (data.totalTransactions === 0) return recs;

  if (data.budget > 0 && data.budgetUsed > 100) {
    recs.push(`Urgent: Reduce spending to stay within budget. Current excess: ${fmtCurrency(Math.abs(data.budgetRemaining))}.`);
  } else if (data.budget > 0 && data.budgetUsed > 80) {
    const remaining = data.budget - data.totalSpent;
    const daysLeft = Math.max(1, differenceInDays(data.endDate, data.now));
    recs.push(`Limit daily spending to ${fmtCurrency(remaining / daysLeft)} for the remaining ${daysLeft} days to stay within budget.`);
  }

  if (data.splitBreakdown.luxuryPct > 40) {
    recs.push(`Consider reducing luxury/discretionary spending (currently ${fmtPercent(data.splitBreakdown.luxuryPct)}). A target of 30% or below is recommended.`);
  }

  if (data.spendingChange != null && data.spendingChange > 20) {
    recs.push(`Spending increased ${fmtPercent(data.spendingChange)} period-over-period. Review what drove this change.`);
  }

  if (data.topCategory && (data.topCategory[1].total / data.totalSpent) > 0.4) {
    recs.push(`${data.topCategory[0]} accounts for over 40% of spending. Consider diversifying or setting a sub-limit for this category.`);
  }

  if (data.prediction && data.prediction.trend_percentage > 10) {
    recs.push(`Projected spending trend is rising at ${fmtPercent(data.prediction.trend_percentage)}. Early intervention can prevent overruns next period.`);
  }

  if (data.forecast && data.forecast.exhaustionDate) {
    recs.push(`Budget may be exhausted by ${fmtDate(data.forecast.exhaustionDate)} at current spending rate (${fmtCurrency(data.forecast.dailyRate)}/day).`);
  }

  return recs;
};

// ===================== SECTION HEADING HELPER (PDF) =====================

const drawSectionHeading = (doc, title, y, pageWidth = 210, margin = 14) => {
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 64, 175);
  doc.text(title.toUpperCase(), margin, y);
  // underline
  doc.setDrawColor(200, 210, 230);
  doc.setLineWidth(0.3);
  doc.line(margin, y + 2, pageWidth - margin, y + 2);
  return y + 7;
};

// ===================== PDF REPORT GENERATOR =====================

export const generateReport = async (expenses, period, profile, userEmail) => {
  const doc = new jsPDF();
  const data = computeReportData(expenses, period, profile, userEmail);
  const PAGE_MARGIN = 14;
  const CONTENT_WIDTH = 182;

  // Load logo
  let logoBase64 = null;
  try {
    const response = await fetch('/logo.png');
    const blob = await response.blob();
    logoBase64 = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch { /* no logo */ }

  // =================== PAGE 1: COVER / HEADER ===================
  doc.setFillColor(30, 64, 175);
  doc.rect(0, 0, 210, 55, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Smart Expense Analyzer', PAGE_MARGIN, 18);

  doc.setFontSize(13);
  doc.setFont('helvetica', 'normal');
  doc.text(`${data.periodLabel} Financial Report`, PAGE_MARGIN, 28);

  doc.setFontSize(9);
  doc.text(`Reporting Period: ${fmtDate(data.startDate)} – ${fmtDate(data.endDate)}`, PAGE_MARGIN, 37);
  doc.text(`Generated: ${fmtDateTime(data.now)}`, PAGE_MARGIN, 43);

  doc.setFontSize(9);
  doc.text(`Account: ${data.userEmail || 'N/A'}`, 196, 37, { align: 'right' });
  doc.text(`Classification: Confidential`, 196, 43, { align: 'right' });

  doc.setTextColor(30, 30, 30);
  let yPos = 62;

  // =================== EXECUTIVE SUMMARY ===================
  yPos = drawSectionHeading(doc, 'Executive Summary', yPos);
  const summaryLines = buildExecutiveSummary(data);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50, 50, 50);
  summaryLines.forEach(line => {
    const wrapped = doc.splitTextToSize(line, CONTENT_WIDTH);
    doc.text(wrapped, PAGE_MARGIN, yPos);
    yPos += wrapped.length * 4.5 + 1.5;
  });
  yPos += 5;

  // =================== KPI SUMMARY ===================
  yPos = drawSectionHeading(doc, 'Key Performance Indicators', yPos);

  const kpiCards = [
    { label: 'Total Spent', value: fmtCurrencyWhole(data.totalSpent), color: [239, 68, 68] },
    { label: 'Transactions', value: `${data.totalTransactions}`, color: [59, 130, 246] },
    { label: 'Daily Average', value: fmtCurrencyWhole(data.dailyAverage), color: [245, 158, 11] },
    { label: 'Avg / Transaction', value: fmtCurrencyWhole(data.avgPerTransaction), color: [16, 185, 129] },
  ];

  if (data.budget > 0) {
    kpiCards.push({ label: 'Budget Used', value: fmtPercent(data.budgetUsed), color: data.budgetUsed > 80 ? [239, 68, 68] : [34, 197, 94] });
  }
  kpiCards.push({ label: 'Health Score', value: `${Math.round(data.financialScore)}/100`, color: data.financialScore >= 70 ? [16, 185, 129] : data.financialScore >= 50 ? [245, 158, 11] : [239, 68, 68] });

  // Render KPI cards (up to 4 per row)
  const cardW = Math.floor((CONTENT_WIDTH - 3 * 4) / 4);
  const cardH = 26;
  kpiCards.forEach((card, i) => {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const x = PAGE_MARGIN + col * (cardW + 4);
    const y = yPos + row * (cardH + 4);

    doc.setFillColor(248, 250, 252);
    doc.roundedRect(x, y, cardW, cardH, 2, 2, 'F');
    doc.setFillColor(card.color[0], card.color[1], card.color[2]);
    doc.roundedRect(x, y, cardW, 3, 2, 2, 'F');

    doc.setFontSize(6.5);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.text(card.label, x + cardW / 2, y + 12, { align: 'center' });

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(card.color[0], card.color[1], card.color[2]);
    doc.text(card.value, x + cardW / 2, y + 20, { align: 'center' });
  });
  yPos += Math.ceil(kpiCards.length / 4) * (cardH + 4) + 4;

  // =================== SPENDING DISTRIBUTION ===================
  if (data.splitBreakdown.total > 0) {
    yPos = drawSectionHeading(doc, 'Spending Distribution', yPos);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 50);
    doc.text(`Necessary: ${fmtCurrencyWhole(data.splitBreakdown.necessary)} (${fmtPercent(data.splitBreakdown.necessaryPct)})`, PAGE_MARGIN + 2, yPos);
    yPos += 5;
    doc.text(`Luxury/Discretionary: ${fmtCurrencyWhole(data.splitBreakdown.luxury)} (${fmtPercent(data.splitBreakdown.luxuryPct)})`, PAGE_MARGIN + 2, yPos);
    yPos += 7;

    // Bar
    const barW = CONTENT_WIDTH - 4;
    const barH = 6;
    const necessaryW = barW * (data.splitBreakdown.necessaryPct / 100);
    doc.setFillColor(16, 185, 129);
    doc.roundedRect(PAGE_MARGIN, yPos, necessaryW, barH, 2, 2, 'F');
    doc.setFillColor(139, 92, 246);
    doc.roundedRect(PAGE_MARGIN + necessaryW, yPos, barW - necessaryW, barH, 2, 2, 'F');
    yPos += barH + 6;
  }

  // =================== BUDGET ANALYSIS ===================
  if (data.budget > 0) {
    if (yPos > 240) { doc.addPage(); yPos = 20; }
    yPos = drawSectionHeading(doc, 'Budget Performance', yPos);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 50);
    doc.text(`Monthly Budget: ${fmtCurrency(data.budget)}`, PAGE_MARGIN + 2, yPos); yPos += 5;
    doc.text(`Spent: ${fmtCurrency(data.totalSpent)} (${fmtPercent(data.budgetUsed)} utilized)`, PAGE_MARGIN + 2, yPos); yPos += 5;
    doc.text(`Remaining: ${fmtCurrency(Math.max(0, data.budgetRemaining))}`, PAGE_MARGIN + 2, yPos); yPos += 7;

    // Progress bar
    const barW = CONTENT_WIDTH - 4;
    const barH = 5;
    const fillW = Math.min(barW, barW * (data.budgetUsed / 100));
    doc.setFillColor(229, 231, 235);
    doc.roundedRect(PAGE_MARGIN, yPos, barW, barH, 2, 2, 'F');
    doc.setFillColor(
      data.budgetUsed > 100 ? 239 : data.budgetUsed > 80 ? 245 : 34,
      data.budgetUsed > 100 ? 68 : data.budgetUsed > 80 ? 158 : 197,
      data.budgetUsed > 100 ? 68 : data.budgetUsed > 80 ? 11 : 94,
    );
    doc.roundedRect(PAGE_MARGIN, yPos, fillW, barH, 2, 2, 'F');
    yPos += barH + 8;
  }

  // =================== CATEGORY BREAKDOWN TABLE ===================
  if (yPos > 220) { doc.addPage(); yPos = 20; }
  yPos = drawSectionHeading(doc, 'Category Breakdown', yPos);

  if (data.sortedCategories.length > 0) {
    const catTableData = data.sortedCategories.map(([cat, d], i) => [
      `${i + 1}`,
      cat,
      getExpenseType(cat) === 'necessary' ? 'Essential' : 'Discretionary',
      `${d.count}`,
      fmtCurrency(d.total),
      fmtPercent(data.totalSpent > 0 ? (d.total / data.totalSpent) * 100 : 0),
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['#', 'Category', 'Type', 'Txns', 'Amount', '% Share']],
      body: catTableData,
      theme: 'striped',
      headStyles: { fillColor: [30, 64, 175], textColor: [255, 255, 255], fontSize: 8, fontStyle: 'bold', halign: 'center' },
      bodyStyles: { fontSize: 8, halign: 'center' },
      columnStyles: {
        0: { cellWidth: 10 }, 1: { cellWidth: 45, halign: 'left' },
        2: { cellWidth: 32 }, 3: { cellWidth: 18 },
        4: { cellWidth: 38, halign: 'right' }, 5: { cellWidth: 24 },
      },
      margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });
    yPos = doc.lastAutoTable.finalY + 8;
  } else {
    doc.setFontSize(9); doc.setTextColor(150, 150, 150);
    doc.text('No expenses recorded in this period.', PAGE_MARGIN, yPos + 4);
    yPos += 12;
  }

  // =================== TRENDS & COMPARISONS ===================
  if (yPos > 220) { doc.addPage(); yPos = 20; }
  const hasTrendData = data.spendingChange != null || data.prediction != null;
  if (hasTrendData) {
    yPos = drawSectionHeading(doc, 'Trends & Comparisons', yPos);
    doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(50, 50, 50);

    if (data.spendingChange != null) {
      const dir = data.spendingChange > 0 ? '▲ Increased' : '▼ Decreased';
      doc.text(`${dir} ${fmtPercent(Math.abs(data.spendingChange))} vs previous period (${fmtCurrencyWhole(data.prevTotalSpent)} → ${fmtCurrencyWhole(data.totalSpent)})`, PAGE_MARGIN + 2, yPos);
      yPos += 6;
    }
    if (data.transactionChange != null) {
      doc.text(`Transaction volume: ${data.prevTransactions} → ${data.totalTransactions} (${data.transactionChange > 0 ? '+' : ''}${fmtPercent(data.transactionChange)} change)`, PAGE_MARGIN + 2, yPos);
      yPos += 6;
    }
    if (data.prediction) {
      doc.text(`Predicted next month: ${fmtCurrencyWhole(data.prediction.predicted_amount)} (confidence: ${fmtPercent(data.prediction.confidence)}, trend: ${data.prediction.trend_percentage > 0 ? '+' : ''}${fmtPercent(data.prediction.trend_percentage)})`, PAGE_MARGIN + 2, yPos);
      yPos += 6;
    }
    if (data.forecast && data.forecast.exhaustionDate) {
      doc.setTextColor(239, 68, 68);
      doc.text(`Budget exhaustion risk: ${fmtDate(data.forecast.exhaustionDate)} at current rate of ${fmtCurrency(data.forecast.dailyRate)}/day`, PAGE_MARGIN + 2, yPos);
      yPos += 6;
    }
    yPos += 4;
  }

  // =================== KEY INSIGHTS ===================
  if (data.insightTexts.length > 0) {
    if (yPos > 220) { doc.addPage(); yPos = 20; }
    yPos = drawSectionHeading(doc, 'Key Insights', yPos);
    doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(50, 50, 50);
    data.insightTexts.forEach(text => {
      const wrapped = doc.splitTextToSize(`•  ${text}`, CONTENT_WIDTH);
      doc.text(wrapped, PAGE_MARGIN + 2, yPos);
      yPos += wrapped.length * 4.5 + 1;
    });
    yPos += 4;
  }

  // =================== RECOMMENDATIONS ===================
  const recommendations = buildRecommendations(data);
  if (recommendations.length > 0) {
    if (yPos > 220) { doc.addPage(); yPos = 20; }
    yPos = drawSectionHeading(doc, 'Recommendations', yPos);
    doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(50, 50, 50);
    recommendations.forEach((rec, i) => {
      const wrapped = doc.splitTextToSize(`${i + 1}.  ${rec}`, CONTENT_WIDTH);
      doc.text(wrapped, PAGE_MARGIN + 2, yPos);
      yPos += wrapped.length * 4.5 + 1.5;
    });
    yPos += 4;
  }

  // =================== APPENDIX: DETAILED TRANSACTIONS ===================
  doc.addPage();
  yPos = 20;
  yPos = drawSectionHeading(doc, `Appendix: Detailed Transaction Records (${data.periodLabel})`, yPos);

  if (data.filteredExpenses.length > 0) {
    const txSorted = [...data.filteredExpenses].sort((a, b) => new Date(b.expense_date) - new Date(a.expense_date));
    const txData = txSorted.map((exp, i) => [
      `${i + 1}`,
      format(parseISO(exp.expense_date), DATE_FORMAT),
      exp.expense_time ? exp.expense_time.substring(0, 5) : '--:--',
      exp.category || 'Uncategorized',
      exp.description || '—',
      fmtCurrency(parseFloat(exp.amount)),
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['#', 'Date', 'Time', 'Category', 'Description', 'Amount']],
      body: txData,
      theme: 'striped',
      headStyles: { fillColor: [30, 64, 175], textColor: [255, 255, 255], fontSize: 7.5, fontStyle: 'bold', halign: 'center' },
      bodyStyles: { fontSize: 7.5, halign: 'center' },
      columnStyles: {
        0: { cellWidth: 10 }, 1: { cellWidth: 26 }, 2: { cellWidth: 16 },
        3: { cellWidth: 30, halign: 'left' }, 4: { cellWidth: 60, halign: 'left' },
        5: { cellWidth: 32, halign: 'right' },
      },
      margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    // Reconciliation row
    const afterY = doc.lastAutoTable.finalY + 6;
    doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(30, 30, 30);
    doc.text(`Total: ${fmtCurrency(data.totalSpent)}  |  ${data.totalTransactions} transactions  |  Period: ${fmtDate(data.startDate)} – ${fmtDate(data.endDate)}`, PAGE_MARGIN, afterY);
  } else {
    doc.setFontSize(10); doc.setTextColor(150, 150, 150);
    doc.text('No transactions recorded in this period.', PAGE_MARGIN, yPos + 6);
  }

  // =================== FOOTER + WATERMARK ===================
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    if (logoBase64) {
      try {
        const wmSize = 140;
        doc.saveGraphicsState();
        doc.setGState(new doc.GState({ opacity: 0.03 }));
        doc.addImage(logoBase64, 'PNG', (210 - wmSize) / 2, (297 - wmSize) / 2 - 10, wmSize, wmSize);
        doc.restoreGraphicsState();
      } catch { /* skip */ }
    }
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 282, 210, 15, 'F');
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text('Smart Expense Analyzer | Confidential — For personal use only', PAGE_MARGIN, 290);
    doc.text(`Page ${i} of ${pageCount}`, 196, 290, { align: 'right' });
  }

  const fileName = `Expense_Report_${data.periodLabel}_${format(data.now, 'yyyy-MM-dd')}.pdf`;
  doc.save(fileName);
};

// ===================== CSV REPORT GENERATOR =====================

export const generateCSV = (expenses, period, profile) => {
  const data = computeReportData(expenses, period, profile, '');

  const buildSection = (title, rows) => {
    return [`## ${title}`, ...rows.map(r => Array.isArray(r) ? r.join(',') : String(r)), ''];
  };

  const csvLines = [
    ...buildSection('Report Metadata', [
      ['Field', 'Value'],
      ['Report Type', `${data.periodLabel} Financial Report`],
      ['Period Start', fmtDate(data.startDate)],
      ['Period End', fmtDate(data.endDate)],
      ['Generated', fmtDateTime(data.now)],
      ['Currency', 'INR (₹)'],
    ]),
    ...buildSection('Executive Summary', [
      ['Metric', 'Value'],
      ['Total Spent', `${CURRENCY}${data.totalSpent.toFixed(2)}`],
      ['Total Transactions', data.totalTransactions],
      ['Daily Average', `${CURRENCY}${data.dailyAverage.toFixed(2)}`],
      ['Avg Per Transaction', `${CURRENCY}${data.avgPerTransaction.toFixed(2)}`],
      data.budget > 0 ? ['Budget Utilization', `${data.budgetUsed.toFixed(1)}%`] : null,
      data.budget > 0 ? ['Budget Remaining', `${CURRENCY}${Math.max(0, data.budgetRemaining).toFixed(2)}`] : null,
      ['Financial Health Score', `${Math.round(data.financialScore)}/100 (${data.scoreRating.text})`],
    ].filter(Boolean)),
    ...buildSection('Category Breakdown', [
      ['Rank', 'Category', 'Type', 'Transactions', 'Amount', '% Share'],
      ...data.sortedCategories.map(([cat, d], i) => [
        i + 1, cat, getExpenseType(cat), d.count, `${CURRENCY}${d.total.toFixed(2)}`,
        `${data.totalSpent > 0 ? (d.total / data.totalSpent * 100).toFixed(1) : 0}%`,
      ]),
    ]),
    ...buildSection('Spending Distribution', [
      ['Category', 'Amount', 'Percentage'],
      ['Necessary/Essential', `${CURRENCY}${data.splitBreakdown.necessary.toFixed(2)}`, `${data.splitBreakdown.necessaryPct.toFixed(1)}%`],
      ['Luxury/Discretionary', `${CURRENCY}${data.splitBreakdown.luxury.toFixed(2)}`, `${data.splitBreakdown.luxuryPct.toFixed(1)}%`],
    ]),
    ...(data.spendingChange != null ? buildSection('Period Comparison', [
      ['Current Period', `${CURRENCY}${data.totalSpent.toFixed(2)}`],
      ['Previous Period', `${CURRENCY}${data.prevTotalSpent.toFixed(2)}`],
      ['Change', `${data.spendingChange > 0 ? '+' : ''}${data.spendingChange.toFixed(1)}%`],
    ]) : []),
    ...buildSection('Detailed Transactions', [
      ['#', 'Date', 'Time', 'Category', 'Type', 'Description', 'Amount', 'Payment Method'],
      ...data.filteredExpenses
        .sort((a, b) => new Date(b.expense_date) - new Date(a.expense_date))
        .map((exp, i) => [
          i + 1,
          format(parseISO(exp.expense_date), DATE_FORMAT),
          exp.expense_time || '',
          exp.category || 'Uncategorized',
          getExpenseType(exp.category),
          `"${(exp.description || '').replace(/"/g, '""')}"`,
          `${CURRENCY}${parseFloat(exp.amount).toFixed(2)}`,
          exp.payment_method || '',
        ]),
    ]),
    ...buildSection('Key Insights', data.insightTexts.map((t, i) => `${i + 1}. "${t.replace(/"/g, '""')}"`)),
    ...(buildRecommendations(data).length > 0 ? buildSection('Recommendations', buildRecommendations(data).map((r, i) => `${i + 1}. "${r.replace(/"/g, '""')}"`)) : []),
  ];

  const csvContent = csvLines.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Expense_Report_${data.periodLabel}_${format(data.now, 'yyyy-MM-dd')}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// ===================== PRINT (HTML) REPORT GENERATOR =====================

export const generatePrintReport = (expenses, period, profile, userEmail) => {
  const data = computeReportData(expenses, period, profile, userEmail);
  const execSummary = buildExecutiveSummary(data);
  const recommendations = buildRecommendations(data);

  const html = `<!DOCTYPE html>
<html>
<head>
  <title>${data.periodLabel} Financial Report — Smart Expense Analyzer</title>
  <style>
    :root { --primary: #1e40af; --accent: #3b82f6; --danger: #ef4444; --warning: #f59e0b; --success: #10b981; --purple: #8b5cf6; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; padding: 40px 50px; color: #1e293b; background: #fff; line-height: 1.5; }
    .report-header { background: linear-gradient(135deg, var(--primary), var(--accent)); color: #fff; padding: 32px; border-radius: 12px; margin-bottom: 36px; }
    .report-header h1 { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
    .report-header .subtitle { font-size: 15px; opacity: 0.9; margin-bottom: 8px; }
    .report-header .meta { font-size: 12px; opacity: 0.75; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
    .section { margin-bottom: 32px; }
    .section-title { font-size: 14px; font-weight: 700; color: var(--primary); text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 16px; }
    .exec-summary { background: #f8fafc; border-left: 4px solid var(--accent); padding: 16px 20px; border-radius: 0 8px 8px 0; font-size: 14px; color: #334155; }
    .exec-summary p { margin-bottom: 6px; }
    .exec-summary p:last-child { margin-bottom: 0; }
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 14px; }
    .kpi-card { background: #f8fafc; border-radius: 10px; padding: 18px 14px; text-align: center; border-top: 4px solid var(--accent); }
    .kpi-card .label { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
    .kpi-card .value { font-size: 20px; font-weight: 700; color: #1e293b; }
    .kpi-card .sub { font-size: 11px; color: #94a3b8; margin-top: 4px; }
    .distribution-bar { display: flex; height: 24px; border-radius: 12px; overflow: hidden; margin: 12px 0; }
    .distribution-bar .nec { background: var(--success); }
    .distribution-bar .lux { background: var(--purple); }
    .budget-progress { background: #e2e8f0; border-radius: 8px; height: 14px; overflow: hidden; margin: 10px 0; }
    .budget-progress .fill { height: 100%; border-radius: 8px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 8px; }
    th { background: var(--primary); color: #fff; padding: 10px 12px; text-align: left; font-weight: 600; font-size: 12px; }
    td { padding: 8px 12px; border-bottom: 1px solid #e2e8f0; }
    tr:nth-child(even) td { background: #f8fafc; }
    .num { text-align: right; font-variant-numeric: tabular-nums; }
    .insights-list, .recs-list { list-style: none; padding: 0; }
    .insights-list li, .recs-list li { padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #334155; }
    .insights-list li::before { content: "•"; color: var(--accent); font-weight: bold; margin-right: 10px; }
    .recs-list li { counter-increment: rec; }
    .recs-list li::before { content: counter(rec) "."; font-weight: 600; color: var(--primary); margin-right: 10px; }
    .recs-list { counter-reset: rec; }
    .footer { text-align: center; color: #94a3b8; font-size: 11px; margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 16px; font-size: 12px; font-weight: 600; }
    .badge-success { background: #ecfdf5; color: #065f46; }
    .badge-warning { background: #fefce8; color: #854d0e; }
    .badge-danger { background: #fef2f2; color: #991b1b; }
    @media print { body { padding: 20px 30px; } .no-print { display: none !important; } }
    .print-btn { position: fixed; top: 20px; right: 20px; background: var(--primary); color: #fff; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; z-index: 100; box-shadow: 0 4px 12px rgba(30,64,175,0.3); }
    .print-btn:hover { background: #1d4ed8; }
  </style>
</head>
<body>
  <button class="print-btn no-print" onclick="window.print()">🖨️ Print Report</button>

  <!-- HEADER / COVER -->
  <div class="report-header">
    <h1>Smart Expense Analyzer</h1>
    <div class="subtitle">${data.periodLabel} Financial Report</div>
    <div class="meta">
      <span>Period: ${fmtDate(data.startDate)} – ${fmtDate(data.endDate)}</span>
      <span>Account: ${data.userEmail || 'N/A'}</span>
    </div>
    <div class="meta">
      <span>Generated: ${fmtDateTime(data.now)}</span>
      <span>Classification: Confidential</span>
    </div>
  </div>

  <!-- EXECUTIVE SUMMARY -->
  <div class="section">
    <div class="section-title">Executive Summary</div>
    <div class="exec-summary">
      ${execSummary.map(line => `<p>${line}</p>`).join('')}
    </div>
  </div>

  <!-- KPI METRICS -->
  <div class="section">
    <div class="section-title">Key Performance Indicators</div>
    <div class="kpi-grid">
      <div class="kpi-card" style="border-top-color: var(--danger)">
        <div class="label">Total Spent</div>
        <div class="value">${fmtCurrencyWhole(data.totalSpent)}</div>
        <div class="sub">${data.totalTransactions} transactions</div>
      </div>
      <div class="kpi-card" style="border-top-color: var(--accent)">
        <div class="label">Daily Average</div>
        <div class="value">${fmtCurrencyWhole(data.dailyAverage)}</div>
        <div class="sub">over ${data.daysInRange} days</div>
      </div>
      <div class="kpi-card" style="border-top-color: var(--success)">
        <div class="label">Avg / Transaction</div>
        <div class="value">${fmtCurrencyWhole(data.avgPerTransaction)}</div>
        <div class="sub">per expense</div>
      </div>
      <div class="kpi-card" style="border-top-color: var(--warning)">
        <div class="label">Health Score</div>
        <div class="value">${Math.round(data.financialScore)}/100</div>
        <div class="sub">${data.scoreRating.text}</div>
      </div>
      ${data.budget > 0 ? `
      <div class="kpi-card" style="border-top-color: ${data.budgetUsed > 80 ? 'var(--danger)' : 'var(--success)'}">
        <div class="label">Budget Utilization</div>
        <div class="value">${fmtPercent(data.budgetUsed)}</div>
        <div class="sub">of ${fmtCurrencyWhole(data.budget)}</div>
      </div>` : ''}
    </div>
  </div>

  <!-- SPENDING DISTRIBUTION -->
  ${data.splitBreakdown.total > 0 ? `
  <div class="section">
    <div class="section-title">Spending Distribution</div>
    <div style="display:flex;gap:24px;margin-bottom:10px;">
      <span style="color:var(--success);font-weight:600;">Essential: ${fmtCurrencyWhole(data.splitBreakdown.necessary)} (${fmtPercent(data.splitBreakdown.necessaryPct)})</span>
      <span style="color:var(--purple);font-weight:600;">Discretionary: ${fmtCurrencyWhole(data.splitBreakdown.luxury)} (${fmtPercent(data.splitBreakdown.luxuryPct)})</span>
    </div>
    <div class="distribution-bar">
      <div class="nec" style="width:${data.splitBreakdown.necessaryPct}%"></div>
      <div class="lux" style="width:${data.splitBreakdown.luxuryPct}%"></div>
    </div>
  </div>` : ''}

  <!-- BUDGET PERFORMANCE -->
  ${data.budget > 0 ? `
  <div class="section">
    <div class="section-title">Budget Performance</div>
    <p style="font-size:14px;color:#334155;">Budget: <strong>${fmtCurrency(data.budget)}</strong> &nbsp;|&nbsp; Spent: <strong>${fmtCurrency(data.totalSpent)}</strong> (${fmtPercent(data.budgetUsed)}) &nbsp;|&nbsp; Remaining: <strong>${fmtCurrency(Math.max(0, data.budgetRemaining))}</strong></p>
    <div class="budget-progress">
      <div class="fill" style="width:${Math.min(100, data.budgetUsed)}%;background:${data.budgetUsed > 100 ? 'var(--danger)' : data.budgetUsed > 80 ? 'var(--warning)' : 'var(--success)'}"></div>
    </div>
  </div>` : ''}

  <!-- CATEGORY BREAKDOWN -->
  ${data.sortedCategories.length > 0 ? `
  <div class="section">
    <div class="section-title">Category Breakdown</div>
    <table>
      <thead><tr><th>#</th><th>Category</th><th>Type</th><th class="num">Txns</th><th class="num">Amount</th><th class="num">% Share</th></tr></thead>
      <tbody>
        ${data.sortedCategories.map(([cat, d], i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${cat}</td>
          <td>${getExpenseType(cat) === 'necessary' ? 'Essential' : 'Discretionary'}</td>
          <td class="num">${d.count}</td>
          <td class="num">${fmtCurrency(d.total)}</td>
          <td class="num">${fmtPercent(data.totalSpent > 0 ? (d.total / data.totalSpent) * 100 : 0)}</td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>` : ''}

  <!-- TRENDS & COMPARISONS -->
  ${(data.spendingChange != null || data.prediction) ? `
  <div class="section">
    <div class="section-title">Trends & Comparisons</div>
    <ul style="font-size:14px;color:#334155;list-style:disc;padding-left:20px;">
      ${data.spendingChange != null ? `<li>Spending ${data.spendingChange > 0 ? 'increased' : 'decreased'} ${fmtPercent(Math.abs(data.spendingChange))} vs previous period (${fmtCurrencyWhole(data.prevTotalSpent)} → ${fmtCurrencyWhole(data.totalSpent)})</li>` : ''}
      ${data.transactionChange != null ? `<li>Transaction volume: ${data.prevTransactions} → ${data.totalTransactions} (${data.transactionChange > 0 ? '+' : ''}${fmtPercent(data.transactionChange)})</li>` : ''}
      ${data.prediction ? `<li>Predicted next month: <strong>${fmtCurrencyWhole(data.prediction.predicted_amount)}</strong> (confidence ${fmtPercent(data.prediction.confidence)}, trend ${data.prediction.trend_percentage > 0 ? '+' : ''}${fmtPercent(data.prediction.trend_percentage)})</li>` : ''}
      ${data.forecast?.exhaustionDate ? `<li style="color:var(--danger);">Budget exhaustion risk by <strong>${fmtDate(data.forecast.exhaustionDate)}</strong> at current rate (${fmtCurrency(data.forecast.dailyRate)}/day)</li>` : ''}
    </ul>
  </div>` : ''}

  <!-- KEY INSIGHTS -->
  ${data.insightTexts.length > 0 ? `
  <div class="section">
    <div class="section-title">Key Insights</div>
    <ul class="insights-list">
      ${data.insightTexts.map(t => `<li>${t}</li>`).join('')}
    </ul>
  </div>` : ''}

  <!-- RECOMMENDATIONS -->
  ${recommendations.length > 0 ? `
  <div class="section">
    <div class="section-title">Recommendations</div>
    <ol class="recs-list">
      ${recommendations.map(r => `<li>${r}</li>`).join('')}
    </ol>
  </div>` : ''}

  <!-- APPENDIX: DETAILED RECORDS -->
  <div class="section">
    <div class="section-title">Appendix: Detailed Transaction Records</div>
    ${data.filteredExpenses.length > 0 ? `
    <table>
      <thead><tr><th>#</th><th>Date</th><th>Time</th><th>Category</th><th>Description</th><th class="num">Amount</th></tr></thead>
      <tbody>
        ${[...data.filteredExpenses].sort((a, b) => new Date(b.expense_date) - new Date(a.expense_date)).map((exp, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${format(parseISO(exp.expense_date), DATE_FORMAT)}</td>
          <td>${exp.expense_time ? exp.expense_time.substring(0, 5) : '--:--'}</td>
          <td>${exp.category || 'Uncategorized'}</td>
          <td>${exp.description || '—'}</td>
          <td class="num">${fmtCurrency(parseFloat(exp.amount))}</td>
        </tr>`).join('')}
      </tbody>
    </table>
    <p style="margin-top:12px;font-size:13px;font-weight:600;color:#1e293b;">Total: ${fmtCurrency(data.totalSpent)} &nbsp;|&nbsp; ${data.totalTransactions} transactions &nbsp;|&nbsp; Period: ${fmtDate(data.startDate)} – ${fmtDate(data.endDate)}</p>
    ` : '<p style="color:#94a3b8;font-size:14px;">No transactions recorded in this period.</p>'}
  </div>

  <div class="footer">
    <p>Smart Expense Analyzer | Confidential — For personal use only | Generated ${fmtDateTime(data.now)}</p>
  </div>
</body>
</html>`;

  const printWindow = window.open('', '_blank');
  printWindow.document.write(html);
  printWindow.document.close();
};
