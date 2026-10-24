import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Check, IndianRupee, Sparkles, Wallet } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getQuoteOfDay, getDaypart } from '../../utils/financeQuotes';
import { getUserDisplayName } from '../Common/UserAvatar';

const SEEN_KEY = 'finora-welcome-seen';
const QUICK_AMOUNTS = [15000, 25000, 40000, 60000, 100000];
/** Share of salary treated as the spendable monthly budget (50/30/20 rule). */
const BUDGET_RATIO = 0.8;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Digits in → Indian grouped string ("₹1,00,000" style grouping). */
const groupINR = (value) => {
  const digits = String(value).replace(/\D/g, '').slice(0, 9);
  if (!digits) return '';
  return Number(digits).toLocaleString('en-IN');
};

const ungroup = (value) => parseInt(String(value).replace(/\D/g, ''), 10) || 0;

/** Character-by-character reveal so the quote lands with motion. */
const useTypewriter = (text, enabled) => {
  const reduced = useMemo(prefersReducedMotion, []);
  const [typed, setTyped] = useState('');

  useEffect(() => {
    if (!enabled || reduced) {
      setTyped(text);
      return;
    }
    setTyped('');
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setTyped(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, 24);
    return () => clearInterval(id);
  }, [text, enabled, reduced]);

  return { typed, done: typed.length >= text.length };
};

/**
 * WelcomeGate — the post-login ritual shown once per browser session before the
 * app is revealed: a Finora daily quote, then the monthly salary prompt that
 * seeds the spendable budget, then a short confirmation before the dashboard.
 */
