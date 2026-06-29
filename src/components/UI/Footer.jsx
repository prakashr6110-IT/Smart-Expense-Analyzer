import { Github, Shield, Info } from 'lucide-react';

/**
 * Footer - Professional SaaS footer for Finora
 * Background: #080D14, border-top: rgba(255,255,255,0.06)
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="w-full border-t border-white/[0.06] mt-auto"
      style={{ backgroundColor: '#080D14' }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {/* Desktop layout */}
        <div className="hidden sm:flex items-center justify-between">
          {/* Left: Copyright */}
          <p className="text-[13px] text-[#475569]">
            <span className="font-semibold text-white">Finora</span> © {currentYear}
          </p>

          {/* Center: Privacy note */}
          <p className="text-[13px] text-[#475569] flex items-center gap-1.5">
            <Shield size={12} />
            Your data never leaves your browser
          </p>

          {/* Right: Links */}
          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] text-[#475569] hover:text-white transition-colors duration-200 flex items-center gap-1"
              aria-label="GitHub"
            >
              <Github size={14} />
              GitHub
            </a>
            <a
              href="#privacy"
              className="text-[13px] text-[#475569] hover:text-white transition-colors duration-200"
            >
              Privacy
            </a>
            <a
              href="#about"
              className="text-[13px] text-[#475569] hover:text-white transition-colors duration-200"
            >
              About
            </a>
          </div>
        </div>

        {/* Mobile layout */}
        <div className="sm:hidden flex flex-col items-center gap-4 text-center">
          <p className="text-[13px] text-[#475569]">
            <span className="font-semibold text-white">Finora</span> © {currentYear}
          </p>
          <p className="text-[13px] text-[#475569] flex items-center gap-1.5">
            <Shield size={12} />
            Your data never leaves your browser
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] text-[#475569] hover:text-white transition-colors duration-200 flex items-center gap-1"
              aria-label="GitHub"
            >
              <Github size={14} />
              GitHub
            </a>
            <a
              href="#privacy"
              className="text-[13px] text-[#475569] hover:text-white transition-colors duration-200"
            >
              Privacy
            </a>
            <a
              href="#about"
              className="text-[13px] text-[#475569] hover:text-white transition-colors duration-200"
            >
              About
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
