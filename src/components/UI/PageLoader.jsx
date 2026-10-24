import { Loader2 } from 'lucide-react';

/**
 * PageLoader - Branded full-screen loading state for Finora
 * Replaces plain "Loading..." text across protected routes
 */
const PageLoader = ({ label = 'Loading your workspace...' }) => {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-fintech-bg flex flex-col items-center justify-center gap-6 animate-fade-in">
      {/* Logo with orbiting glow */}
      <div className="relative">
        <div className="absolute inset-0 rounded-2xl bg-brand-teal/30 blur-2xl animate-glow-pulse" />
        <div className="relative w-16 h-16 rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-glow-teal">
          <img src="/finora-logo.png" alt="Finora" className="w-full h-full object-cover" />
        </div>
      </div>

      <div className="flex items-center gap-2.5 text-slate-500 dark:text-txt-muted">
        <Loader2 size={18} className="animate-spin text-brand-teal" />
        <span className="text-sm font-medium">{label}</span>
      </div>

      {/* Progress shimmer bar */}
      <div className="w-44 h-1 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
        <div className="h-full w-full animate-shimmer bg-gradient-to-r from-transparent via-brand-teal to-transparent bg-[length:200%_100%]" />
      </div>
    </div>
  );
};

export default PageLoader;
