import { forwardRef } from 'react';

/**
 * Input - Finora design system form input
 * Dark theme: bg #1E293B, border rgba(255,255,255,0.1), focus teal ring
 * Light theme: bg white, border slate-200, focus teal ring
 */
const Input = forwardRef(({
  label,
  error,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || props.name;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-caption font-medium text-slate-500 dark:text-[#94A3B8] mb-1.5"
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={`
          w-full px-4 py-3 rounded-[10px] text-body
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

Input.displayName = 'Input';

export default Input;
