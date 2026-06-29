import { forwardRef } from 'react';

/**
 * Premium Card component - Finora design system
 * Dark: bg #111827, border rgba(255,255,255,0.07), hover teal accent
 * Light: bg white, border slate-200, hover teal accent
 */
const Card = forwardRef(({ 
  children, 
  className = '', 
  hoverable = true,
  padding = 'p-6',
  noBorder = false,
  style = {},
  ...props 
}, ref) => {
  return (
    <div
      ref={ref}
      className={`
        rounded-2xl transition-all duration-200 ease-in-out
        bg-white dark:bg-[#111827]
        ${noBorder ? '' : 'border border-slate-200 dark:border-white/[0.07]'}
        shadow-[0_4px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)]
        ${padding}
        ${hoverable ? 'hover:border-brand-teal/30 dark:hover:border-brand-teal/30 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]' : ''}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

export default Card;
