import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

const FloatingAddButton = () => {
  return (
    <Link
      to="/add-expense"
      className="fixed bottom-6 right-6 z-50 group"
      title="Add Expense"
    >
      <div className="relative">
        {/* Pulse ring */}
        <div className="absolute inset-0 rounded-full bg-accent-primary animate-ping opacity-15" />
        
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full bg-accent-primary/30 blur-md" />
        
        {/* Button */}
        <div className="relative w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-accent-primary to-accent-insights rounded-full flex items-center justify-center shadow-2xl shadow-accent-primary/30 group-hover:shadow-accent-primary/50 transition-all duration-300 group-hover:scale-110 group-active:scale-95">
          <Plus size={28} className="text-white group-hover:rotate-90 transition-transform duration-300" strokeWidth={2.5} />
        </div>
      </div>
      
      {/* Tooltip */}
      <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        <div className="bg-slate-800 dark:bg-fintech-card text-white dark:text-txt-primary text-xs font-medium px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap border border-slate-700 dark:border-white/10">
          Add Expense
        </div>
      </div>
    </Link>
  );
};

export default FloatingAddButton;
