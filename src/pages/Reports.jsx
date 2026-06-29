import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useExpenses } from '../context/ExpenseContext';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/UI/Footer';
import { generateReport, generateCSV } from '../utils/reportGenerator';
import { calculateFinancialScore, getScoreRating, predictNextMonthExpense, calculateBudgetExhaustionForecast } from '../utils/prediction';
import { getSpendingBreakdown } from '../utils/categoryClassification';
import {
  FileDown, Calendar, TrendingUp, IndianRupee, Download, CheckCircle, AlertCircle,
  BarChart3, Clock, Tag, FileText, FileSpreadsheet, Award, Shield, Gem, Target
} from 'lucide-react';
import { format, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

const REPORT_PERIODS = [
  { id: 'weekly', label: 'Weekly Report', description: "This week's expenses", icon: Clock, color: 'from-accent-primary to-blue-600' },
  { id: 'monthly', label: 'Monthly Report', description: "This month's expenses", icon: Calendar, color: 'from-accent-insights to-purple-600' },
  { id: 'yearly', label: 'Yearly Report', description: "This year's full report", icon: TrendingUp, color: 'from-accent-success to-emerald-600' },
];

const Reports = () => {
  const { user, profile } = useAuth();
  const { expenses, loading } = useExpenses();
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [downloading, setDownloading] = useState(false);
  const [success, setSuccess] = useState('');

  const monthlyBudget = profile?.monthly_budget ? parseFloat(profile.monthly_budget) : 10000;

  const getFilteredStats = (period) => {
    const now = new Date();
    let startDate, endDate;
    switch (period) {
      case 'weekly': startDate = startOfWeek(now, { weekStartsOn: 1 }); endDate = endOfWeek(now, { weekStartsOn: 1 }); break;
      case 'monthly': startDate = startOfMonth(now); endDate = endOfMonth(now); break;
      case 'yearly': startDate = startOfYear(now); endDate = endOfYear(now); break;
      default: startDate = startOfMonth(now); endDate = endOfMonth(now);
    }
    const filtered = expenses.filter(exp => { const expDate = parseISO(exp.expense_date); return expDate >= startDate && expDate <= endDate; });
    const total = filtered.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    const categories = {};
    filtered.forEach(exp => { const cat = exp.category || 'Other'; if (!categories[cat]) categories[cat] = { total: 0, count: 0 }; categories[cat].total += parseFloat(exp.amount); categories[cat].count += 1; });
    const topCategory = Object.entries(categories).sort((a, b) => b[1].total - a[1].total)[0];
    return { total, count: filtered.length, dateRange: `${format(startDate, 'dd MMM yyyy')} - ${format(endDate, 'dd MMM yyyy')}`, topCategory: topCategory ? topCategory[0] : 'No data', topCategoryAmount: topCategory ? topCategory[1].total : 0, categoryCount: Object.keys(categories).length };
  };

  const handleDownloadPDF = async () => {
    setDownloading('pdf');
    try { await generateReport(expenses, selectedPeriod, profile, user?.email); setSuccess('PDF downloaded successfully!'); setTimeout(() => setSuccess(''), 3000); } catch (err) { console.error('Error generating PDF:', err); } finally { setDownloading(false); }
  };

  const handleDownloadCSV = () => {
    try { generateCSV(expenses, selectedPeriod, profile); setSuccess('CSV downloaded successfully!'); setTimeout(() => setSuccess(''), 3000); } catch (err) { console.error('Error generating CSV:', err); }
  };

  const currentStats = getFilteredStats(selectedPeriod);
  const financialScore = calculateFinancialScore(expenses, monthlyBudget);
  const scoreRating = getScoreRating(financialScore);
  const prediction = predictNextMonthExpense(expenses, monthlyBudget);
  const forecast = calculateBudgetExhaustionForecast(expenses, monthlyBudget);
  const breakdown = getSpendingBreakdown(expenses.filter(exp => { const now = new Date(); const expDate = parseISO(exp.expense_date); return expDate >= startOfMonth(now) && expDate <= endOfMonth(now); }));

  if (loading) {
    return (<div className="min-h-screen bg-slate-100 dark:bg-fintech-bg flex items-center justify-center"><p className="text-slate-600 dark:text-txt-secondary">Loading...</p></div>);
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-fintech-bg transition-colors duration-300 flex flex-col">
      <Navbar />
      <main className="p-4 md:p-6 lg:p-8 animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6 animate-slide-in-up">
              <div className="w-12 h-12 rounded-xl bg-accent-primary/20 flex items-center justify-center">
                <FileDown size={24} className="text-accent-primary" />
              </div>
              <div>
                <h2 className="text-h1 font-heading text-slate-800 dark:text-txt-primary">Reports</h2>
                <p className="text-sm text-slate-400 dark:text-txt-muted">Generate professional reports of your expenses</p>
              </div>
            </div>

            {success && (
              <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-accent-success/10 border border-accent-success/20 text-accent-success text-sm animate-slide-in-right">
                <CheckCircle size={20} /> <span className="font-medium">{success}</span>
              </div>
            )}

            {/* Period Selector Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {REPORT_PERIODS.map((period, index) => {
                const stats = getFilteredStats(period.id);
                const isSelected = selectedPeriod === period.id;
                const Icon = period.icon;
                return (
                  <button key={period.id} onClick={() => setSelectedPeriod(period.id)}
                    className={`card text-left transition-all duration-300 animate-slide-in-up ${isSelected ? 'ring-2 ring-accent-primary shadow-lg shadow-accent-primary/10 scale-[1.02]' : 'hover:shadow-lg hover:-translate-y-1'}`}
                    style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${period.color} flex items-center justify-center mb-3`}>
                      <Icon size={24} className="text-white" />
                    </div>
                    <h3 className="text-lg font-heading font-bold text-slate-800 dark:text-txt-primary">{period.label}</h3>
                    <p className="text-sm text-slate-400 dark:text-txt-muted mt-1">{period.description}</p>
                    <div className="mt-4 p-3 rounded-xl bg-slate-200 dark:bg-fintech-secondary border border-slate-200 dark:border-white/5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400 dark:text-txt-muted">Total</span>
                        <span className="text-lg font-bold text-slate-800 dark:text-txt-primary">₹{stats.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-slate-400 dark:text-txt-muted">{stats.count} transactions</span>
                        <span className="text-xs text-slate-400 dark:text-txt-muted">{stats.categoryCount} categories</span>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="mt-3 flex items-center text-accent-primary text-sm font-medium">
                        <CheckCircle size={16} className="mr-1" /> Selected
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Report Preview */}
            <div className="card mb-6 animate-slide-in-up" style={{ animationDelay: '0.3s' }}>
              <h3 className="text-h3 font-heading text-slate-800 dark:text-txt-primary mb-4 flex items-center gap-2">
                <BarChart3 size={20} className="text-accent-primary" /> Report Preview
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {[
                  { icon: Calendar, label: 'Date Range', value: currentStats.dateRange, size: 'text-sm font-semibold' },
                  { icon: IndianRupee, label: 'Total Spending', value: `₹${currentStats.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, size: 'text-lg font-bold' },
                  { icon: Tag, label: 'Top Category', value: currentStats.topCategory, size: 'text-sm font-semibold', extra: currentStats.topCategoryAmount > 0 ? ` (₹${currentStats.topCategoryAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })})` : '' },
                  { icon: TrendingUp, label: 'Transactions', value: `${currentStats.count} expenses`, size: 'text-sm font-semibold' },
                ].map((item, i) => (
                  <div key={i} className="bg-slate-200 dark:bg-fintech-secondary rounded-xl p-3 border border-slate-200 dark:border-white/5">
                    <div className="flex items-center text-slate-400 dark:text-txt-muted text-xs mb-1 gap-1">
                      <item.icon size={12} /> {item.label}
                    </div>
                    <p className={`${item.size} text-slate-800 dark:text-txt-primary`}>{item.value}{item.extra && <span className="text-xs text-slate-400 dark:text-txt-muted ml-1">{item.extra}</span>}</p>
                  </div>
                ))}
              </div>

              {/* Financial Health Score */}
              <div className="bg-gradient-to-r from-accent-primary/10 to-accent-insights/10 rounded-xl p-4 mb-4 border border-accent-primary/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Award size={20} className="text-accent-primary" />
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-txt-primary">Financial Health Score</p>
                      <p className={`text-xs font-medium ${financialScore >= 70 ? 'text-accent-success' : financialScore >= 50 ? 'text-accent-warning' : 'text-accent-danger'}`}>
                        {scoreRating.emoji} {scoreRating.text}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-800 dark:text-txt-primary">{Math.round(financialScore)}</p>
                    <p className="text-xs text-slate-400 dark:text-txt-muted">/ 100</p>
                  </div>
                </div>
              </div>

              {/* Spending Quality */}
              {breakdown.total > 0 && (
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-accent-success/5 rounded-xl p-3 border-l-4 border-accent-success">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield size={14} className="text-accent-success" />
                      <span className="text-xs font-medium text-accent-success">Necessary</span>
                    </div>
                    <p className="text-lg font-bold text-slate-800 dark:text-txt-primary">₹{breakdown.necessary.toFixed(0)}</p>
                    <p className="text-xs text-slate-400 dark:text-txt-muted">{breakdown.necessaryPct.toFixed(1)}%</p>
                  </div>
                  <div className="bg-accent-insights/5 rounded-xl p-3 border-l-4 border-accent-insights">
                    <div className="flex items-center gap-2 mb-1">
                      <Gem size={14} className="text-accent-insights" />
                      <span className="text-xs font-medium text-accent-insights">Luxury</span>
                    </div>
                    <p className="text-lg font-bold text-slate-800 dark:text-txt-primary">₹{breakdown.luxury.toFixed(0)}</p>
                    <p className="text-xs text-slate-400 dark:text-txt-muted">{breakdown.luxuryPct.toFixed(1)}%</p>
                  </div>
                </div>
              )}

              {/* Budget progress */}
              {profile?.monthly_budget > 0 && selectedPeriod === 'monthly' && (
                <div className="bg-accent-primary/5 rounded-xl p-4 mb-4 border border-accent-primary/20">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-accent-primary">Budget Usage</span>
                    <span className="text-sm font-bold text-accent-primary">{((currentStats.total / profile.monthly_budget) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-fintech-secondary rounded-full h-3">
                    <div className={`h-3 rounded-full transition-all duration-500 ${
                      (currentStats.total / profile.monthly_budget) * 100 > 100 ? 'bg-accent-danger' :
                      (currentStats.total / profile.monthly_budget) * 100 > 80 ? 'bg-accent-warning' : 'bg-accent-success'
                    }`} style={{ width: `${Math.min(100, (currentStats.total / profile.monthly_budget) * 100)}%` }} />
                  </div>
                  <p className="text-xs text-slate-400 dark:text-txt-muted mt-2">
                    ₹{currentStats.total.toLocaleString('en-IN')} of ₹{profile.monthly_budget.toLocaleString('en-IN')} budget used
                  </p>
                </div>
              )}

              {/* Prediction Summary */}
              {prediction && (
                <div className="bg-gradient-to-r from-accent-insights/10 to-accent-prediction/10 rounded-xl p-4 border border-accent-insights/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Target size={16} className="text-accent-insights" />
                    <span className="text-sm font-bold text-slate-800 dark:text-txt-primary">Prediction Summary</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-xs text-slate-400 dark:text-txt-muted">Predicted Next Month</p>
                      <p className="text-sm font-bold text-slate-800 dark:text-txt-primary">₹{prediction.predicted_amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 dark:text-txt-muted">Confidence</p>
                      <p className="text-sm font-bold text-slate-800 dark:text-txt-primary">{prediction.confidence.toFixed(0)}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 dark:text-txt-muted">Risk Level</p>
                      <p className={`text-sm font-bold ${
                        forecast.riskLevel === 'critical' ? 'text-accent-danger' :
                        forecast.riskLevel === 'high' ? 'text-accent-warning' :
                        forecast.riskLevel === 'medium' ? 'text-accent-warning' : 'text-accent-success'
                      }`}>
                        {forecast.riskLevel.charAt(0).toUpperCase() + forecast.riskLevel.slice(1)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Export Buttons */}
            <div className="space-y-3 animate-slide-in-up" style={{ animationDelay: '0.4s' }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button onClick={handleDownloadPDF} disabled={downloading === 'pdf' || expenses.length === 0}
                  className="btn-primary flex items-center justify-center gap-2 py-3 disabled:opacity-50 disabled:cursor-not-allowed">
                  {downloading === 'pdf' ? (
                    <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generating...</>
                  ) : (
                    <><FileDown size={20} /> Export PDF</>
                  )}
                </button>
                <button onClick={handleDownloadCSV} disabled={expenses.length === 0}
                  className="flex items-center justify-center gap-2 py-3 bg-accent-success hover:bg-accent-success/80 disabled:bg-accent-success/40 text-white rounded-xl font-medium transition-all disabled:cursor-not-allowed shadow-lg shadow-accent-success/20">
                  <FileSpreadsheet size={20} /> Export CSV
                </button>
              </div>

              {expenses.length === 0 && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-accent-warning/10 border border-accent-warning/20 text-accent-warning text-sm">
                  <AlertCircle size={20} /> <span>No expenses to generate a report. Add some expenses first!</span>
                </div>
              )}

              <p className="text-center text-xs text-slate-400 dark:text-txt-muted mt-2">
                PDF includes summary, category breakdown, budget analysis, health score, predictions, and all transactions
              </p>
            </div>
      </main>
      <Footer />
    </div>
  );
};

export default Reports;
