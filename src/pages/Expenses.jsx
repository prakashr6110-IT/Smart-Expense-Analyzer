import { useAuth } from '../context/AuthContext';
import { useExpenses } from '../context/ExpenseContext';
import Sidebar from '../components/Layout/Sidebar';
import TopBar from '../components/Layout/TopBar';
import ExpenseManager from '../components/Dashboard/ExpenseManager';

const Expenses = () => {
  const { profile } = useAuth();
  const { expenses, deleteExpense, loading } = useExpenses();

  const handleDeleteExpense = async (expenseId) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await deleteExpense(expenseId);
      } catch (error) {
        console.error('Error deleting expense:', error);
        alert('Failed to delete expense');
      }
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
        <main className="p-4 md:p-6 animate-fade-in">
          <div className="mb-6">
            <h2 className="text-2xl font-heading font-bold text-txt-primary">All Expenses</h2>
            <p className="text-sm text-txt-muted mt-1">Search, filter, and manage all your transactions</p>
          </div>
          <ExpenseManager expenses={expenses} onDelete={handleDeleteExpense} />
        </main>
      </div>
    </div>
  );
};

export default Expenses;
