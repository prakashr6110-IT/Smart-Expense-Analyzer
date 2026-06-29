import { forwardRef } from 'react';

/**
 * Textarea - Finora design system textarea
 * Vertical resize only, matching Input styling
 */
const Textarea = forwardRef(({
  label,
  error,
  className = '',
  id,
  rows = 3,
  ...props
}, ref) => {
  const textareaId = id || props.name;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-caption font-medium text-slate-500 dark:text-[#94A3B8] mb-1.5"
        >
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        className={`
          w-full px-4 py-3 rounded-[10px] text-body resize-y
          bg-white dark:bg-[#1E293B]
          text-slate-800 dark:text-white
          border border-slate-200 dark:border-white/10
          placeholder:text-slate-400 dark:placeholder:text-[#64748B]
          transition-all duration-200 ease-in-out
          focus:outline-none focus:border-[#00C9A7] focus:ring-0
          focus:shadow-[0_0_0_3px_rgba(0,201,167,0.15)]
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-red-500 dark:border-red-500' : ''}
          ${className}
        `.trim().replace(/\s+/g, ' ')}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;
