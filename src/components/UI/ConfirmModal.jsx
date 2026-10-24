import { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

/**
 * ConfirmModal - Premium replacement for window.confirm()
 * Backdrop blur, scale-in animation, danger/default variants
 */
const ConfirmModal = ({
  open,
  title = 'Are you sure?',
  message = '',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onCancel?.();
      if (e.key === 'Enter' && !loading) onConfirm?.();
    };
    window.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [open, loading, onConfirm, onCancel]);

  if (!open) return null;

  const accent = variant === 'danger'
    ? {
        iconBg: 'bg-accent-danger/15',
        iconColor: 'text-accent-danger',
        button: 'bg-accent-danger hover:bg-red-600 shadow-lg shadow-accent-danger/25',
        ring: 'ring-accent-danger/20',
      }
    : {
        iconBg: 'bg-brand-teal/15',
        iconColor: 'text-brand-teal',
        button: 'bg-brand-teal hover:bg-emerald-500 shadow-lg shadow-brand-teal/25',
        ring: 'ring-brand-teal/20',
      };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={loading ? undefined : onCancel}
      />

      {/* Dialog */}
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        className={`relative w-full max-w-md rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/10 shadow-2xl p-6 animate-scale-in ring-1 ${accent.ring}`}
      >
        <button
          onClick={onCancel}
          disabled={loading}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 dark:text-txt-muted hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-600 dark:hover:text-txt-primary transition-all"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl ${accent.iconBg} flex items-center justify-center flex-shrink-0`}>
            <AlertTriangle size={22} className={accent.iconColor} />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-heading font-bold text-slate-800 dark:text-txt-primary">{title}</h3>
            {message && (
              <p className="text-sm text-slate-500 dark:text-txt-muted mt-1.5 leading-relaxed">{message}</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-7">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-txt-secondary bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 transition-all duration-200 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 active:scale-[0.98] disabled:opacity-60 ${accent.button}`}
          >
            {loading ? 'Working...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
