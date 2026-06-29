import { useState, useEffect } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/UI/Footer';
import SmartInsightsPanel from '../components/Expense/SmartInsightsPanel';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Select from '../components/UI/Select';
import Textarea from '../components/UI/Textarea';
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

  // Check if the selected category is one of the "Other" variants
  const isOtherSelected = formData.category === 'Other (Necessary)' || formData.category === 'Other (Luxury)';

  // Auto-suggest expense_type when category changes
  useEffect(() => {
    if (formData.category === 'Other (Necessary)') {
      setFormData(prev => ({ ...prev, expense_type: 'necessary' }));
    } else if (formData.category === 'Other (Luxury)') {
      setFormData(prev => ({ ...prev, expense_type: 'luxury' }));
    } else {
      const suggested = getExpenseType(formData.category);
      setFormData(prev => ({ ...prev, expense_type: suggested }));
    }
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
    const finalCategory = (formData.category === 'Other (Necessary)' || formData.category === 'Other (Luxury)')
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
  const activeCategory = isOtherSelected
    ? formData.customCategory.trim()
    : formData.category;
  const suggestedType = isOtherSelected
    ? (formData.category === 'Other (Necessary)' ? 'necessary' : 'luxury')
    : getExpenseType(activeCategory);
  const isAutoSuggested = formData.expense_type === suggestedType;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-fintech-bg transition-colors duration-300 flex flex-col">
      <Navbar />

      <main className="p-4 md:p-6 lg:p-8 animate-fade-in pb-24">
          <div>
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-h1 font-heading text-slate-800 dark:text-txt-primary flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-accent-primary to-accent-insights">
                  <PlusCircle size={22} className="text-white" />
                </div>
                Add New Expense
              </h1>
              <p className="text-sm text-slate-400 dark:text-txt-muted mt-2 ml-13">Record an expense and see real-time spending insights</p>
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
                    <h2 className="text-h2 font-heading text-slate-800 dark:text-txt-primary">Expense Details</h2>
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
                    <Input
                      label="Amount (₹) *"
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      placeholder="₹ 0.00"
                      step="0.01"
                      min="0.01"
                      required
                    />

                    <Select
                      label="Category *"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                    >
                      <optgroup label="Necessary Expenses">
                        {ALL_CATEGORIES.filter(cat => getExpenseType(cat) === 'necessary' && cat !== 'Other').map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                        <option value="Other (Necessary)">Other (specify)</option>
                      </optgroup>
                      <optgroup label="Luxury Expenses">
                        {ALL_CATEGORIES.filter(cat => getExpenseType(cat) === 'luxury' && cat !== 'Other').map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                        <option value="Other (Luxury)">Other (specify)</option>
                      </optgroup>
                    </Select>

                    {/* Custom Category Input - Shows when "Other" is selected */}
                    {isOtherSelected && (
                      <div>
                        <Input
                          label="Specify Your Category *"
                          type="text"
                          name="customCategory"
                          value={formData.customCategory}
                          onChange={handleChange}
                          placeholder={formData.category === 'Other (Necessary)'
                            ? 'e.g., Gym, Pet Care, Childcare, Maintenance...'
                            : 'e.g., Concert Tickets, Spa, Hobbies, Gifts...'}
                          required
                          autoFocus
                        />
                        <p className="text-xs text-slate-400 dark:text-txt-muted mt-1">
                          Type your own category name — it will be saved as{' '}
                          <span className="font-medium text-slate-600 dark:text-txt-secondary">
                            {formData.category === 'Other (Necessary)' ? 'Necessary' : 'Luxury'}
                          </span>
                        </p>
                      </div>
                    )}

                    {/* Expense Type Toggle */}
                    <div>
                      <label className="block text-caption font-medium text-slate-500 dark:text-[#94A3B8] mb-1.5">
                        Expense Type *
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleTypeChange('necessary')}
                          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-[10px] font-semibold text-sm border-2 transition-all duration-200 min-h-[44px] ${
                            formData.expense_type === 'necessary'
                              ? 'border-accent-success bg-accent-success/10 text-accent-success shadow-lg shadow-accent-success/10'
                              : 'border-slate-200 dark:border-white/10 bg-slate-200 dark:bg-[#1E293B] text-slate-400 dark:text-txt-muted hover:border-slate-300 dark:hover:border-white/20'
                          }`}
                        >
                          <Shield size={18} />
                          <span>Necessary</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleTypeChange('luxury')}
                          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-[10px] font-semibold text-sm border-2 transition-all duration-200 min-h-[44px] ${
                            formData.expense_type === 'luxury'
                              ? 'border-accent-insights bg-accent-insights/10 text-accent-insights shadow-lg shadow-accent-insights/10'
                              : 'border-slate-200 dark:border-white/10 bg-slate-200 dark:bg-[#1E293B] text-slate-400 dark:text-txt-muted hover:border-slate-300 dark:hover:border-white/20'
                          }`}
                        >
                          <Gem size={18} />
                          <span>Luxury</span>
                        </button>
                      </div>
                      <p className="text-xs text-slate-400 dark:text-txt-muted mt-2">
                        {isAutoSuggested ? (
                          <span>Auto-suggested: <span className="font-medium text-slate-600 dark:text-txt-secondary">{suggestedType === 'necessary' ? 'Necessary' : 'Luxury'}</span> based on category "{activeCategory || formData.category}"</span>
                        ) : (
                          <span>Manually set to <span className="font-medium text-slate-600 dark:text-txt-secondary">{formData.expense_type === 'necessary' ? 'Necessary' : 'Luxury'}</span> (auto-suggestion was: {suggestedType === 'necessary' ? 'Necessary' : 'Luxury'})</span>
                        )}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Date *"
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                      />
                      <Input
                        label="Time of Expense *"
                        type="time"
                        name="time"
                        value={formData.time}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <Textarea
                      label="Description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Optional details about this expense..."
                      rows={3}
                    />

                    <Button
                      type="submit"
                      disabled={loading}
                      fullWidth
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
                    </Button>
                  </form>
                </div>
              </div>

              {/* Right: Smart Insights Panel (2 cols) */}
              <div className="xl:col-span-2">
                <SmartInsightsPanel
                  pendingAmount={formData.amount}
                  pendingCategory={isOtherSelected ? formData.customCategory : formData.category}
                  pendingType={formData.expense_type}
                />
              </div>
            </div>
          </div>
        </main>
        <Footer />
    </div>
  );
};

export default AddExpense;
