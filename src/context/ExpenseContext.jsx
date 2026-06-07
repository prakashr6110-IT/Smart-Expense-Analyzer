import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabase';
import { analyzeBehavior } from '../utils/behaviorAnalysis';
import { predictNextMonthExpense } from '../utils/prediction';
import { generateAlerts } from '../utils/alertGenerator';
import { getExpenseType } from '../utils/categoryClassification';

const ExpenseContext = createContext({});

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within ExpenseProvider');
  }
  return context;
};

export const ExpenseProvider = ({ children, userId, profile }) => {
  const [expenses, setExpenses] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [insights, setInsights] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchExpenses = useCallback(async (silent = false) => {
    if (!userId) return;

    if (!silent) setLoading(true);
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', userId)
        .order('expense_date', { ascending: false });

      if (error) throw error;
      const enriched = (data || []).map(exp => ({
        ...exp,
        expense_type: exp.expense_type || getExpenseType(exp.category),
      }));
      setExpenses(enriched);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [userId]);

  const fetchAlerts = useCallback(async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  }, [userId]);

  const fetchInsights = useCallback(async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('insights')
        .select('*')
        .eq('user_id', userId)
        .order('generated_at', { ascending: false });

      if (error) throw error;
      setInsights(data || []);
    } catch (error) {
      console.error('Error fetching insights:', error);
    }
  }, [userId]);

  const fetchPredictions = useCallback(async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('predictions')
        .select('*')
        .eq('user_id', userId)
        .order('prediction_month', { ascending: false });

      if (error) throw error;
      setPredictions(data || []);
    } catch (error) {
      console.error('Error fetching predictions:', error);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchExpenses();
      fetchAlerts();
      fetchInsights();
      fetchPredictions();
    }
  }, [userId, fetchExpenses, fetchAlerts, fetchInsights, fetchPredictions]);

  // Helper: Run behavior analysis, generate alerts, and update predictions
  const runAnalysis = async (uid, prof, currentAlerts) => {
    const { data: allExpenses } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', uid);

    if (!allExpenses) return;

    // Enrich fetched expenses with expense_type for analysis
    const enrichedExpenses = allExpenses.map(exp => ({
      ...exp,
      expense_type: exp.expense_type || getExpenseType(exp.category),
    }));

    const monthlyBudget = prof?.monthly_budget ? parseFloat(prof.monthly_budget) : 10000;

    const newInsights = analyzeBehavior(enrichedExpenses);
    const newAlerts = generateAlerts(enrichedExpenses, monthlyBudget, currentAlerts);

    if (newInsights.length > 0) {
      await supabase
        .from('insights')
        .insert(newInsights.map(insight => ({ user_id: uid, ...insight })));
      fetchInsights();
    }

    if (newAlerts.length > 0) {
      await supabase
        .from('alerts')
        .insert(newAlerts.map(alert => ({ user_id: uid, ...alert })));
      fetchAlerts();
    }

    // Update prediction - gracefully handle missing columns
    const prediction = predictNextMonthExpense(enrichedExpenses, monthlyBudget);
    if (prediction) {
      const predInsert = {
        user_id: uid,
        predicted_amount: prediction.predicted_amount,
        prediction_month: prediction.prediction_month,
        confidence: prediction.confidence,
      };
      // Try with new columns first, fall back to basic insert
      try {
        const { error: predError } = await supabase
          .from('predictions')
          .insert([{
            ...predInsert,
            predicted_necessary: prediction.predicted_necessary || null,
            predicted_luxury: prediction.predicted_luxury || null,
            financial_score: prediction.financial_score || null,
          }]);
        if (predError && (predError.message.includes('predicted_necessary') || predError.message.includes('predicted_luxury') || predError.message.includes('financial_score') || predError.message.includes('schema cache'))) {
          await supabase.from('predictions').insert([predInsert]);
        }
      } catch {
        try { await supabase.from('predictions').insert([predInsert]); } catch {}
      }
      await fetchPredictions();
    }
  };

  const addExpense = async (expenseData) => {
    if (!userId) throw new Error('No user logged in');

    const expenseType = expenseData.expense_type || getExpenseType(expenseData.category);
    const expenseInsert = {
      user_id: userId,
      amount: expenseData.amount,
      category: expenseData.category,
      expense_date: expenseData.expense_date,
      expense_time: expenseData.expense_time,
      description: expenseData.description,
    };

    const { data, error } = await supabase
      .from('expenses')
      .insert([{ ...expenseInsert, expense_type: expenseType }])
      .select()
      .single();

    // Retry without expense_type if column doesn't exist
    if (error && (error.message.includes('expense_type') || error.message.includes('schema cache'))) {
      const { data: retryData, error: retryError } = await supabase
        .from('expenses')
        .insert([expenseInsert])
        .select()
        .single();
      if (retryError) throw retryError;
      const enrichedResult = { ...retryData, expense_type: expenseType };
      // Optimistic add to local state
      setExpenses(prev => [enrichedResult, ...prev]);
      // Silent background refetch + analysis
      setTimeout(() => {
        fetchExpenses(true);
        runAnalysis(userId, profile, alerts);
      }, 0);
      return enrichedResult;
    }

    if (error) throw error;

    const enrichedData = { ...data, expense_type: expenseType };

    // Optimistic add to local state instantly
    setExpenses(prev => [enrichedData, ...prev]);

    // Background refetch + analysis (non-blocking)
    setTimeout(() => {
      fetchExpenses(true);
      runAnalysis(userId, profile, alerts);
    }, 0);

    return enrichedData;
  };

  const deleteExpense = async (expenseId) => {
    // Optimistic: remove from local state immediately
    setExpenses(prev => prev.filter(e => e.id !== expenseId));

    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', expenseId);

    if (error) {
      // Revert on error
      fetchExpenses(true);
      throw error;
    }
    // Silent background refetch to stay in sync
    fetchExpenses(true);
  };

  const markAlertAsRead = async (alertId) => {
    // Optimistic: update locally instantly
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, is_read: true } : a));

    const { error } = await supabase
      .from('alerts')
      .update({ is_read: true })
      .eq('id', alertId);

    if (error) {
      fetchAlerts();
      throw error;
    }
  };

  const markAllAlertsAsRead = async () => {
    // Optimistic: mark all unread as read locally
    setAlerts(prev => prev.map(a => ({ ...a, is_read: true })));

    const { error } = await supabase
      .from('alerts')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      fetchAlerts();
      throw error;
    }
  };

  const deleteAlert = async (alertId) => {
    // Optimistic: remove from local state immediately
    setAlerts(prev => prev.filter(a => a.id !== alertId));

    const { error } = await supabase
      .from('alerts')
      .delete()
      .eq('id', alertId);

    if (error) {
      fetchAlerts();
      throw error;
    }
    // Silent background refetch to stay in sync
    fetchAlerts();
  };

  const deleteReadAlerts = async () => {
    const readAlertIds = alerts.filter(a => a.is_read).map(a => a.id);
    if (readAlertIds.length === 0) return;

    // Optimistic: remove read alerts locally
    setAlerts(prev => prev.filter(a => !a.is_read));

    await supabase
      .from('alerts')
      .delete()
      .in('id', readAlertIds);

    // Silent background refetch to stay in sync
    fetchAlerts();
  };

  const getFilteredExpenses = (period) => {
    const now = new Date();
    let startDate;

    switch (period) {
      case 'weekly':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'yearly':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        return expenses;
    }

    return expenses.filter(exp => new Date(exp.expense_date) >= startDate);
  };

  const unreadAlertsCount = alerts.filter(a => !a.is_read).length;

  const value = {
    expenses,
    alerts,
    insights,
    predictions,
    loading,
    addExpense,
    deleteExpense,
    markAlertAsRead,
    markAllAlertsAsRead,
    deleteAlert,
    deleteReadAlerts,
    getFilteredExpenses,
    fetchExpenses,
    unreadAlertsCount,
  };

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  );
};
