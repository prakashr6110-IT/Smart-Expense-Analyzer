import { useState, useMemo } from 'react';
import { format, parseISO, isWithinInterval, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';
import { Search, Filter, SortAsc, SortDesc, Calendar, IndianRupee, Tag, X, ChevronDown, Trash2, Eye } from 'lucide-react';
import { getExpenseType } from '../../utils/categoryClassification';

const ExpenseManager = ({ expenses, onDelete }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ category: 'all', expenseType: 'all', dateRange: 'all', minAmount: '', maxAmount: '' });
  const [sortBy, setSortBy] = useState('latest');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const categories = useMemo(() => {
    const cats = new Set(expenses.map(exp => exp.category));
    return ['all', ...Array.from(cats).sort()];
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    let result = [...expenses];
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(exp => (exp.description || '').toLowerCase().includes(query) || (exp.category || '').toLowerCase().includes(query) || exp.amount.toString().includes(query));
    }
    if (filters.category !== 'all') result = result.filter(exp => exp.category === filters.category);
    if (filters.expenseType !== 'all') result = result.filter(exp => { const type = exp.expense_type || getExpenseType(exp.category); return type === filters.expenseType; });
    const now = new Date();
    if (filters.dateRange === 'week') { const start = startOfWeek(now, { weekStartsOn: 1 }); const end = endOfWeek(now, { weekStartsOn: 1 }); result = result.filter(exp => { const date = parseISO(exp.expense_date); return isWithinInterval(date, { start, end }); }); }
    else if (filters.dateRange === 'month') { const start = startOfMonth(now); const end = endOfMonth(now); result = result.filter(exp => { const date = parseISO(exp.expense_date); return isWithinInterval(date, { start, end }); }); }
    else if (filters.dateRange === 'last30') { const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); result = result.filter(exp => { const date = parseISO(exp.expense_date); return date >= start && date <= now; }); }
    if (filters.minAmount !== '') result = result.filter(exp => parseFloat(exp.amount) >= parseFloat(filters.minAmount));
    if (filters.maxAmount !== '') result = result.filter(exp => parseFloat(exp.amount) <= parseFloat(filters.maxAmount));
    switch (sortBy) {
      case 'latest': result.sort((a, b) => new Date(b.expense_date) - new Date(a.expense_date)); break;
      case 'oldest': result.sort((a, b) => new Date(a.expense_date) - new Date(b.expense_date)); break;
      case 'highest': result.sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount)); break;
      case 'lowest': result.sort((a, b) => parseFloat(a.amount) - parseFloat(b.amount)); break;
    }
    return result;
  }, [expenses, searchQuery, filters, sortBy]);

  const clearFilters = () => { setFilters({ category: 'all', expenseType: 'all', dateRange: 'all', minAmount: '', maxAmount: '' }); setSearchQuery(''); };
  const hasActiveFilters = filters.category !== 'all' || filters.expenseType !== 'all' || filters.dateRange !== 'all' || filters.minAmount !== '' || filters.maxAmount !== '';

  const getCategoryColor = (category) => {
    const colors = { Food: 'bg-orange-500', Groceries: 'bg-green-500', Transport: 'bg-blue-500', Transportation: 'bg-blue-500', Entertainment: 'bg-purple-500', Shopping: 'bg-pink-500', Bills: 'bg-red-500', Utilities: 'bg-yellow-500', Health: 'bg-emerald-500', Healthcare: 'bg-emerald-500', Dining: 'bg-amber-500', Other: 'bg-gray-500' };
    return colors[category] || 'bg-gray-400';
  };

  if (expenses.length === 0) {
    return (
      <div className="card">
        <h3 className="text-xl font-heading font-bold text-txt-primary mb-4">Expense Manager</h3>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-fintech-secondary rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
            <IndianRupee size={28} className="text-txt-muted" />
          </div>
          <p className="text-txt-secondary font-medium">No expenses recorded yet</p>
          <p className="text-sm text-txt-muted mt-1">Add your first expense to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-heading font-bold text-txt-primary">Expense Manager</h3>
        <span className="text-sm text-txt-muted">Showing {filteredExpenses.length} of {expenses.length}</span>
      </div>

      <div className="mb-4 space-y-3">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-muted" />
            <input type="text" placeholder="Search by description, category, or amount..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-fintech-secondary border border-white/10 rounded-xl text-txt-primary placeholder-txt-muted focus:ring-2 focus:ring-accent-primary/50 focus:border-transparent transition-all text-sm" />
            {searchQuery && (<button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-txt-muted hover:text-txt-secondary"><X size={16} /></button>)}
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${showFilters || hasActiveFilters ? 'bg-accent-primary text-white shadow-lg shadow-accent-primary/20' : 'bg-fintech-secondary text-txt-secondary hover:bg-white/10 border border-white/10'}`}>
            <Filter size={18} /> Filters {hasActiveFilters && <span className="w-2 h-2 bg-white rounded-full" />}
          </button>
          <div className="relative">
            <button onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex items-center gap-2 px-4 py-2.5 bg-fintech-secondary text-txt-secondary rounded-xl font-medium hover:bg-white/10 border border-white/10 transition-all">
              {sortBy === 'latest' || sortBy === 'highest' ? <SortDesc size={18} /> : <SortAsc size={18} />} Sort
              <ChevronDown size={14} className={`transition-transform ${showSortMenu ? 'rotate-180' : ''}`} />
            </button>
            {showSortMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-fintech-card rounded-xl shadow-xl border border-white/10 z-10 py-1">
                {[{ value: 'latest', label: 'Latest First' }, { value: 'oldest', label: 'Oldest First' }, { value: 'highest', label: 'Highest Amount' }, { value: 'lowest', label: 'Lowest Amount' }].map((option) => (
                  <button key={option.value} onClick={() => { setSortBy(option.value); setShowSortMenu(false); }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${sortBy === option.value ? 'bg-accent-primary/10 text-accent-primary font-medium' : 'text-txt-secondary hover:bg-white/5'}`}>
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="p-4 bg-fintech-secondary/50 rounded-xl border border-white/10 animate-slide-in-down">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {[
                { label: 'Category', value: filters.category, key: 'category', type: 'select', options: categories.map(c => ({ value: c, label: c === 'all' ? 'All Categories' : c })) },
                { label: 'Type', value: filters.expenseType, key: 'expenseType', type: 'select', options: [{ value: 'all', label: 'All Types' }, { value: 'necessary', label: 'Necessary' }, { value: 'luxury', label: 'Luxury' }] },
                { label: 'Date Range', value: filters.dateRange, key: 'dateRange', type: 'select', options: [{ value: 'all', label: 'All Time' }, { value: 'week', label: 'This Week' }, { value: 'month', label: 'This Month' }, { value: 'last30', label: 'Last 30 Days' }] },
                { label: 'Min Amount', value: filters.minAmount, key: 'minAmount', type: 'number', placeholder: '₹0' },
                { label: 'Max Amount', value: filters.maxAmount, key: 'maxAmount', type: 'number', placeholder: '₹∞' },
              ].map(field => (
                <div key={field.key}>
                  <label className="block text-xs font-medium text-txt-muted mb-1">{field.label}</label>
                  {field.type === 'select' ? (
                    <select value={field.value} onChange={(e) => setFilters({ ...filters, [field.key]: e.target.value })}
                      className="w-full px-3 py-2 bg-fintech-card border border-white/10 rounded-lg text-sm text-txt-primary focus:ring-2 focus:ring-accent-primary/50">
                      {field.options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  ) : (
                    <input type="number" placeholder={field.placeholder} value={field.value}
                      onChange={(e) => setFilters({ ...filters, [field.key]: e.target.value })}
                      className="w-full px-3 py-2 bg-fintech-card border border-white/10 rounded-lg text-sm text-txt-primary focus:ring-2 focus:ring-accent-primary/50" />
                  )}
                </div>
              ))}
            </div>
            {hasActiveFilters && (
              <div className="mt-3 flex justify-end">
                <button onClick={clearFilters} className="flex items-center gap-1 px-3 py-1.5 text-sm text-accent-danger hover:bg-accent-danger/10 rounded-lg transition-colors">
                  <X size={14} /> Clear All Filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {filteredExpenses.length === 0 ? (
        <div className="text-center py-8">
          <Search size={40} className="mx-auto text-txt-muted mb-3" />
          <p className="text-txt-secondary">No expenses match your search</p>
          <p className="text-sm text-txt-muted mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-fintech-card z-10">
              <tr className="border-b border-white/10">
                {['Date', 'Category', 'Type', 'Time', 'Description', 'Amount', 'Action'].map((h, i) => (
                  <th key={h} className={`py-3 px-4 text-sm font-semibold text-txt-muted ${i === 5 ? 'text-right' : i === 6 ? 'text-center' : 'text-left'} ${i >= 2 && i <= 4 ? 'hidden ' + (i === 2 ? 'md:table-cell' : 'lg:table-cell') : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.slice(0, 50).map((expense) => {
                const type = expense.expense_type || getExpenseType(expense.category);
                return (
                  <tr key={expense.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 text-sm text-txt-secondary">{format(parseISO(expense.expense_date), 'MMM dd, yyyy')}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center">
                        <span className={`w-2 h-2 rounded-full ${getCategoryColor(expense.category)} mr-2`} />
                        <span className="text-sm text-txt-secondary">{expense.category}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${type === 'necessary' ? 'bg-accent-success/10 text-accent-success' : 'bg-accent-insights/10 text-accent-insights'}`}>
                        {type === 'necessary' ? 'Necessary' : 'Luxury'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-txt-muted hidden lg:table-cell">{expense.expense_time || '-'}</td>
                    <td className="py-3 px-4 text-sm text-txt-muted hidden lg:table-cell max-w-[200px] truncate">{expense.description || '-'}</td>
                    <td className="py-3 px-4 text-right"><span className="text-sm font-semibold text-txt-primary">₹{parseFloat(expense.amount).toFixed(2)}</span></td>
                    <td className="py-3 px-4 text-center">
                      <button onClick={() => onDelete(expense.id)} className="text-accent-danger hover:text-accent-danger/80 transition-colors p-1 hover:bg-accent-danger/10 rounded-lg" title="Delete expense">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredExpenses.length > 50 && (
            <div className="text-center py-3 text-sm text-txt-muted">Showing 50 of {filteredExpenses.length} filtered expenses.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExpenseManager;
