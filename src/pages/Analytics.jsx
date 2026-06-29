import { useState, useMemo } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { getSpendingBreakdown, getExpenseType } from '../utils/categoryClassification';
import { calculateFinancialScore, getScoreRating } from '../utils/prediction';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Layout/Navbar';
import Card from '../components/UI/Card';
import InsightCard from '../components/UI/InsightCard';
import EmptyState from '../components/UI/EmptyState';
import Footer from '../components/UI/Footer';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import {
  BarChart3, Calendar, Shield, Gem, Award, TrendingUp, TrendingDown,
  Clock, Coffee, ShoppingCart, AlertTriangle, Lightbulb
} from 'lucide-react';
import { format, parseISO, startOfWeek, startOfMonth, startOfYear, eachDayOfInterval, subDays, getHours } from 'date-fns';

const COLORS = ['#00C9A7', '#7C6FFF', '#f59e0b', '#ec4899', '#ef4444', '#10b981', '#06b6d4', '#6b7280'];
const SPLIT_COLORS = ['#00C9A7', '#7C6FFF'];

// Dark tooltip style for charts
const TOOLTIP_STYLE = {
  backgroundColor: '#111827',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '12px',
  color: '#F8FAFC',
  boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
};
const AXIS_COLOR = '#64748B';
const GRID_COLOR = 'rgba(255,255,255,0.05)';

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
    <div className="min-h-screen bg-slate-100 dark:bg-fintech-bg transition-colors duration-300 flex flex-col">
      <Navbar />
      <main className="p-4 md:p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-accent-primary/20 flex items-center justify-center">
                <BarChart3 size={24} className="text-accent-primary" />
              </div>
              <div>
                <h2 className="text-h1 font-heading text-slate-800 dark:text-txt-primary">Analytics</h2>
                <p className="text-sm text-slate-400 dark:text-txt-muted">Visualize your spending patterns</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 bg-slate-100 dark:bg-fintech-card rounded-xl p-1 border border-slate-200 dark:border-white/5">
              <Calendar size={18} className="text-slate-400 dark:text-txt-muted ml-2" />
              {['weekly', 'monthly', 'yearly'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    period === p
                      ? 'bg-accent-primary text-white shadow-lg shadow-accent-primary/30'
                      : 'text-slate-600 dark:text-txt-secondary hover:bg-slate-200 dark:hover:bg-white/5'
                  }`}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {!hasData ? (
            <Card className="text-center py-16">
              <EmptyState
                heading="No analytics yet"
                subheading="Add more expenses to unlock spending insights and visualizations"
              />
            </Card>
          ) : (
            <>
              {/* Financial Health Score Card */}
              <Card className="mb-6 animate-slide-in-up">
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
                      <h3 className="text-lg font-heading font-bold text-slate-800 dark:text-txt-primary flex items-center gap-2">
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
                    <p className="text-sm text-slate-400 dark:text-txt-muted">Score: {Math.round(financialScore)}/100</p>
                    <div className="w-48 h-3 bg-slate-200 dark:bg-fintech-secondary rounded-full mt-2 overflow-hidden">
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
              </Card>

              {/* Spending Quality Banner */}
              {breakdown.total > 0 && (
                <Card className="mb-6 bg-gradient-to-r from-accent-success/5 to-accent-insights/5 border-l-4 border-accent-success animate-slide-in-up" noBorder>
                  <div className="flex items-center gap-3 mb-2">
                    <Shield size={20} className="text-accent-success" />
                    <Gem size={20} className="text-accent-insights" />
                    <h3 className="text-lg font-heading font-bold text-slate-800 dark:text-txt-primary">Spending Quality</h3>
                  </div>
                  <p className="text-slate-600 dark:text-txt-secondary">
                    <span className="text-accent-success font-bold">₹{breakdown.necessary.toFixed(0)} ({breakdown.necessaryPct.toFixed(0)}%)</span> was necessary spending and{' '}
                    <span className="text-accent-insights font-bold">₹{breakdown.luxury.toFixed(0)} ({breakdown.luxuryPct.toFixed(0)}%)</span> was luxury spending.
                  </p>
                </Card>
              )}

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <Card className="animate-slide-in-up" hoverable={false}>
                  <h3 className="text-h3 font-heading text-slate-800 dark:text-txt-primary mb-4">Category Distribution</h3>
                  {categoryData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}
                          style={{ fontSize: '12px', fontWeight: 600 }}>
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `₹${value}`} contentStyle={TOOLTIP_STYLE} itemStyle={{ color: '#F8FAFC', fontWeight: 600 }} labelStyle={{ color: '#94A3B8', fontWeight: 600 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyChartState message="No category data available" />
                  )}
                </Card>

                <Card className="animate-slide-in-up" hoverable={false}>
                  <h3 className="text-h3 font-heading text-slate-800 dark:text-txt-primary mb-4">Necessary vs Luxury</h3>
                  {splitData.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={240}>
                        <PieChart>
                          <Pie data={splitData} cx="50%" cy="50%" outerRadius={90} dataKey="value">
                            {splitData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={SPLIT_COLORS[index]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `₹${value}`} contentStyle={TOOLTIP_STYLE} itemStyle={{ color: '#F8FAFC', fontWeight: 600 }} labelStyle={{ color: '#94A3B8', fontWeight: 600 }} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex justify-center gap-6 mt-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-[#00C9A7]" />
                          <span className="text-sm text-slate-500 dark:text-txt-muted font-medium">Necessary</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-[#7C6FFF]" />
                          <span className="text-sm text-slate-500 dark:text-txt-muted font-medium">Luxury</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <EmptyChartState message="No spending data available" />
                  )}
                </Card>
              </div>

              {/* Budget vs Actual (Bar Chart) */}
              <Card className="mb-6 animate-slide-in-up" hoverable={false}>
                <h3 className="text-h3 font-heading text-slate-800 dark:text-txt-primary mb-4">Budget vs Actual Spending</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={budgetVsActualData} barSize={60}>
                    <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                    <XAxis dataKey="name" stroke={AXIS_COLOR} tick={{ fill: AXIS_COLOR, fontSize: 13, fontWeight: 500 }} />
                    <YAxis stroke={AXIS_COLOR} tick={{ fill: AXIS_COLOR, fontSize: 12, fontWeight: 500 }} />
                    <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} contentStyle={TOOLTIP_STYLE} itemStyle={{ color: '#F8FAFC', fontWeight: 600 }} labelStyle={{ color: '#94A3B8', fontWeight: 600 }} />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]} animationDuration={400}>
                      {budgetVsActualData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              {/* Monthly Spending Trend (Area Chart) */}
              <Card className="mb-6 animate-slide-in-up" hoverable={false}>
                <h3 className="text-h3 font-heading text-slate-800 dark:text-txt-primary mb-4">Spending Trend</h3>
                {trendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={trendData}>
                      <defs>
                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#7C6FFF" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#7C6FFF" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                      <XAxis dataKey="date" stroke={AXIS_COLOR} fontSize={12} tick={{ fill: AXIS_COLOR, fontWeight: 500 }} />
                      <YAxis stroke={AXIS_COLOR} tick={{ fill: AXIS_COLOR, fontSize: 12, fontWeight: 500 }} />
                      <Tooltip formatter={(value) => `₹${value}`} contentStyle={TOOLTIP_STYLE} itemStyle={{ color: '#F8FAFC', fontWeight: 600 }} labelStyle={{ color: '#94A3B8', fontWeight: 600 }} />
                      <Area type="monotone" dataKey="amount" stroke="#7C6FFF" strokeWidth={2} fillOpacity={1} fill="url(#colorAmount)" name="Daily Spending" animationDuration={400} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChartState message="Add expenses to see spending trends" />
                )}
              </Card>

              {/* Insights Section */}
              {insights.length > 0 && (
                <div className="animate-slide-in-up">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-accent-warning/20 flex items-center justify-center">
                      <Lightbulb size={20} className="text-accent-warning" />
                    </div>
                    <h3 className="text-h3 font-heading text-slate-800 dark:text-txt-primary">Spending Insights</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {insights.map((insight, index) => (
                      <InsightCard
                        key={index}
                        title={insight.title}
                        description={insight.description}
                        category={insight.type === 'warning' ? 'warning' : insight.type === 'success' ? 'suggestion' : 'pattern'}
                        icon={insight.icon}
                        delay={index * 80}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
        <Footer />
    </div>
  );
};

const EmptyChartState = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-12">
    <BarChart3 size={40} className="text-slate-500 dark:text-txt-muted mb-3" />
    <p className="text-slate-500 dark:text-txt-muted text-sm">{message}</p>
  </div>
);

const getInsightStyles = (type) => {
  switch (type) {
    case 'warning': return 'bg-accent-warning/5 border-accent-warning/20 hover:border-accent-warning/40';
    case 'success': return 'bg-accent-success/5 border-accent-success/20 hover:border-accent-success/40';
    case 'info': return 'bg-accent-primary/5 border-accent-primary/20 hover:border-accent-primary/40';
    case 'trend': return 'bg-accent-insights/5 border-accent-insights/20 hover:border-accent-insights/40';
    default: return 'bg-slate-200 dark:bg-fintech-secondary border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20';
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
    default: return 'text-slate-400 dark:text-txt-muted';
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
