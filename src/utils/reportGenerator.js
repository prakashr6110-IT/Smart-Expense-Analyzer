import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format, parseISO, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, endOfYear } from 'date-fns';
import { getSpendingBreakdown, getExpenseType } from './categoryClassification';
import { calculateFinancialScore, getScoreRating, predictNextMonthExpense, calculateBudgetExhaustionForecast } from './prediction';

/**
 * Generate a PDF expense report for a given period
 * @param {Array} expenses - Array of expense objects
 * @param {string} period - 'weekly' | 'monthly' | 'yearly'
 * @param {object} profile - User profile with monthly_budget
 * @param {string} userEmail - User's email
 */
/**
 * Convert an image URL to base64 data URL for jsPDF embedding
 */
const imageToBase64 = async (url) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

export const generateReport = async (expenses, period, profile, userEmail) => {
  const doc = new jsPDF();
  const now = new Date();

  // Load logo for PDF embedding
  let logoBase64 = null;
  try {
    logoBase64 = await imageToBase64('/logo.png');
  } catch { /* fallback to no logo */ }

  // Calculate date range
  let startDate, endDate, periodLabel;
  switch (period) {
    case 'weekly':
      startDate = startOfWeek(now, { weekStartsOn: 1 });
      endDate = endOfWeek(now, { weekStartsOn: 1 });
      periodLabel = 'Weekly';
      break;
    case 'monthly':
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
      periodLabel = 'Monthly';
      break;
    case 'yearly':
      startDate = startOfYear(now);
      endDate = endOfYear(now);
      periodLabel = 'Yearly';
      break;
    default:
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
      periodLabel = 'Monthly';
  }

  // Filter expenses for the period
  const filteredExpenses = expenses.filter(exp => {
    const expDate = parseISO(exp.expense_date);
    return expDate >= startDate && expDate <= endDate;
  });

  // Calculate totals
  const totalSpent = filteredExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  const totalTransactions = filteredExpenses.length;
  const avgPerTransaction = totalTransactions > 0 ? totalSpent / totalTransactions : 0;

  // Category breakdown
  const categoryBreakdown = {};
  filteredExpenses.forEach(exp => {
    const cat = exp.category || 'Uncategorized';
    if (!categoryBreakdown[cat]) {
      categoryBreakdown[cat] = { total: 0, count: 0 };
    }
    categoryBreakdown[cat].total += parseFloat(exp.amount);
    categoryBreakdown[cat].count += 1;
  });

  // Sort categories by total spending (descending)
  const sortedCategories = Object.entries(categoryBreakdown)
    .sort((a, b) => b[1].total - a[1].total);

  // Top category
  const topCategory = sortedCategories.length > 0 ? sortedCategories[0] : null;

  // Daily average
  const daysInRange = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
  const dailyAverage = totalSpent / daysInRange;

  // Budget analysis (for monthly)
  const budget = profile?.monthly_budget || 0;
  const budgetUsed = budget > 0 ? (totalSpent / budget) * 100 : 0;
  const budgetRemaining = budget > 0 ? budget - totalSpent : 0;

  // Necessary vs Luxury breakdown
  const splitBreakdown = getSpendingBreakdown(filteredExpenses);

  // ===================== DRAW PDF =====================

  // Header background
  doc.setFillColor(30, 64, 175); // blue-800
  doc.rect(0, 0, 210, 50, 'F');

  // Title
  const titleX = 14;
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('Smart Expense Analyzer', titleX, 20);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`${periodLabel} Expense Report`, titleX, 30);

  doc.setFontSize(10);
  doc.text(`${format(startDate, 'dd MMM yyyy')} - ${format(endDate, 'dd MMM yyyy')}`, titleX, 38);

  // User info (right side)
  doc.setFontSize(9);
  doc.text(`Generated: ${format(now, 'dd MMM yyyy, hh:mm a')}`, 196, 20, { align: 'right' });
  doc.text(`User: ${userEmail || 'N/A'}`, 196, 28, { align: 'right' });

  // Reset text color
  doc.setTextColor(30, 30, 30);

  // ---- Summary Cards ----
  let yPos = 58;

  // Card backgrounds
  const cardWidth = 44;
  const cardHeight = 28;
  const cardGap = 4;
  const cards = [
    { label: 'Total Spent', value: `Rs.${totalSpent.toFixed(2)}`, color: [239, 68, 68] },      // red
    { label: 'Transactions', value: `${totalTransactions}`, color: [59, 130, 246] },              // blue
    { label: 'Daily Average', value: `Rs.${dailyAverage.toFixed(2)}`, color: [245, 158, 11] },    // amber
    { label: 'Avg / Expense', value: `Rs.${avgPerTransaction.toFixed(2)}`, color: [16, 185, 129] }, // green
  ];

  cards.forEach((card, i) => {
    const x = 14 + i * (cardWidth + cardGap);

    // Card background
    doc.setFillColor(248, 250, 252); // slate-50
    doc.roundedRect(x, yPos, cardWidth, cardHeight, 3, 3, 'F');

    // Card border top
    doc.setFillColor(card.color[0], card.color[1], card.color[2]);
    doc.roundedRect(x, yPos, cardWidth, 4, 2, 2, 'F');

    // Label
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text(card.label, x + cardWidth / 2, yPos + 13, { align: 'center' });

    // Value
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(card.color[0], card.color[1], card.color[2]);
    doc.text(card.value, x + cardWidth / 2, yPos + 22, { align: 'center' });
    doc.setFont('helvetica', 'normal');
  });

  yPos += cardHeight + 8;

  // ---- Necessary vs Luxury Breakdown ----
  if (splitBreakdown.total > 0) {
    doc.setFillColor(236, 253, 245); // emerald-50
    doc.roundedRect(14, yPos, 88, 28, 3, 3, 'F');
    doc.setFillColor(16, 185, 129); // emerald-500
    doc.roundedRect(14, yPos, 88, 4, 2, 2, 'F');
    doc.setFontSize(8);
    doc.setTextColor(6, 95, 70); // emerald-800
    doc.setFont('helvetica', 'bold');
    doc.text('Necessary Spending', 18, yPos + 12);
    doc.setFontSize(14);
    doc.text(`Rs.${splitBreakdown.necessary.toFixed(0)}`, 18, yPos + 22);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`(${splitBreakdown.necessaryPct.toFixed(1)}% of total)`, 60, yPos + 22);

    doc.setFillColor(245, 243, 255); // purple-50
    doc.roundedRect(108, yPos, 88, 28, 3, 3, 'F');
    doc.setFillColor(139, 92, 246); // purple-500
    doc.roundedRect(108, yPos, 88, 4, 2, 2, 'F');
    doc.setFontSize(8);
    doc.setTextColor(91, 33, 182); // purple-800
    doc.setFont('helvetica', 'bold');
    doc.text('Luxury Spending', 112, yPos + 12);
    doc.setFontSize(14);
    doc.text(`Rs.${splitBreakdown.luxury.toFixed(0)}`, 112, yPos + 22);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`(${splitBreakdown.luxuryPct.toFixed(1)}% of total)`, 152, yPos + 22);

    // Luxury ratio indicator
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text(`Luxury Ratio: ${splitBreakdown.luxuryPct.toFixed(1)}%`, 14, yPos + 34);

    yPos += 40;
  }

  // ---- Budget Section (if budget is set) ----
  if (budget > 0) {
    doc.setFillColor(240, 249, 255); // sky-50
    doc.roundedRect(14, yPos, 182, 30, 3, 3, 'F');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 64, 175);
    doc.text('Budget Analysis', 18, yPos + 10);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    doc.text(`Monthly Budget: Rs.${budget.toLocaleString()}`, 18, yPos + 18);
    doc.text(`Spent: Rs.${totalSpent.toFixed(2)} (${budgetUsed.toFixed(1)}%)`, 78, yPos + 18);
    doc.text(`Remaining: Rs.${budgetRemaining.toFixed(2)}`, 140, yPos + 18);

    // Progress bar
    const barX = 18;
    const barY = yPos + 22;
    const barWidth = 174;
    const barHeight = 4;
    const fillWidth = Math.min(barWidth, barWidth * (budgetUsed / 100));

    doc.setFillColor(229, 231, 235); // gray-200
    doc.roundedRect(barX, barY, barWidth, barHeight, 2, 2, 'F');

    if (budgetUsed > 100) {
      doc.setFillColor(239, 68, 68); // red
    } else if (budgetUsed > 80) {
      doc.setFillColor(245, 158, 11); // amber
    } else {
      doc.setFillColor(34, 197, 94); // green
    }
    doc.roundedRect(barX, barY, fillWidth, barHeight, 2, 2, 'F');

    yPos += 36;
  }

  // ---- Category Breakdown Table ----
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text('Category Breakdown', 14, yPos + 4);

  yPos += 6;

  if (sortedCategories.length > 0) {
    const catTableData = sortedCategories.map(([cat, data], index) => [
      `${index + 1}`,
      cat,
      getExpenseType(cat) === 'necessary' ? 'Necessary' : 'Luxury',
      `${data.count}`,
      `Rs.${data.total.toFixed(2)}`,
      `${totalSpent > 0 ? ((data.total / totalSpent) * 100).toFixed(1) : 0}%`,
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['#', 'Category', 'Type', 'Txns', 'Amount', '% of Total']],
      body: catTableData,
      theme: 'striped',
      headStyles: {
        fillColor: [30, 64, 175],
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'center',
      },
      bodyStyles: {
        fontSize: 9,
        halign: 'center',
      },
      columnStyles: {
        0: { cellWidth: 12 },
        1: { cellWidth: 45, halign: 'left' },
        2: { cellWidth: 28 },
        3: { cellWidth: 22 },
        4: { cellWidth: 35 },
        5: { cellWidth: 25 },
      },
      margin: { left: 14, right: 14 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    yPos = doc.lastAutoTable.finalY + 8;
  } else {
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text('No expenses recorded in this period.', 14, yPos + 8);
    yPos += 16;
  }

  // ---- Top Spending Category ----
  if (topCategory) {
    doc.setFillColor(254, 243, 199); // amber-100
    doc.roundedRect(14, yPos, 182, 14, 3, 3, 'F');
    doc.setFontSize(9);
    doc.setTextColor(146, 64, 14); // amber-800
    doc.setFont('helvetica', 'bold');
    doc.text(`Top Spending Category: ${topCategory[0]}`, 18, yPos + 8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Rs.${topCategory[1].total.toFixed(2)} across ${topCategory[1].count} transactions`, 105, yPos + 8);
    yPos += 20;
  }

  // ---- Expense Transactions Table ----
  // Check if we need a new page
  if (yPos > 220) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text('All Transactions', 14, yPos + 4);
  yPos += 6;

  if (filteredExpenses.length > 0) {
    // Sort by date descending
    const sortedExpenses = [...filteredExpenses].sort(
      (a, b) => new Date(b.expense_date) - new Date(a.expense_date)
    );

    const txData = sortedExpenses.map((exp, i) => [
      `${i + 1}`,
      format(parseISO(exp.expense_date), 'dd MMM yyyy'),
      exp.expense_time ? exp.expense_time.substring(0, 5) : '--:--',
      exp.category || 'N/A',
      exp.description || '-',
      `Rs.${parseFloat(exp.amount).toFixed(2)}`,
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['#', 'Date', 'Time', 'Category', 'Description', 'Amount']],
      body: txData,
      theme: 'striped',
      headStyles: {
        fillColor: [30, 64, 175],
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'center',
      },
      bodyStyles: {
        fontSize: 8,
        halign: 'center',
      },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 28 },
        2: { cellWidth: 18 },
        3: { cellWidth: 30, halign: 'left' },
        4: { cellWidth: 60, halign: 'left' },
        5: { cellWidth: 30 },
      },
      margin: { left: 14, right: 14 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });
  } else {
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text('No transactions recorded in this period.', 14, yPos + 8);
  }

  // ---- Footer + Watermark on every page ----
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    // Watermark logo (centered, low opacity)
    if (logoBase64) {
      try {
        const wmSize = 140; // mm, fits within 210mm page width
        const wmX = (210 - wmSize) / 2;
        const wmY = (297 - wmSize) / 2 - 10; // slightly above center
        doc.saveGraphicsState();
        doc.setGState(new doc.GState({ opacity: 0.04 }));
        doc.addImage(logoBase64, 'PNG', wmX, wmY, wmSize, wmSize);
        doc.restoreGraphicsState();
      } catch { /* skip watermark if embedding fails */ }
    }

    // Footer bar
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 282, 210, 15, 'F');
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Smart Expense Behavior Analyzer', 14, 289);
    doc.text(`Page ${i} of ${pageCount}`, 196, 289, { align: 'right' });
    doc.text('Confidential - For personal use only', 105, 289, { align: 'center' });
  }

  // Save the PDF
  const fileName = `Expense_Report_${periodLabel}_${format(now, 'yyyy-MM-dd')}.pdf`;
  doc.save(fileName);
};

/**
 * Generate a CSV export of expenses
 */
export const generateCSV = (expenses, period, profile) => {
  const now = new Date();
  let startDate, endDate, periodLabel;

  switch (period) {
    case 'weekly':
      startDate = startOfWeek(now, { weekStartsOn: 1 });
      endDate = endOfWeek(now, { weekStartsOn: 1 });
      periodLabel = 'Weekly';
      break;
    case 'monthly':
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
      periodLabel = 'Monthly';
      break;
    case 'yearly':
      startDate = startOfYear(now);
      endDate = endOfYear(now);
      periodLabel = 'Yearly';
      break;
    default:
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
      periodLabel = 'Monthly';
  }

  const filteredExpenses = expenses.filter(exp => {
    const expDate = parseISO(exp.expense_date);
    return expDate >= startDate && expDate <= endDate;
  });

  // Sort by date descending
  const sorted = [...filteredExpenses].sort(
    (a, b) => new Date(b.expense_date) - new Date(a.expense_date)
  );

  // Build CSV
  const headers = ['#', 'Date', 'Time', 'Category', 'Type', 'Description', 'Amount (₹)', 'Payment Method'];
  const rows = sorted.map((exp, i) => [
    i + 1,
    format(parseISO(exp.expense_date), 'yyyy-MM-dd'),
    exp.expense_time || '',
    exp.category || '',
    getExpenseType(exp.category),
    `"${(exp.description || '').replace(/"/g, '""')}"`,
    parseFloat(exp.amount).toFixed(2),
    exp.payment_method || '',
  ]);

  // Summary section
  const totalSpent = filteredExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  const breakdown = getSpendingBreakdown(filteredExpenses);
  const budget = profile?.monthly_budget || 0;
  const score = calculateFinancialScore(expenses, budget || 10000);

  const summaryRows = [
    [],
    ['SUMMARY'],
    ['Period', `${format(startDate, 'dd MMM yyyy')} - ${format(endDate, 'dd MMM yyyy')}`],
    ['Total Expenses', `₹${totalSpent.toFixed(2)}`],
    ['Transactions', filteredExpenses.length],
    ['Necessary Spending', `₹${breakdown.necessary.toFixed(2)} (${breakdown.necessaryPct.toFixed(1)}%)`],
    ['Luxury Spending', `₹${breakdown.luxury.toFixed(2)} (${breakdown.luxuryPct.toFixed(1)}%)`],
    ['Monthly Budget', budget > 0 ? `₹${budget.toLocaleString()}` : 'Not set'],
    ['Budget Used', budget > 0 ? `${((totalSpent / budget) * 100).toFixed(1)}%` : 'N/A'],
    ['Financial Health Score', `${Math.round(score)}/100`],
  ];

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
    ...summaryRows.map(row => row.join(',')),
  ].join('\n');

  // Download CSV
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Expense_Report_${periodLabel}_${format(now, 'yyyy-MM-dd')}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Generate a printable report in a new window
 */