const WelcomeGate = ({ children }) => {
  const { user, profile, updateProfile, updateUserMetadata } = useAuth();
  const [open, setOpen] = useState(() => {
    try {
      return !sessionStorage.getItem(SEEN_KEY);
    } catch {
      return true;
    }
  });
  const [step, setStep] = useState('quote'); // quote → salary → success
  const [leaving, setLeaving] = useState(false);
  const [salaryText, setSalaryText] = useState('');
  const [applyBudget, setApplyBudget] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const amountRef = useRef(null);

  const quote = useMemo(() => getQuoteOfDay(), []);
  const { typed, done } = useTypewriter(quote.text, step === 'quote');

  const salary = ungroup(salaryText);
  const suggestedBudget = Math.round(salary * BUDGET_RATIO);
  const allocation = useMemo(
    () => [
      { label: 'Essentials', pct: 50, color: 'from-brand-teal to-emerald-400' },
      { label: 'Wants', pct: 30, color: 'from-brand-purple to-indigo-400' },
      { label: 'Savings', pct: 20, color: 'from-amber-400 to-orange-400' },
    ],
    [],
  );

  const displayName = getUserDisplayName(user, profile);
  const firstName = displayName.split(' ')[0];
  const daypart = useMemo(() => getDaypart(), []);

  // Pre-fill a previously saved salary so returning users have one-tap entry.
  useEffect(() => {
    const stored = user?.user_metadata?.monthly_salary;
    if (stored) setSalaryText(groupINR(String(Math.round(Number(stored)))));
  }, [user]);

  // Freeze background scrolling while the ritual is on screen.
  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Move focus to the amount field as the salary step arrives.
  useEffect(() => {
    if (step === 'salary') {
      const id = setTimeout(() => amountRef.current?.focus(), 420);
      return () => clearTimeout(id);
    }
    return undefined;
  }, [step]);

  // Space/Enter advances the quote step; Escape skips the whole ritual.
  useEffect(() => {
    if (!open || step !== 'quote') return undefined;
    const onKey = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setStep('salary');
      } else if (e.key === 'Escape') {
        closeGate();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, step]);

  // Confirmation beat, then fade the gate away.
  useEffect(() => {
    if (step !== 'success') return undefined;
    const id = setTimeout(closeGate, 1250);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  function closeGate() {
    setLeaving(true);
    setTimeout(() => {
      try {
        sessionStorage.setItem(SEEN_KEY, '1');
      } catch {
        /* storage unavailable — still reveal the app */
      }
      setOpen(false);
    }, 420);
  }

  const handleSalaryChange = (e) => setSalaryText(groupINR(e.target.value));

  const handleSave = async () => {
    if (salary < 1000) {
      setError('Enter your monthly salary to continue');
      amountRef.current?.focus();
      return;
    }
    setError('');
    setSaving(true);
    try {
      await updateUserMetadata({ monthly_salary: salary });
      if (applyBudget && suggestedBudget > 0) await updateProfile({ monthly_budget: suggestedBudget });
      setStep('success');
    } catch (err) {
      setError(err.message || 'Could not save your salary. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return <>{children}</>;

  return (
    <>
      {/* App stays mounted behind the opaque gate so charts are sized on reveal */}
      {children}

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Welcome to Finora"
        className={`welcome-gate fixed inset-0 z-[100] overflow-hidden bg-fintech-bg ${leaving ? 'animate-welcome-exit' : 'animate-fade-in'}`}
      >
        {/* Ambient branding */}
        <div className="absolute -top-24 left-1/2 w-[520px] h-[520px] -translate-x-1/2 bg-brand-teal/15 rounded-full blur-[150px] animate-float-slow pointer-events-none" />
        <div className="absolute -bottom-32 -right-16 w-[420px] h-[420px] bg-brand-purple/15 rounded-full blur-[150px] animate-float-slow pointer-events-none" style={{ animationDelay: '1.6s' }} />
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)',
            backgroundSize: '46px 46px',
            maskImage: 'radial-gradient(ellipse 75% 65% at 50% 45%, black, transparent)',
            WebkitMaskImage: 'radial-gradient(ellipse 75% 65% at 50% 45%, black, transparent)',
          }}
        />

        {/* Header: mark + progress */}
        <div className="relative z-10 flex items-center justify-between px-5 sm:px-10 pt-6">
          <div className="flex items-center gap-2.5 animate-slide-in-left">
            <div className="w-9 h-9 rounded-xl overflow-hidden ring-1 ring-brand-teal/40">
              <img src="/finora-logo.png" alt="Finora" className="w-full h-full object-cover" />
            </div>
            <span className="text-xl font-heading">
              <span className="font-bold text-brand-teal">Fin</span>
              <span className="font-normal text-white">ora</span>
            </span>
          </div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-txt-muted">
            {step === 'quote' ? 'Step 1 of 2' : step === 'salary' ? 'Step 2 of 2' : 'Complete'}
          </p>
        </div>

        <div className="relative z-10 flex min-h-[calc(100vh-5.5rem)] items-center justify-center px-5 py-8">
          {/* ── Step 1: quote ─────────────────────────────────────────── */}
          {step === 'quote' && (
            <div key="quote" className="w-full max-w-2xl text-center animate-step-swap">
              <div className="mx-auto w-20 h-20 rounded-3xl overflow-hidden ring-1 ring-brand-teal/50 shadow-glow-teal-lg animate-bounce-in">
                <img src="/finora-logo.png" alt="" className="w-full h-full object-cover" />
              </div>

              <p className="mt-6 text-sm text-txt-muted animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
                {daypart}, {firstName}
              </p>
              <h1 className="mt-1 text-3xl sm:text-5xl font-heading font-bold text-white leading-tight animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
                Today&rsquo;s <span className="gradient-text-animated">Finora</span> insight
              </h1>

              <figure className="mt-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm px-6 sm:px-10 py-8 animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-teal/10 border border-brand-teal/25 text-[11px] font-semibold uppercase tracking-wider text-brand-teal">
                  <Sparkles size={12} />
                  {quote.theme}
                </span>
                <blockquote className="mt-5 min-h-[6.5rem] sm:min-h-[5rem] text-lg sm:text-2xl font-heading font-medium text-txt-primary leading-relaxed">
                  &ldquo;{typed}
                  {!done && <span className="animate-caret text-brand-teal">|</span>}
                  {done && '&rdquo;'}
                </blockquote>
                <figcaption className={`mt-4 text-xs text-txt-muted transition-opacity duration-500 ${done ? 'opacity-100' : 'opacity-0'}`}>
                  — Finora Wisdom
                </figcaption>
              </figure>

              <div className={`mt-8 flex flex-col items-center gap-4 transition-all duration-500 ${done ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
                <button
                  type="button"
                  onClick={() => setStep('salary')}
                  className="btn-primary group inline-flex items-center gap-2 min-w-[220px]"
                >
                  Continue
                  <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
                </button>
                <p className="text-xs text-txt-muted">Your salary sets your budget — nothing leaves your account.</p>
              </div>
            </div>
          )}

          {/* ── Step 2: monthly salary ────────────────────────────────── */}
          {step === 'salary' && (
            <div key="salary" className="w-full max-w-xl animate-step-swap">
              <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 sm:p-8 shadow-card-dark">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-brand-teal/15 border border-brand-teal/25 flex items-center justify-center">
                    <Wallet size={20} className="text-brand-teal" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-heading font-bold text-white">Enter your monthly salary</h2>
                    <p className="text-sm text-txt-muted mt-0.5">We use it to shape a budget you can actually keep.</p>
                  </div>
                </div>

                {/* Amount field */}
                <label htmlFor="welcome-salary" className="block mt-7 text-xs font-semibold uppercase tracking-wider text-txt-muted">
                  Monthly take-home (₹)
                </label>
                <div className="mt-2 flex items-center gap-3 rounded-2xl border-2 border-white/10 bg-fintech-secondary px-4 py-3 transition-all duration-300 focus-within:border-brand-teal/70 focus-within:shadow-glow-teal">
                  <IndianRupee size={26} className="text-brand-teal flex-shrink-0" />
                  <input
                    id="welcome-salary"
                    ref={amountRef}
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    value={salaryText}
                    onChange={handleSalaryChange}
                    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                    placeholder="0"
                    aria-describedby="welcome-salary-help"
                    className="w-full bg-transparent text-3xl sm:text-4xl font-heading font-bold tabular-nums text-white placeholder-txt-muted focus:outline-none"
                  />
                  {salary > 0 && (
                    <span key={salary} className="animate-value-pop text-sm font-semibold text-brand-teal tabular-nums">
                      ₹{salary.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>

                {/* Quick picks */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {QUICK_AMOUNTS.map((amount, i) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => {
                        setSalaryText(groupINR(amount));
                        setError('');
                      }}
                      style={{ animationDelay: `${0.05 * i}s` }}
                      className={`animate-fade-in-up px-3.5 py-2 rounded-xl text-sm font-semibold tabular-nums transition-all duration-200 hover:scale-[1.04] active:scale-[0.97] border ${
                        salary === amount
                          ? 'bg-brand-teal text-fintech-bg border-brand-teal shadow-glow-teal'
                          : 'bg-white/5 text-txt-secondary border-white/10 hover:border-brand-teal/40 hover:text-white'
                      }`}
                    >
                      ₹{amount.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>

                {/* Live 50/30/20 preview */}
                <div className={`mt-7 transition-all duration-500 ${salary > 0 ? 'opacity-100 max-h-96' : 'opacity-0 max-h-0 overflow-hidden'}`}>
                  <p className="text-xs font-semibold uppercase tracking-wider text-txt-muted">How this could split</p>
                  <div className="mt-3 space-y-3">
                    {allocation.map(({ label, pct, color }) => (
                      <div key={label}>
                        <div className="flex justify-between text-xs text-txt-secondary mb-1.5">
                          <span>{label} · {pct}%</span>
                          <span className="font-semibold tabular-nums text-white">₹{Math.round(salary * pct / 100).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-700 ease-out`}
                            style={{ width: salary > 0 ? `${pct}%` : '0%' }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <label className="mt-5 flex items-start gap-3 cursor-pointer group">
                    <span className="relative mt-0.5 flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={applyBudget}
                        onChange={(e) => setApplyBudget(e.target.checked)}
                        className="peer sr-only"
                      />
                      <span className="w-5 h-5 rounded-md border-2 border-white/20 bg-white/5 flex items-center justify-center transition-all duration-200 peer-checked:bg-brand-teal peer-checked:border-brand-teal group-hover:border-brand-teal/60">
                        {applyBudget && <Check size={13} className="text-fintech-bg animate-bounce-in" strokeWidth={3} />}
                      </span>
                    </span>
                    <span className="text-sm text-txt-secondary">
                      Set my monthly budget to{' '}
                      <span className="font-semibold text-white tabular-nums">₹{suggestedBudget.toLocaleString('en-IN')}</span>
                      <span className="block text-xs text-txt-muted mt-0.5">80% of salary — the spendable half of your money.</span>
                    </span>
                  </label>
                </div>

                {error && (
                  <p role="alert" className="mt-5 animate-shake text-sm font-medium text-accent-danger">
                    {error}
                  </p>
                )}
                <p id="welcome-salary-help" className="mt-5 text-xs text-txt-muted">
                  Stored only in your own account. You can change it anytime in Profile.
                </p>

                <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving || salary < 1000}
                    className="btn-primary group flex-1 w-full inline-flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {saving ? 'Saving…' : salary > 0 ? 'Continue to dashboard' : 'Enter your monthly salary'}
                    {!saving && <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />}
                  </button>
                  <button
                    type="button"
                    onClick={closeGate}
                    className="text-sm font-medium text-txt-muted hover:text-white transition-colors px-2 py-1"
                  >
                    Skip for now
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3: confirmation ──────────────────────────────────── */}
          {step === 'success' && (
            <div key="success" className="w-full max-w-md text-center animate-step-swap">
              <div className="relative mx-auto w-24 h-24">
                <span className="absolute inset-0 rounded-full bg-brand-teal/20 animate-ripple" />
                <svg viewBox="0 0 96 96" className="relative w-24 h-24">
                  <circle cx="48" cy="48" r="42" fill="none" stroke="currentColor" className="text-brand-teal/30" strokeWidth="3" />
                  <circle
                    cx="48" cy="48" r="42" fill="none" stroke="currentColor"
                    className="text-brand-teal animate-draw-ring" strokeWidth="3" strokeLinecap="round"
                    strokeDasharray="264"
                  />
                  <path
                    d="M30 49l12 12 24-26"
                    fill="none" stroke="currentColor" className="text-brand-teal animate-draw-check"
                    strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h2 className="mt-6 text-3xl font-heading font-bold text-white animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
                You&rsquo;re all set, {firstName}
              </h2>
              <p className="mt-2 text-sm text-txt-muted animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                Salary saved · budget ₹{applyBudget ? suggestedBudget.toLocaleString('en-IN') : 'unchanged'} · opening your dashboard
              </p>
            </div>
          )}
        </div>

        {/* Step dots */}
        <div className="relative z-10 flex justify-center gap-2 pb-7">
          {['quote', 'salary', 'success'].map((name) => (
            <span
              key={name}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                step === name ? 'w-8 bg-brand-teal' : 'w-1.5 bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default WelcomeGate;
