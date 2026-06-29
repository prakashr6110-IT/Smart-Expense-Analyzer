import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Select - Finora design system dropdown
 * Dark theme with custom chevron icon
 */
const Select = forwardRef(({
  label,
  error,
  children,
  className = '',
  id,
  ...props
}, ref) => {
  const selectId = id || props.name;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-caption font-medium text-slate-500 dark:text-[#94A3B8] mb-1.5"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          className={`
            w-full px-4 py-3 pr-10 rounded-[10px] text-body appearance-none
            bg-white dark:bg-[#1E293B]
            text-slate-800 dark:text-white
            border border-slate-200 dark:border-white/10
            transition-all duration-200 ease-in-out
            focus:outline-none focus:border-[#00C9A7] focus:ring-0
            focus:shadow-[0_0_0_3px_rgba(0,201,167,0.15)]
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-red-500 dark:border-red-500' : ''}
            ${className}
          `.trim().replace(/\s+/g, ' ')}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          size={16}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#64748B] pointer-events-none"
        />
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
