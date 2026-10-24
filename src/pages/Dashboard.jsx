import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useExpenses } from '../context/ExpenseContext';
import DashboardHero from '../components/Dashboard/DashboardHero';
import TopStatsCards from '../components/Dashboard/TopStatsCards';
import FinancialScoreCard from '../components/Dashboard/FinancialScoreCard';
import BehaviorInsights from '../components/Dashboard/BehaviorInsights';
import SpendingStreaks from '../components/Dashboard/SpendingStreaks';
import PredictionCard from '../components/Dashboard/PredictionCard';
import AskFinoraAI from '../components/Dashboard/AskFinoraAI';
import RecentTransactions from '../components/Dashboard/RecentTransactions';
import AlertsSection from '../components/Dashboard/AlertsSection';
import FloatingAddButton from '../components/Common/FloatingAddButton';
import EmptyState from '../components/UI/EmptyState';
import PageLoader from '../components/UI/PageLoader';
import ConfirmModal from '../components/UI/ConfirmModal';
import { Trash2, CheckCircle, PlusCircle, FileDown } from 'lucide-react';
import { format } from 'date-fns';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { expenses, alerts, predictions, deleteExpense, loading } = useExpenses();
  const [clearing, setClearing] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearResult, setClearResult] = useState('');

  const handleClearAll = async () => {
    setClearing(true);
    setClearResult('');
    try {
      let deleted = 0;
      for (const exp of expenses) {
        try {
          await deleteExpense(exp.id);
          deleted++;
        } catch (e) {
          console.error('Failed to delete', exp.id, e);
        }
      }
      setClearResult(`Deleted ${deleted} of ${expenses.length} expenses.`);
      setTimeout(() => setClearResult(''), 5000);
    } finally {
      setClearing(false);
      setShowClearConfirm(false);
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="animate-fade-in">
      {/* Compact greeting + quick actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-h1 font-heading text-slate-800 dark:text-txt-primary">
            Your financial overview
          </h2>
          <p className="text-sm text-slate-400 dark:text-txt-muted mt-1">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/reports"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-brand-teal text-brand-teal text-sm font-medium hover:bg-brand-teal/10 transition-all duration-200"
          >
            <FileDown size={16} />
            <span>Reports</span>
          </Link>
          <Link
            to="/add-expense"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl btn-primary !py-2.5 text-sm"
          >
            <PlusCircle size={16} />
            <span>Add Expense</span>
          </Link>
        </div>
      </div>

      {expenses.length === 0 ? (
        /* Empty State - shown when no expenses */
        <EmptyState
          heading="No expenses yet"
          subheading="Add your first expense and start seeing insights"
          onIconClick={() => navigate('/add-expense')}
        />
      ) : (
        <>
          {/* Budget overview + financial health */}
          <DashboardHero user={user} profile={profile} expenses={expenses} />

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
            <TopStatsCards expenses={expenses} profile={profile} />
            <FinancialScoreCard
              expenses={expenses}
              profile={profile}
              predictions={predictions}
            />
          </div>

          {/* Behavior Insights + Predictions side by side on large screens */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
            <BehaviorInsights expenses={expenses} profile={profile} />
            <PredictionCard expenses={expenses} profile={profile} />
          </div>

          {/* Recent Transactions + AI assistant */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
            <RecentTransactions expenses={expenses} />
            <AskFinoraAI expenses={expenses} profile={profile} />
          </div>

          {/* Spending Streaks */}
          <SpendingStreaks expenses={expenses} profile={profile} />

          {/* Alerts */}
          <AlertsSection alerts={alerts} />

          {/* Clear All */}
          {expenses.length > 0 && (
            <div className="mt-6 mb-6 flex flex-col items-center gap-3">
              {clearResult && (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-success/10 border border-accent-success/20 text-accent-success text-sm animate-slide-in-up">
                  <CheckCircle size={16} />
                  <span className="font-medium">{clearResult}</span>
                </div>
              )}
              <button
                onClick={() => setShowClearConfirm(true)}
                disabled={clearing}
                className="flex items-center gap-2 px-5 py-2.5 bg-accent-danger/10 hover:bg-accent-danger/20 text-accent-danger rounded-xl font-medium transition-all text-sm border border-accent-danger/20"
              >
                <Trash2 size={15} />
                {clearing ? 'Clearing...' : 'Clear All Expenses'}
              </button>
            </div>
          )}
          </>
          )}

      {/* Floating Add Expense Button */}
      <FloatingAddButton />

      {/* Clear All Confirmation */}
      <ConfirmModal
        open={showClearConfirm}
        title="Clear all expenses?"
        message={`This will permanently delete all ${expenses.length} expenses. This cannot be undone.`}
        confirmLabel="Delete All"
        loading={clearing}
        onConfirm={handleClearAll}
        onCancel={() => setShowClearConfirm(false)}
      />
    </div>
  );
};

export default Dashboard;
