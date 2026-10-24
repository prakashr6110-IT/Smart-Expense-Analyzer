import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useExpenses } from '../context/ExpenseContext';
import ExpenseManager from '../components/Dashboard/ExpenseManager';
import PageLoader from '../components/UI/PageLoader';
import ConfirmModal from '../components/UI/ConfirmModal';

const Expenses = () => {
  const { profile } = useAuth();
  const { expenses, deleteExpense, loading } = useExpenses();
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!pendingDeleteId) return;
    setDeleting(true);
    try {
      await deleteExpense(pendingDeleteId);
    } catch (error) {
      console.error('Error deleting expense:', error);
    } finally {
      setDeleting(false);
      setPendingDeleteId(null);
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-h1 font-heading text-slate-800 dark:text-txt-primary">All Expenses</h2>
        <p className="text-sm text-slate-400 dark:text-txt-muted mt-1">Search, filter, and manage all your transactions</p>
      </div>
      <ExpenseManager expenses={expenses} onDelete={(id) => setPendingDeleteId(id)} />

      {/* Delete Confirmation */}
      <ConfirmModal
        open={pendingDeleteId !== null}
        title="Delete this expense?"
        message="This transaction will be permanently removed from your history."
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  );
};

export default Expenses;
