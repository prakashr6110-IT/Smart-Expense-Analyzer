import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { ArrowRight, Receipt, IndianRupee } from 'lucide-react';
import { getExpenseType } from '../../utils/categoryClassification';

const CATEGORY_COLORS = {
  Food: 'from-orange-400 to-orange-600',
  Groceries: 'from-green-400 to-green-600',
  Transport: 'from-blue-400 to-blue-600',
  Transportation: 'from-blue-400 to-blue-600',
  Entertainment: 'from-purple-400 to-purple-600',
  Shopping: 'from-pink-400 to-pink-600',
  Bills: 'from-red-400 to-red-600',
  Utilities: 'from-yellow-400 to-yellow-600',
  Health: 'from-emerald-400 to-emerald-600',
  Healthcare: 'from-emerald-400 to-emerald-600',
  Dining: 'from-amber-400 to-amber-600',
  Rent: 'from-indigo-400 to-indigo-600',
  Other: 'from-gray-400 to-gray-600',
};

const getCategoryGradient = (category) => CATEGORY_COLORS[category] || 'from-gray-400 to-gray-600';

const RecentTransactions = ({ expenses }) => {
  // Sort by date descending, take latest 5
  const sorted = [...expenses].sort((a, b) => new Date(b.expense_date) - new Date(a.expense_date));
  const recent = sorted.slice(0, 5);

  if (expenses.length === 0) {
    return (
      <div className="card mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-accent-primary/20 flex items-center justify-center">
            <Receipt size={20} className="text-accent-primary" />
          </div>
          <h3 className="text-lg font-heading font-bold text-txt-primary">Recent Transactions</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-16 h-16 bg-fintech-secondary rounded-2xl flex items-center justify-center mb-4 border border-white/5">
            <Receipt size={28} className="text-txt-muted" />
          </div>
          <p className="text-txt-secondary font-medium">No transactions yet</p>
          <p className="text-sm text-txt-muted mt-1">Add your first expense to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card mb-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-primary/20 flex items-center justify-center">
            <Receipt size={20} className="text-accent-primary" />
          </div>
          <h3 className="text-lg font-heading font-bold text-txt-primary">Recent Transactions</h3>
        </div>
        {expenses.length > 5 && (
          <Link
            to="/expenses"
            className="flex items-center gap-1.5 text-sm font-medium text-accent-primary hover:text-accent-primary/80 transition-colors group bg-accent-primary/10 px-3 py-1.5 rounded-lg border border-accent-primary/20"
          >
            View All
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        )}
      </div>

      <div className="space-y-1">
        {recent.map((expense) => {
          const type = expense.expense_type || getExpenseType(expense.category);
          const gradient = getCategoryGradient(expense.category);
          const initial = (expense.category || 'E')[0].toUpperCase();

          return (
            <div
              key={expense.id}
              className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all duration-200 group border border-transparent hover:border-white/5"
            >
              {/* Category icon */}
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <span className="text-white text-sm font-bold">{initial}</span>
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-txt-primary truncate">
                  {expense.description || expense.category}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-txt-muted">{expense.category}</span>
                  <span className="w-1 h-1 rounded-full bg-txt-muted/50" />
                  <span className="text-xs text-txt-muted">
                    {format(parseISO(expense.expense_date), 'MMM dd')}
                  </span>
                </div>
              </div>

              {/* Amount + type */}
              <div className="flex flex-col items-end flex-shrink-0">
                <span className="text-sm font-bold text-txt-primary">
                  -₹{parseFloat(expense.amount).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </span>
                <span className={`text-[10px] font-semibold mt-0.5 px-1.5 py-0.5 rounded ${
                  type === 'necessary'
                    ? 'text-accent-success bg-accent-success/10'
                    : 'text-accent-insights bg-accent-insights/10'
                }`}>
                  {type === 'necessary' ? 'Essential' : 'Luxury'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentTransactions;
