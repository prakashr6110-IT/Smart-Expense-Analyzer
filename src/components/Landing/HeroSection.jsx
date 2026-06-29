import { ArrowRight, Lock, Zap, BarChart3 } from 'lucide-react';

const HeroSection = () => {
  const scrollToAnalyzer = () => {
    const element = document.getElementById('analyzer-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative overflow-hidden" style={{ backgroundColor: '#0B1220', padding: '80px 24px' }}>
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-brand-teal/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-brand-purple/10 rounded-full blur-[150px]" />
      </div>

      <div className="relative max-w-4xl mx-auto text-center">
        {/* Headline */}
        <h1 className="text-display text-white mb-6">
          Understand where your money really goes
        </h1>

        {/* Subheadline */}
        <p className="text-h3 mb-10" style={{ color: '#94A3B8' }}>
          Add your expenses and get AI-powered behavioral insights — patterns, warnings, and smart suggestions.
        </p>

        {/* Button */}
        <div className="flex items-center justify-center mb-12">
          <button
            onClick={scrollToAnalyzer}
            className="flex items-center gap-2 px-8 py-4 rounded-[10px] font-semibold text-base transition-all duration-300 hover:scale-105 hover:shadow-xl"
            style={{ backgroundColor: '#00C9A7', color: '#0B1220' }}
          >
            Start Analyzing
            <ArrowRight size={18} />
          </button>
        </div>

        {/* Feature badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm" style={{ color: '#94A3B8' }}>
          <div className="flex items-center gap-2">
            <Lock size={16} className="text-brand-teal" />
            <span>Data stays in your browser</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-brand-teal" />
            <span>Instant AI analysis</span>
          </div>
          <div className="flex items-center gap-2">
            <BarChart3 size={16} className="text-brand-teal" />
            <span>Visual insights</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
