import { useState, useEffect } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import Sidebar from '../components/Layout/Sidebar';
import TopBar from '../components/Layout/TopBar';
import SmartInsightsPanel from '../components/Expense/SmartInsightsPanel';
import { PlusCircle, CheckCircle, AlertCircle, Shield, Gem } from 'lucide-react';
import { ALL_CATEGORIES, getExpenseType } from '../utils/categoryClassification';

const AddExpense = () => {
  const { addExpense } = useExpenses();
  const [formData, setFormData] = useState({
    amount: '',
    category: 'Food',
    customCategory: '',
    expense_type: 'necessary',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().split(' ')[0].substring(0, 5),
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Auto-suggest expense_type when category changes
  useEffect(() => {
    const category = formData.category === 'Other'
      ? formData.customCategory.trim()
      : formData.category;
    const suggested = getExpenseType(category);
    setFormData(prev => ({ ...prev, expense_type: suggested }));
  }, [formData.category]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTypeChange = (type) => {
    setFormData(prev => ({ ...prev, expense_type: type }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    // Determine final category
    const finalCategory = formData.category === 'Other'
      ? formData.customCategory.trim() || 'Other'
      : formData.category;

    try {
      const expenseData = {
        amount: parseFloat(formData.amount),
        category: finalCategory,
        expense_type: formData.expense_type,
        expense_date: formData.date,
        expense_time: formData.time,
        description: formData.description,
      };

      await addExpense(expenseData);
      setSuccess(true);

      // Reset form
      setFormData({
        amount: '',
        category: 'Food',
        customCategory: '',
        expense_type: 'necessary',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0].substring(0, 5),
        description: '',
      });

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  // Get the auto-suggested type for current category
  const activeCategory = formData.category === 'Other'
    ? formData.customCategory.trim()
    : formData.category;
  const suggestedType = getExpenseType(activeCategory);
  const isAutoSuggested = formData.expense_type === suggestedType;

  return (
    <div className="min-h-screen bg-fintech-bg transition-colors duration-300">
      <Sidebar />

      <div className="lg:ml-64">
        <TopBar />

        <main className="p-6 animate-fade-in pb-24">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-heading font-bold text-txt-primary flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-accent-primary to-accent-insights">
                  <PlusCircle size={22} className="text-white" />
                </div>
                Add New Expense
              </h1>
              <p className="text-sm text-txt-muted mt-2 ml-13">Record an expense and see real-time spending insights</p>
            </div>

            {/* Two-Column Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
              {/* Left: Expense Form (3 cols) */}
              <div className="xl:col-span-3">
                <div className="card animate-scale-in">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 rounded-xl bg-accent-primary/20 flex items-center justify-center mr-3">
                      <PlusCircle size={20} className="text-accent-primary" />
                    </div>
                    <h2 className="text-xl font-heading font-bold text-txt-primary">Expense Details</h2>
                  </div>

                  {success && (
                    <div className="mb-6 flex items-center gap-2 p-3 rounded-xl bg-accent-success/10 border border-accent-success/20 text-accent-success text-sm">
                      <CheckCircle size={20} />
                      <span className="font-medium">Expense added successfully!</span>
                    </div>
                  )}

                  {error && (
                    <div className="mb-6 flex items-center gap-2 p-3 rounded-xl bg-accent-danger/10 border border-accent-danger/20 text-accent-danger text-sm">
                      <AlertCircle size={20} />
                      <span className="font-medium">{error}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="amount" className="block text-sm font-medium text-txt-secondary mb-2">
                        Amount (₹) *
                      </label>
                      <input
                        type="number"
                        id="amount"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="₹ 0.00"
                        step="0.01"
                        min="0.01"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-txt-secondary mb-2">
                        Category *
                      </label>
                      <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="input-field"
                        required
                      >
                        <optgroup label="Necessary Expenses">
                          {ALL_CATEGORIES.filter(cat => getExpenseType(cat) === 'necessary' && cat !== 'Other').map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </optgroup>
                        <optgroup label="Luxury Expenses">
                          {ALL_CATEGORIES.filter(cat => getExpenseType(cat) === 'luxury' && cat !== 'Other').map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </optgroup>
                        <option value="Other">Other</option>
                      </select>

                      {/* Custom Category Input - Shows when "Other" is selected */}
                      {formData.category === 'Other' && (
                        <div className="mt-3">
                          <label htmlFor="customCategory" className="block text-sm font-medium text-txt-secondary mb-2">
                            Specify Your Category *
                          </label>
                          <input
                            type="text"
                            id="customCategory"
                            name="customCategory"
                            value={formData.customCategory}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="e.g., Gym, Pet Care, Gifts, Donation..."
                            required
                            autoFocus
                          />
                          <p className="text-xs text-txt-muted mt-1">
                            Type your own category name for this expense
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Expense Type Toggle */}
                    <div>
                      <label className="block text-sm font-medium text-txt-secondary mb-2">
                        Expense Type *
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleTypeChange('necessary')}
                          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm border-2 transition-all duration-200 ${
                            formData.expense_type === 'necessary'
                              ? 'border-accent-success bg-accent-success/10 text-accent-success shadow-lg shadow-accent-success/10'
                              : 'border-white/10 bg-fintech-secondary text-txt-muted hover:border-white/20'
                          }`}
                        >
                          <Shield size={18} />
                          <span>Necessary</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleTypeChange('luxury')}
                          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm border-2 transition-all duration-200 ${
                            formData.expense_type === 'luxury'
                              ? 'border-accent-insights bg-accent-insights/10 text-accent-insights shadow-lg shadow-accent-insights/10'
                              : 'border-white/10 bg-fintech-secondary text-txt-muted hover:border-white/20'
                          }`}
                        >
                          <Gem size={18} />
                          <span>Luxury</span>
                        </button>
                      </div>
                      <p className="text-xs text-txt-muted mt-2">
                        {isAutoSuggested ? (
                          <span>Auto-suggested: <span className="font-medium text-txt-secondary">{suggestedType === 'necessary' ? 'Necessary' : 'Luxury'}</span> based on category "{activeCategory || formData.category}"</span>
                        ) : (
                          <span>Manually set to <span className="font-medium text-txt-secondary">{formData.expense_type === 'necessary' ? 'Necessary' : 'Luxury'}</span> (auto-suggestion was: {suggestedType === 'necessary' ? 'Necessary' : 'Luxury'})</span>
                        )}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="date" className="block text-sm font-medium text-txt-secondary mb-2">
                          Date *
                        </label>
                        <input
                          type="date"
                          id="date"
                          name="date"
                          value={formData.date}
                          onChange={handleChange}
                          className="input-field"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="time" className="block text-sm font-medium text-txt-secondary mb-2">
                          Time of Expense *
                        </label>
                        <input
                          type="time"
                          id="time"
                          name="time"
                          value={formData.time}
                          onChange={handleChange}
                          className="input-field"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-txt-secondary mb-2">
                        Description
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="Optional details about this expense..."
                        rows="3"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {loading ? (
                        <>
                          <span>Adding...</span>
                        </>
                      ) : (
                        <>
                          <PlusCircle size={20} className="mr-2" />
                          <span>Add Expense</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>

              {/* Right: Smart Insights Panel (2 cols) */}
              <div className="xl:col-span-2">
                <SmartInsightsPanel
                  pendingAmount={formData.amount}
                  pendingCategory={formData.category === 'Other' ? formData.customCategory : formData.category}
                  pendingType={formData.expense_type}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AddExpense;
