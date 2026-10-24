import { Link } from 'react-router-dom';
import { Brain, ShieldCheck, TrendingUp, Sparkles } from 'lucide-react';

/**
 * AuthLayout - Premium split-screen shell for Login / Register
 * Left: dark brand showcase panel (desktop only)
 * Right: centered form area that adapts to light/dark theme
 */
const AuthLayout = ({ title, subtitle, children }) => {
  return (
    <div className="min-h-screen flex bg-slate-100 dark:bg-fintech-bg animate-fade-in">
      {/* Left: Brand showcase */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] max-w-2xl relative overflow-hidden bg-fintech-bg p-12">
        {/* Decorative orbs */}
        <div className="absolute top-0 -left-24 w-96 h-96 bg-brand-teal/10 rounded-full blur-[140px] animate-float-slow pointer-events-none" />
        <div className="absolute bottom-0 -right-24 w-96 h-96 bg-brand-purple/10 rounded-full blur-[140px] animate-float-slow pointer-events-none" style={{ animationDelay: '2s' }} />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
            backgroundSize: '44px 44px',
            maskImage: 'radial-gradient(ellipse 80% 70% at 40% 40%, black, transparent)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 40% 40%, black, transparent)',
          }}
        />

        {/* Logo */}
        <Link to="/" className="relative flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-xl overflow-hidden ring-1 ring-brand-teal/30 group-hover:shadow-glow-teal transition-shadow">
            <img src="/finora-logo.png" alt="Finora" className="w-full h-full object-cover" />
          </div>
          <span className="text-2xl font-heading">
            <span className="font-bold text-brand-teal">Fin</span><span className="font-normal text-white">ora</span>
          </span>
        </Link>

        {/* Headline + features */}
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-txt-secondary text-xs font-medium mb-6">
            <Sparkles size={13} className="text-brand-teal" />
            Smart Expense Behavior Analyzer
          </div>
          <h2 className="text-4xl font-heading font-bold text-white leading-tight mb-4">
            Master your money with{' '}
            <span className="gradient-text-animated">behavioral insights</span>
          </h2>
          <p className="text-txt-muted text-base leading-relaxed mb-10">
            Track spending, uncover hidden patterns, and let AI guide you to better financial decisions.
          </p>

          <ul className="space-y-4">
            {[
              { icon: Brain, title: 'AI behavior analysis', desc: 'Detects weekend habits, peak hours & spending triggers' },
              { icon: TrendingUp, title: 'Smart predictions', desc: 'Forecasts next month expenses before they happen' },
              { icon: ShieldCheck, title: 'Privacy first', desc: 'End-to-end secured with row-level data isolation' },
            ].map(({ icon: Icon, title: t, desc }) => (
              <li key={t} className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-brand-teal/10 border border-brand-teal/20 flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className="text-brand-teal" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{t}</p>
                  <p className="text-xs text-txt-muted mt-0.5">{desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer note */}
        <p className="relative text-xs text-txt-muted">
          Trusted personal finance insights — your data never leaves your account.
        </p>
      </div>

      {/* Right: Form area */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-12 relative overflow-hidden">
        {/* Mobile logo header */}
        <div className="lg:hidden absolute top-6 left-0 right-0 flex justify-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg overflow-hidden ring-1 ring-brand-teal/30">
              <img src="/finora-logo.png" alt="Finora" className="w-full h-full object-cover" />
            </div>
            <span className="text-xl font-heading">
              <span className="font-bold text-brand-teal">Fin</span><span className="font-normal text-slate-800 dark:text-white">ora</span>
            </span>
          </Link>
        </div>

        {/* Ambient orbs for form side */}
        <div className="absolute top-[20%] -right-20 w-72 h-72 bg-accent-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[20%] -left-20 w-72 h-72 bg-accent-insights/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full max-w-md relative z-10 animate-scale-in">
          <h1 className="text-3xl font-heading font-bold text-slate-800 dark:text-txt-primary">{title}</h1>
          <p className="text-sm text-slate-500 dark:text-txt-muted mt-2 mb-8">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
