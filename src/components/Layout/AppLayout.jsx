import { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import Footer from '../UI/Footer';

/**
 * AppLayout — single authenticated shell:
 * fixed desktop sidebar (240px), compact sticky top bar, centered content
 * capped at 1440px, and a shared footer. Below 1024px the sidebar becomes
 * an accessible navigation drawer.
 */
const AppLayout = ({ children }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#eef2f7] dark:bg-fintech-bg transition-colors duration-300">
      <Sidebar open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <div className="relative z-10 flex min-h-screen flex-col lg:pl-60">
        <TopBar onMenuClick={() => setDrawerOpen(true)} />

        <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 py-6 lg:py-8 animate-fade-in">
          {children}
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default AppLayout;
