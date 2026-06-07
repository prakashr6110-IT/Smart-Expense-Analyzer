import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useExpenses } from '../context/ExpenseContext';
import DashboardHero from '../components/Dashboard/DashboardHero';
import TopStatsCards from '../components/Dashboard/TopStatsCards';
import FinancialScoreCard from '../components/Dashboard/FinancialScoreCard';
import BehaviorInsights from '../components/Dashboard/BehaviorInsights';
import SpendingStreaks from '../components/Dashboard/SpendingStreaks';
import PredictionCard from '../components/Dashboard/PredictionCard';
import RecentTransactions from '../components/Dashboard/RecentTransactions';
import AlertsSection from '../components/Dashboard/AlertsSection';
import FloatingAddButton from '../components/Common/FloatingAddButton';
import Sidebar from '../components/Layout/Sidebar';
import TopBar from '../components/Layout/TopBar';
import { Trash2 } from 'lucide-react';

const Dashboard = () => {
  const { user, profile } = useAuth();
  const { expenses, alerts, predictions, deleteExpense, loading } = useExpenses();
  const [clearing, setClearing] = useState(false);

  const handleClearAll = async () => {
    if (!window.confirm(`Delete ALL ${expenses.length} expenses? This cannot be undone.`)) return;
    setClearing(true);
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
      alert(`Deleted ${deleted} of ${expenses.length} expenses.`);
    } finally {
      setClearing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-fintech-bg flex items-center justify-center">
        <p className="text-txt-secondary">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-fintech-bg transition-colors duration-300">
      <Sidebar />

      <div className="lg:ml-64">
        <TopBar />

        <main className="p-4 md:p-6 pb-24">
          {/* Premium Hero Section */}
          <DashboardHero user={user} profile={profile} expenses={expenses} />

          {/* Spending Breakdown Stats */}
          <TopStatsCards expenses={expenses} profile={profile} />

          {/* Financial Score Card */}
          <FinancialScoreCard
            expenses={expenses}
            profile={profile}
            predictions={predictions}
          />

          {/* Behavior Insights + Predictions side by side on large screens */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
            <BehaviorInsights expenses={expenses} profile={profile} />
            <PredictionCard expenses={expenses} profile={profile} />
          </div>

          {/* Spending Streaks */}
          <SpendingStreaks expenses={expenses} profile={profile} />

          {/* Recent Transactions (latest 5) */}
          <RecentTransactions expenses={expenses} />

          {/* Alerts */}
          <AlertsSection alerts={alerts} />

          {/* Clear All */}
          {expenses.length > 0 && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleClearAll}
                disabled={clearing}
                className="flex items-center gap-2 px-5 py-2.5 bg-accent-danger/10 hover:bg-accent-danger/20 text-accent-danger rounded-xl font-medium transition-all text-sm border border-accent-danger/20"
              >
                <Trash2 size={15} />
                {clearing ? 'Clearing...' : 'Clear All Expenses'}
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Floating Add Expense Button */}
      <FloatingAddButton />
    </div>
  );
};

export default Dashboard;
