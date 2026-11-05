import { useState, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar/Sidebar';
import { Header } from './Header/Header';
import { PageSkeleton } from './PageSkeleton';
import './AppShell.css';

export function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div className="app-main">
        <Header 
          onToggleMobileMenu={() => setMobileOpen(prev => !prev)} 
          isMobileMenuOpen={mobileOpen} 
        />
        <main className="app-content" id="main-content">
          <Suspense fallback={<PageSkeleton />}>
            <Outlet />
          </Suspense>
        </main>
        <footer className="app-platform-footer">
          <div className="app-platform-footer-inner">
            <span>© 2026 Eduvanta. All Rights Reserved.</span>
            <span className="app-platform-footer-dot">•</span>
            <span>Developed by Aditya Kittad</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
