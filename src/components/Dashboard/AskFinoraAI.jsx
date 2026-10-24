import { useState, useRef, useEffect } from 'react';
import { startOfMonth } from 'date-fns';
import { Brain, Send, Sparkles, Loader2, AlertCircle, Wand2 } from 'lucide-react';
import { askOllama } from '../../utils/ollamaClient';

/**
 * AskFinoraAI - Chat panel that asks the Ollama-connected assistant for
 * personalized advice. Sends a compact summary of the user's spending so the
 * model answers based on real data. Talks to /api/ollama/chat (server route),
 * so the API key never reaches the browser.
 */
const AskFinoraAI = ({ expenses = [], profile }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]); // { role, content }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Build a short, grounded context summary from the user's expenses
  const buildContext = () => {
    const budget = profile?.monthly_budget ? parseFloat(profile.monthly_budget) : 0;
    const monthStart = startOfMonth(new Date());
    const monthExpenses = expenses.filter(e => new Date(e.expense_date) >= monthStart);

    const totalSpent = monthExpenses.reduce((s, e) => s + parseFloat(e.amount), 0);
    const luxury = monthExpenses
      .filter(e => e.expense_type === 'luxury')
      .reduce((s, e) => s + parseFloat(e.amount), 0);
    const luxuryPct = totalSpent > 0 ? Math.round((luxury / totalSpent) * 100) : 0;
    const usedPct = budget > 0 ? Math.round((totalSpent / budget) * 100) : 0;

    const catMap = {};
    monthExpenses.forEach(e => { catMap[e.category] = (catMap[e.category] || 0) + parseFloat(e.amount); });
    const top = Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 3)
      .map(([c, v]) => `${c} ₹${Math.round(v)}`);

    return (
      `User's this-month summary — budget: ₹${Math.round(budget) || 'not set'}, ` +
      `spent: ₹${Math.round(totalSpent)} (${usedPct}% of budget), ` +
      `luxury share: ${luxuryPct}%, transactions: ${monthExpenses.length}. ` +
      `Top categories: ${top.length ? top.join(', ') : 'none'}.`
    );
  };

  const systemPrompt =
    'You are Finora, a friendly personal-finance assistant inside an expense-tracking app. ' +
    'Give practical, specific, and concise advice (max ~120 words). Use ₹ for amounts. ' +
    'Here is context about the user: ' + buildContext();

  const suggestionChips = [
    'How can I cut my spending this month?',
    'Is my luxury spending too high?',
    'Am I on track with my budget?',
    'What should I focus on saving?',
  ];

  const send = async (text) => {
    const question = (text ?? input).trim();
    if (!question || loading) return;

    setError('');
    setInput('');
    const nextHistory = [...messages, { role: 'user', content: question }];
    setMessages(nextHistory);
    setLoading(true);

    try {
      // System prompt + rolling conversation
      const payload = [
        { role: 'system', content: systemPrompt },
        ...nextHistory,
      ];
      const reply = await askOllama(payload);
      setMessages([...nextHistory, { role: 'assistant', content: reply || '(no response)' }]);
    } catch (err) {
      setError(err.message || 'Could not reach the AI assistant.');
      // Restore the input so the user can retry
      setInput(question);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card !p-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-200 dark:border-white/5 bg-gradient-to-r from-accent-insights/10 to-accent-primary/5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-insights to-accent-primary flex items-center justify-center shadow-glow-purple">
          <Brain size={18} className="text-white" />
        </div>
        <div className="min-w-0">
          <h3 className="text-lg font-heading font-bold text-slate-800 dark:text-txt-primary flex items-center gap-2">
            Ask Finora AI
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-accent-primary/15 text-accent-primary">
              <Sparkles size={10} /> gemma4
            </span>
          </h3>
          <p className="text-xs text-slate-400 dark:text-txt-muted">AI advice based on your real spending</p>
        </div>
      </div>

      {/* Conversation */}
      <div ref={scrollRef} className="px-6 py-5 max-h-[340px] overflow-y-auto scrollbar-thin space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-6">
            <Wand2 size={28} className="mx-auto text-accent-insights/60 mb-3" />
            <p className="text-sm text-slate-500 dark:text-txt-muted">
              Ask anything about your money and get a grounded answer.
            </p>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              m.role === 'user'
                ? 'bg-gradient-to-r from-accent-primary to-emerald-500 text-white rounded-br-md'
                : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-txt-primary border border-slate-200 dark:border-white/5 rounded-bl-md'
            }`}>
              <p className="whitespace-pre-wrap">{m.content}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-md px-4 py-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 flex items-center gap-2 text-sm text-slate-500 dark:text-txt-muted">
              <Loader2 size={15} className="animate-spin text-accent-primary" />
              Finora is thinking...
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mx-6 mb-3 flex items-start gap-2 p-3 rounded-xl bg-accent-danger/10 border border-accent-danger/20 text-accent-danger text-xs">
          <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Suggestions */}
      {messages.length === 0 && !loading && (
        <div className="px-6 pb-3 flex flex-wrap gap-2">
          {suggestionChips.map((chip) => (
            <button
              key={chip}
              onClick={() => send(chip)}
              className="text-xs px-3 py-1.5 rounded-full border border-slate-200 dark:border-white/10 text-slate-600 dark:text-txt-secondary hover:border-accent-primary/40 hover:text-accent-primary transition-all"
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={(e) => { e.preventDefault(); send(); }}
        className="px-6 py-4 border-t border-slate-200 dark:border-white/5 flex items-center gap-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your spending..."
          className="input-field !py-2.5 flex-1"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="btn-primary !px-4 !py-2.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none flex items-center gap-2 flex-shrink-0"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          <span className="hidden sm:inline">Ask</span>
        </button>
      </form>
    </div>
  );
};

export default AskFinoraAI;
