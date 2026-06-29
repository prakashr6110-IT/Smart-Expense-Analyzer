import { forwardRef } from 'react';

/**
 * Button - Finora design system
 * Variants: primary, outline, ghost
 * Sizes: sm, md, lg
 */
const VARIANTS = {
  primary:
    'bg-[#00C9A7] text-[#0B1220] font-semibold hover:bg-[#00B89A] focus-visible:ring-[#00C9A7]/40 active:scale-[0.98]',
  outline:
    'bg-transparent border border-[#00C9A7] text-[#00C9A7] font-semibold hover:bg-[#00C9A7]/[0.08] focus-visible:ring-[#00C9A7]/40',
  ghost:
    'bg-transparent border-none text-[#94A3B8] hover:text-white focus-visible:ring-white/30',
};

const SIZES = {
  sm: 'px-4 py-2 text-sm min-h-[36px]',
  md: 'px-6 py-3 text-sm min-h-[44px]',
  lg: 'px-8 py-3.5 text-base min-h-[48px]',
};

const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  fullWidth = false,
  type = 'button',
  ...props
}, ref) => {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center gap-2 rounded-[10px]
        transition-all duration-200 ease-in-out
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent
        disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
        ${VARIANTS[variant] || VARIANTS.primary}
        ${SIZES[size] || SIZES.md}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
