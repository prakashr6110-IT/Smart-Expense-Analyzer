import { useState, useMemo } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { getSpendingBreakdown, getExpenseType } from '../utils/categoryClassification';
import { calculateFinancialScore, getScoreRating } from '../utils/prediction';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Layout/Sidebar';
import TopBar from '../components/Layout/TopBar';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import {
  BarChart3, Calendar, Shield, Gem, Award, TrendingUp, TrendingDown,
  Clock, Coffee, ShoppingCart, AlertTriangle, Lightbulb
} from 'lucide-react';
import { format, parseISO, startOfWeek, startOfMonth, startOfYear, eachDayOfInterval, subDays, getHours } from 'date-fns';

const COLORS = ['#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#ef4444', '#10b981', '#06b6d4', '#6b7280'];
const SPLIT_COLORS = ['#10b981', '#8b5cf6'];

const Analytics = () => {
  const { expenses } = useExpenses();
  const { profile } = useAuth();
  const [period, setPeriod] = useState('monthly');

  const monthlyBudget = profile?.monthly_budget ? parseFloat(profile.monthly_budget) : 10000;

  const getFilteredData = () => {
    const now = new Date();
    let startDate;

    switch (period) {
      case 'weekly':
        startDate = startOfWeek(now, { weekStartsOn: 1 });
        break;
      case 'monthly':
        startDate = startOfMonth(now);
        break;
      case 'yearly':
        startDate = startOfYear(now);
        break;
      default:
        return expenses;
    }

    return expenses.filter(exp => new Date(exp.expense_date) >= startDate);
  };

  const filteredExpenses = getFilteredData();

  const categoryData = useMemo(() => {
    const categoryTotals = {};
    filteredExpenses.forEach(exp => {
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + parseFloat(exp.amount);
    });
    return Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }))
      .sort((a, b) => b.value - a.value);
  }, [filteredExpenses]);

  const splitData = useMemo(() => {
    const breakdown = getSpendingBreakdown(filteredExpenses);
    if (breakdown.total === 0) return [];
    return [
      { name: 'Necessary', value: parseFloat(breakdown.necessary.toFixed(2)) },
      { name: 'Luxury', value: parseFloat(breakdown.luxury.toFixed(2)) },
    ];
  }, [filteredExpenses]);

  const budgetVsActualData = useMemo(() => {
    const total = filteredExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    return [
      { name: 'Budget', value: monthlyBudget, fill: '#3b82f6' },
      { name: 'Spent', value: parseFloat(total.toFixed(2)), fill: total > monthlyBudget ? '#ef4444' : '#10b981' },
      { name: 'Remaining', value: parseFloat(Math.max(0, monthlyBudget - total).toFixed(2)), fill: '#8b5cf6' },
    ];
  }, [filteredExpenses, monthlyBudget]);

  const trendData = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const days = eachDayOfInterval({ start: monthStart, end: now });
    const dailyTotals = {};
    filteredExpenses.forEach(exp => {
      const date = format(parseISO(exp.expense_date), 'MMM dd');
      dailyTotals[date] = (dailyTotals[date] || 0) + parseFloat(exp.amount);
    });
    return days.map(day => {
      const dateStr = format(day, 'MMM dd');
      return { date: dateStr, amount: dailyTotals[dateStr] || 0 };
    });
  }, [filteredExpenses]);

  const breakdown = getSpendingBreakdown(filteredExpenses);
  const financialScore = calculateFinancialScore(expenses, monthlyBudget);
  const scoreRating = getScoreRating(financialScore);
  const insights = useMemo(() => generateAnalyticsInsights(filteredExpenses, expenses, monthlyBudget), [filteredExpenses, expenses, monthlyBudget]);
  const hasData = filteredExpenses.length > 0;

  return (
    <div className="min-h-screen bg-fintech-bg transition-colors duration-300">
      <Sidebar />
      <div className="lg:ml-64">
        <TopBar />
        <main className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-accent-primary/20 flex items-center justify-center">
                <BarChart3 size={24} className="text-accent-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-heading font-bold text-txt-primary">Analytics</h2>
                <p className="text-sm text-txt-muted">Visualize your spending patterns</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 bg-fintech-card rounded-xl p-1 border border-white/5">
              <Calendar size={18} className="text-txt-muted ml-2" />
              {['weekly', 'monthly', 'yearly'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    period === p
                      ? 'bg-accent-primary text-white shadow-lg shadow-accent-primary/30'
                      : 'text-txt-secondary hover:bg-white/5'
                  }`}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {!hasData ? (
            <div className="card text-center py-16">
              <div className="w-20 h-20 bg-fintech-secondary rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                <BarChart3 size={36} className="text-txt-muted" />
              </div>
              <p className="text-txt-secondary text-lg font-medium">Add more expenses to unlock analytics</p>
              <p className="text-sm text-txt-muted mt-2">Your spending insights and charts will appear here</p>
            </div>
          ) : (
            <>
              {/* Financial Health Score Card */}
              <div className="card mb-6 animate-slide-in-up">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 ${
                      financialScore >= 70 ? 'border-accent-success bg-accent-success/10' :
                      financialScore >= 50 ? 'border-accent-warning bg-accent-warning/10' :
                      'border-accent-danger bg-accent-danger/10'
                    }`}>
                      <span className={`text-xl font-bold ${
                        financialScore >= 70 ? 'text-accent-success' :
                        financialScore >= 50 ? 'text-accent-warning' :
                        'text-accent-danger'
                      }`}>
                        {Math.round(financialScore)}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-heading font-bold text-txt-primary flex items-center gap-2">
                        <Award size={20} className="text-accent-primary" />
                        Financial Health Score
                      </h3>
                      <p className={`text-sm font-medium ${
                        financialScore >= 70 ? 'text-accent-success' :
                        financialScore >= 50 ? 'text-accent-warning' :
                        'text-accent-danger'
                      }`}>
                        {scoreRating.emoji} {scoreRating.text}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-txt-muted">Score: {Math.round(financialScore)}/100</p>
                    <div className="w-48 h-3 bg-fintech-secondary rounded-full mt-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          financialScore >= 70 ? 'bg-gradient-to-r from-accent-success to-emerald-400' :
                          financialScore >= 50 ? 'bg-gradient-to-r from-accent-warning to-orange-400' :
                          'bg-gradient-to-r from-accent-danger to-rose-400'
                        }`}
                        style={{ width: `${Math.max(0, Math.min(100, financialScore))}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Spending Quality Banner */}
              {breakdown.total > 0 && (
                <div className="card mb-6 bg-gradient-to-r from-accent-success/5 to-accent-insights/5 border-l-4 border-accent-success animate-slide-in-up">
                  <div className="flex items-center gap-3 mb-2">
                    <Shield size={20} className="text-accent-success" />
                    <Gem size={20} className="text-accent-insights" />
                    <h3 className="text-lg font-heading font-bold text-txt-primary">Spending Quality</h3>
                  </div>
                  <p className="text-txt-secondary">
                    <span className="text-accent-success font-bold">₹{breakdown.necessary.toFixed(0)} ({breakdown.necessaryPct.toFixed(0)}%)</span> was necessary spending and{' '}
                    <span className="text-accent-insights font-bold">₹{breakdown.luxury.toFixed(0)} ({breakdown.luxuryPct.toFixed(0)}%)</span> was luxury spending.
                  </p>
                </div>
              )}

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="card animate-slide-in-up">
                  <h3 className="text-lg font-heading font-bold text-txt-primary mb-4">Category Distribution</h3>
                  {categoryData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `₹${value}`} contentStyle={{ backgroundColor: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#F8FAFC' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyChartState message="No category data available" />
                  )}
                </div>

                <div className="card animate-slide-in-up">
                  <h3 className="text-lg font-heading font-bold text-txt-primary mb-4">Necessary vs Luxury</h3>
                  {splitData.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={240}>
                        <PieChart>
                          <Pie data={splitData} cx="50%" cy="50%" outerRadius={90} dataKey="value">
                            {splitData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={SPLIT_COLORS[index]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `₹${value}`} contentStyle={{ backgroundColor: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#F8FAFC' }} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex justify-center gap-6 mt-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-accent-success" />
                          <span className="text-sm text-txt-muted">Necessary</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-accent-insights" />
                          <span className="text-sm text-txt-muted">Luxury</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <EmptyChartState message="No spending data available" />
                  )}
                </div>
              </div>

              {/* Budget vs Actual (Bar Chart) */}
              <div className="card mb-6 animate-slide-in-up">
                <h3 className="text-lg font-heading font-bold text-txt-primary mb-4">Budget vs Actual Spending</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={budgetVsActualData} barSize={60}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" stroke="#64748B" />
                    <YAxis stroke="#64748B" />
                    <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} contentStyle={{ backgroundColor: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#F8FAFC' }} />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {budgetVsActualData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Monthly Spending Trend (Area Chart) */}
              <div className="card mb-6 animate-slide-in-up">
                <h3 className="text-lg font-heading font-bold text-txt-primary mb-4">Spending Trend</h3>
                {trendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={trendData}>
                      <defs>
                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="date" stroke="#64748B" fontSize={12} />
                      <YAxis stroke="#64748B" />
                      <Tooltip formatter={(value) => `₹${value}`} contentStyle={{ backgroundColor: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#F8FAFC' }} />
                      <Area type="monotone" dataKey="amount" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorAmount)" name="Daily Spending" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChartState message="Add expenses to see spending trends" />
                )}
              </div>

              {/* Insights Section */}
              {insights.length > 0 && (
                <div className="card animate-slide-in-up">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-accent-warning/20 flex items-center justify-center">
                      <Lightbulb size={20} className="text-accent-warning" />
                    </div>
                    <h3 className="text-lg font-heading font-bold text-txt-primary">Spending Insights</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {insights.map((insight, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-xl border transition-all duration-300 hover:scale-[1.01] ${getInsightStyles(insight.type)}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${getInsightIconBg(insight.type)}`}>
                            <insight.icon size={18} className={getInsightIconColor(insight.type)} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-txt-primary">{insight.title}</p>
                            <p className="text-xs text-txt-muted mt-1">{insight.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

const EmptyChartState = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-12">
    <BarChart3 size={40} className="text-txt-muted mb-3" />
    <p className="text-txt-muted text-sm">{message}</p>
  </div>
);

const getInsightStyles = (type) => {
  switch (type) {
    case 'warning': return 'bg-accent-warning/5 border-accent-warning/20 hover:border-accent-warning/40';
    case 'success': return 'bg-accent-success/5 border-accent-success/20 hover:border-accent-success/40';
    case 'info': return 'bg-accent-primary/5 border-accent-primary/20 hover:border-accent-primary/40';
    case 'trend': return 'bg-accent-insights/5 border-accent-insights/20 hover:border-accent-insights/40';
    default: return 'bg-fintech-secondary border-white/10 hover:border-white/20';
  }
};

const getInsightIconBg = (type) => {
  switch (type) {
    case 'warning': return 'bg-accent-warning/20';
    case 'success': return 'bg-accent-success/20';
    case 'info': return 'bg-accent-primary/20';
    case 'trend': return 'bg-accent-insights/20';
    default: return 'bg-white/10';
  }
};

const getInsightIconColor = (type) => {
  switch (type) {
    case 'warning': return 'text-accent-warning';
    case 'success': return 'text-accent-success';
    case 'info': return 'text-accent-primary';
    case 'trend': return 'text-accent-insights';
    default: return 'text-txt-muted';
  }
};

const generateAnalyticsInsights = (filteredExpenses, allExpenses, monthlyBudget) => {
  const insights = [];
  if (filteredExpenses.length < 2) return insights;

  const total = filteredExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

  const categoryTotals = {};
  filteredExpenses.forEach(exp => {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + parseFloat(exp.amount);
  });
  const topCat = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
  if (topCat && total > 0) {
    const pct = ((topCat[1] / total) * 100).toFixed(0);
    insights.push({
      type: 'info', icon: ShoppingCart,
      title: `${topCat[0]} is your top category`,
      description: `${topCat[0]} contributes ${pct}% of total spending (₹${topCat[1].toFixed(0)})`,
    });
  }

  const breakdown = getSpendingBreakdown(filteredExpenses);
  if (breakdown.luxuryPct > 30) {
    insights.push({
      type: 'warning', icon: AlertTriangle,
      title: 'High luxury spending detected',
      description: `${breakdown.luxuryPct.toFixed(0)}% of your spending is on luxury items. Consider reducing non-essential purchases.`,
    });
  } else if (breakdown.luxuryPct > 0 && breakdown.luxuryPct < 15) {
    insights.push({
      type: 'success', icon: Shield,
      title: 'Smart spending pattern',
      description: `Luxury spending is only ${breakdown.luxuryPct.toFixed(0)}% — well controlled!`,
    });
  }

  const hourTotals = {};
  filteredExpenses.forEach(exp => {
    if (exp.expense_time) {
      const hour = parseInt(exp.expense_time.split(':')[0]);
      hourTotals[hour] = (hourTotals[hour] || 0) + parseFloat(exp.amount);
    }
  });
  const peakHour = Object.entries(hourTotals).sort((a, b) => b[1] - a[1])[0];
  if (peakHour) {
    const h = parseInt(peakHour[0]);
    const timeLabel = h >= 18 ? 'evenings (6 PM - 12 AM)' : h >= 12 ? 'afternoons (12 PM - 6 PM)' : 'mornings (6 AM - 12 PM)';
    insights.push({
      type: 'info', icon: Clock,
      title: `Peak spending during ${timeLabel}`,
      description: `You spend most frequently around ${h}:00. Consider setting spending limits for this time.`,
    });
  }

  let weekendTotal = 0, weekdayTotal = 0, weekendCount = 0, weekdayCount = 0;
  filteredExpenses.forEach(exp => {
    const day = new Date(exp.expense_date).getDay();
    if (day === 0 || day === 6) { weekendTotal += parseFloat(exp.amount); weekendCount++; }
    else { weekdayTotal += parseFloat(exp.amount); weekdayCount++; }
  });
  if (weekendCount > 0 && weekdayCount > 0) {
    const weekendAvg = weekendTotal / weekendCount;
    const weekdayAvg = weekdayTotal / weekdayCount;
    if (weekendAvg > weekdayAvg * 1.3) {
      insights.push({
        type: 'warning', icon: Calendar,
        title: 'Weekend spending is higher',
        description: `Average weekend spending (₹${weekendAvg.toFixed(0)}) is ${(((weekendAvg - weekdayAvg) / weekdayAvg) * 100).toFixed(0)}% higher than weekdays (₹${weekdayAvg.toFixed(0)}).`,
      });
    }
  }

  const budgetUsedPct = monthlyBudget > 0 ? (total / monthlyBudget) * 100 : 0;
  if (budgetUsedPct > 80 && budgetUsedPct <= 100) {
    insights.push({
      type: 'warning', icon: TrendingUp,
      title: 'Approaching budget limit',
      description: `You've used ${budgetUsedPct.toFixed(0)}% of your monthly budget. ₹${(monthlyBudget - total).toFixed(0)} remaining.`,
    });
  } else if (budgetUsedPct > 100) {
    insights.push({
      type: 'warning', icon: TrendingUp,
      title: 'Budget exceeded!',
      description: `You've exceeded your budget by ₹${(total - monthlyBudget).toFixed(0)} (${(budgetUsedPct - 100).toFixed(0)}% over).`,
    });
  }

  return insights.slice(0, 6);
};

export default Analytics;