export const generatePrintReport = (expenses, period, profile, userEmail) => {
  const now = new Date();
  let startDate, endDate, periodLabel;

  switch (period) {
    case 'weekly':
      startDate = startOfWeek(now, { weekStartsOn: 1 });
      endDate = endOfWeek(now, { weekStartsOn: 1 });
      periodLabel = 'Weekly';
      break;
    case 'monthly':
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
      periodLabel = 'Monthly';
      break;
    case 'yearly':
      startDate = startOfYear(now);
      endDate = endOfYear(now);
      periodLabel = 'Yearly';
      break;
    default:
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
      periodLabel = 'Monthly';
  }

  const filteredExpenses = expenses.filter(exp => {
    const expDate = parseISO(exp.expense_date);
    return expDate >= startDate && expDate <= endDate;
  });

  const totalSpent = filteredExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  const breakdown = getSpendingBreakdown(filteredExpenses);
  const budget = profile?.monthly_budget || 0;
  const score = calculateFinancialScore(expenses, budget || 10000);
  const rating = getScoreRating(score);
  const prediction = predictNextMonthExpense(expenses, budget || 10000);
  const forecast = calculateBudgetExhaustionForecast(expenses, budget || 10000);

  // Category breakdown
  const categoryBreakdown = {};
  filteredExpenses.forEach(exp => {
    const cat = exp.category || 'Uncategorized';
    if (!categoryBreakdown[cat]) categoryBreakdown[cat] = { total: 0, count: 0 };
    categoryBreakdown[cat].total += parseFloat(exp.amount);
    categoryBreakdown[cat].count += 1;
  });
  const sortedCategories = Object.entries(categoryBreakdown).sort((a, b) => b[1].total - a[1].total);

  const sortedExpenses = [...filteredExpenses].sort(
    (a, b) => new Date(b.expense_date) - new Date(a.expense_date)
  );

  const budgetUsed = budget > 0 ? (totalSpent / budget) * 100 : 0;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>${periodLabel} Expense Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, sans-serif; padding: 40px; color: #1a1a1a; background: #fff; }
    .header { background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 30px; border-radius: 12px; margin-bottom: 30px; }
    .header h1 { font-size: 24px; margin-bottom: 5px; }
    .header p { opacity: 0.9; font-size: 14px; }
    .meta { display: flex; justify-content: space-between; margin-bottom: 30px; font-size: 13px; color: #666; }
    .cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
    .card { background: #f8fafc; border-radius: 10px; padding: 20px; text-align: center; border-top: 4px solid #3b82f6; }
    .card .label { font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px; }
    .card .value { font-size: 22px; font-weight: bold; color: #1a1a1a; }
    .card.red { border-color: #ef4444; }
    .card.green { border-color: #10b981; }
    .card.amber { border-color: #f59e0b; }
    .card.purple { border-color: #8b5cf6; }
    .section { margin-bottom: 30px; }
    .section h2 { font-size: 18px; color: #1e40af; margin-bottom: 15px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; }
    .split { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px; }
    .split-card { padding: 20px; border-radius: 10px; }
    .split-card.necessary { background: #ecfdf5; border-left: 4px solid #10b981; }
    .split-card.luxury { background: #f5f3ff; border-left: 4px solid #8b5cf6; }
    .split-card h3 { font-size: 14px; margin-bottom: 5px; }
    .split-card .amount { font-size: 24px; font-weight: bold; }
    .budget-bar { background: #e5e7eb; border-radius: 10px; height: 20px; overflow: hidden; margin: 10px 0; }
    .budget-fill { height: 100%; border-radius: 10px; transition: width 0.5s; }
    .score-badge { display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 20px; font-weight: bold; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th { background: #1e40af; color: white; padding: 10px 12px; text-align: left; font-size: 12px; }
    td { padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
    tr:nth-child(even) { background: #f8fafc; }
    .prediction { background: #eff6ff; border-radius: 10px; padding: 20px; border-left: 4px solid #3b82f6; }
    .prediction-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-top: 15px; }
    .footer { text-align: center; color: #999; font-size: 11px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
    @media print { body { padding: 20px; } .no-print { display: none; } }
    .print-btn { position: fixed; top: 20px; right: 20px; background: #1e40af; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; z-index: 100; }
  </style>
</head>
<body>
  <button class="print-btn no-print" onclick="window.print()">🖨️ Print Report</button>

  <div class="header">
    <h1>Smart Expense Analyzer</h1>
    <p>${periodLabel} Expense Report</p>
    <p>${format(startDate, 'dd MMM yyyy')} — ${format(endDate, 'dd MMM yyyy')}</p>
  </div>

  <div class="meta">
    <span>User: ${userEmail || 'N/A'}</span>
    <span>Generated: ${format(now, 'dd MMM yyyy, hh:mm a')}</span>
  </div>

  <div class="cards">
    <div class="card red">
      <div class="label">Total Spent</div>
      <div class="value">₹${totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
    </div>
    <div class="card green">
      <div class="label">Transactions</div>
      <div class="value">${filteredExpenses.length}</div>
    </div>
    <div class="card amber">
      <div class="label">Health Score</div>
      <div class="value">${Math.round(score)}/100</div>
    </div>
    <div class="card purple">
      <div class="label">Budget Used</div>
      <div class="value">${budgetUsed.toFixed(1)}%</div>
    </div>
  </div>

  ${splitBreakdown.total > 0 ? `
  <div class="split">
    <div class="split-card necessary">
      <h3>Necessary Spending</h3>
      <div class="amount">₹${splitBreakdown.necessary.toFixed(0)}</div>
      <p>${splitBreakdown.necessaryPct.toFixed(1)}% of total</p>
    </div>
    <div class="split-card luxury">
      <h3>Luxury Spending</h3>
      <div class="amount">₹${splitBreakdown.luxury.toFixed(0)}</div>
      <p>${splitBreakdown.luxuryPct.toFixed(1)}% of total</p>
    </div>
  </div>` : ''}

  ${budget > 0 ? `
  <div class="section">
    <h2>Budget Analysis</h2>
    <p>Monthly Budget: <strong>₹${budget.toLocaleString()}</strong> | Spent: <strong>₹${totalSpent.toFixed(2)}</strong> (${budgetUsed.toFixed(1)}%) | Remaining: <strong>₹${Math.max(0, budget - totalSpent).toFixed(2)}</strong></p>
    <div class="budget-bar">
      <div class="budget-fill" style="width:${Math.min(100, budgetUsed)}%;background:${budgetUsed > 100 ? '#ef4444' : budgetUsed > 80 ? '#f59e0b' : '#10b981'}"></div>
    </div>
  </div>` : ''}

  <div class="section">
    <h2>Financial Health Score</h2>
    <div class="score-badge" style="background:${score >= 70 ? '#ecfdf5' : score >= 50 ? '#fefce8' : '#fef2f2'};color:${score >= 70 ? '#065f46' : score >= 50 ? '#854d0e' : '#991b1b'}">
      ${rating.emoji} ${Math.round(score)}/100 — ${rating.text}
    </div>
  </div>

  ${prediction ? `
  <div class="section">
    <h2>Future Predictions</h2>
    <div class="prediction">
      <p>Predicted Next Month: <strong>₹${prediction.predicted_amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</strong></p>
      <p>Confidence: <strong>${prediction.confidence.toFixed(0)}%</strong> | Trend: <strong>${prediction.trend_percentage > 0 ? '↑' : '↓'}${Math.abs(prediction.trend_percentage).toFixed(1)}%</strong></p>
      ${forecast.exhaustionDate ? `<p style="color:#ef4444;font-weight:bold;">⚠️ Budget may exhaust by ${format(forecast.exhaustionDate, 'dd MMM yyyy')}</p>` : ''}
    </div>
  </div>` : ''}

  <div class="section">
    <h2>Category Breakdown</h2>
    <table>
      <thead><tr><th>#</th><th>Category</th><th>Type</th><th>Transactions</th><th>Amount</th><th>% of Total</th></tr></thead>
      <tbody>
        ${sortedCategories.map(([cat, data], i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${cat}</td>
            <td>${getExpenseType(cat) === 'necessary' ? 'Necessary' : 'Luxury'}</td>
            <td>${data.count}</td>
            <td>₹${data.total.toFixed(2)}</td>
            <td>${totalSpent > 0 ? ((data.total / totalSpent) * 100).toFixed(1) : 0}%</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>All Transactions</h2>
    <table>
      <thead><tr><th>#</th><th>Date</th><th>Time</th><th>Category</th><th>Description</th><th>Amount</th></tr></thead>
      <tbody>
        ${sortedExpenses.map((exp, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${format(parseISO(exp.expense_date), 'dd MMM yyyy')}</td>
            <td>${exp.expense_time ? exp.expense_time.substring(0, 5) : '--:--'}</td>
            <td>${exp.category || 'N/A'}</td>
            <td>${exp.description || '-'}</td>
            <td>₹${parseFloat(exp.amount).toFixed(2)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="footer">
    <p>Smart Expense Behavior Analyzer | Confidential — For personal use only</p>
  </div>
</body>
</html>`;

  const printWindow = window.open('', '_blank');
  printWindow.document.write(html);
  printWindow.document.close();
};

// Helper - get split breakdown (reused from above)
const getSplitBreakdown = (filteredExpenses) => getSpendingBreakdown(filteredExpenses);
