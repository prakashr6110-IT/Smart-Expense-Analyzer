import { useAuth } from '../context/AuthContext';
import { useExpenses } from '../context/ExpenseContext';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/UI/Footer';
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
      <div className="min-h-screen bg-slate-100 dark:bg-fintech-bg flex items-center justify-center">
        <p className="text-slate-600 dark:text-txt-secondary">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-fintech-bg transition-colors duration-300 flex flex-col">
      <Navbar />
      <main className="p-4 md:p-6 lg:p-8 animate-fade-in">
          <div className="mb-6">
            <h2 className="text-h1 font-heading text-slate-800 dark:text-txt-primary">All Expenses</h2>
            <p className="text-sm text-slate-400 dark:text-txt-muted mt-1">Search, filter, and manage all your transactions</p>
          </div>
          <ExpenseManager expenses={expenses} onDelete={handleDeleteExpense} />
        </main>
        <Footer />
    </div>
  );
};

export default Expenses;
