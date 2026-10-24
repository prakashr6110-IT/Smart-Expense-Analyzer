import { Github, Shield, Info } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

/**
 * Footer - Professional SaaS footer for Finora
 * Dark: #080D14 · Light: white with slate border
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { isDark } = useTheme();

  const linkCls = isDark
    ? 'text-[#475569] hover:text-white transition-colors duration-200'
    : 'text-slate-500 hover:text-slate-900 transition-colors duration-200';
  const textCls = isDark ? 'text-[#475569]' : 'text-slate-500';
  const brandCls = isDark ? 'font-semibold text-white' : 'font-semibold text-slate-900';

  return (
    <footer
      className={`w-full border-t mt-auto transition-colors duration-300 ${
        isDark ? 'border-white/[0.06] bg-[#080D14]' : 'border-slate-200 bg-white'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {/* Desktop layout */}
        <div className="hidden sm:flex items-center justify-between">
          {/* Left: Copyright */}
          <p className={`text-[13px] ${textCls}`}>
            <span className={brandCls}>Finora</span> © {currentYear}
          </p>

          {/* Center: Privacy note */}
          <p className={`text-[13px] flex items-center gap-1.5 ${textCls}`}>
            <Shield size={12} />
            Your data never leaves your browser
          </p>

          {/* Right: Links */}
          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className={`text-[13px] flex items-center gap-1 ${linkCls}`}
              aria-label="GitHub"
            >
              <Github size={14} />
              GitHub
            </a>
            <a href="#privacy" className={`text-[13px] ${linkCls}`}>Privacy</a>
            <a href="#about" className={`text-[13px] ${linkCls}`}>About</a>
          </div>
        </div>

        {/* Mobile layout */}
        <div className="sm:hidden flex flex-col items-center gap-4 text-center">
          <p className={`text-[13px] ${textCls}`}>
            <span className={brandCls}>Finora</span> © {currentYear}
          </p>
          <p className={`text-[13px] flex items-center gap-1.5 ${textCls}`}>
            <Shield size={12} />
            Your data never leaves your browser
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className={`text-[13px] flex items-center gap-1 ${linkCls}`}
              aria-label="GitHub"
            >
              <Github size={14} />
              GitHub
            </a>
            <a href="#privacy" className={`text-[13px] ${linkCls}`}>Privacy</a>
            <a href="#about" className={`text-[13px] ${linkCls}`}>About</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
