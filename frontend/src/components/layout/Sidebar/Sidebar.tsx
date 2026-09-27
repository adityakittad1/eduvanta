import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, ClipboardList,
  BarChart2, Bell, FileText, School, Image, ChevronLeft,
  ChevronRight, Bot, AlertTriangle, Library, BookMarked, Settings,
  Menu, X, Globe,
} from 'lucide-react';
import { useAuth } from '@/store/AuthContext';
import type { Role } from '@/store/AuthContext';
import './Sidebar.css';

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
  roles: Role[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard',       to: '/erp/dashboard',         icon: <LayoutDashboard size={18} />, roles: ['PRINCIPAL', 'TEACHER', 'STUDENT'] },
  { label: 'Students',        to: '/erp/students',          icon: <GraduationCap size={18} />,   roles: ['PRINCIPAL', 'TEACHER'] },
  { label: 'Teachers',        to: '/erp/teachers',          icon: <Users size={18} />,           roles: ['PRINCIPAL'] },
  { label: 'Classes',         to: '/erp/classes',           icon: <BookOpen size={18} />,        roles: ['PRINCIPAL', 'TEACHER'] },
  { label: 'Attendance',      to: '/erp/attendance',        icon: <ClipboardList size={18} />,   roles: ['PRINCIPAL', 'TEACHER', 'STUDENT'] },
  { label: 'Academics',       to: '/erp/academics',         icon: <BookMarked size={18} />,      roles: ['PRINCIPAL', 'TEACHER', 'STUDENT'] },
  { label: 'Analytics',       to: '/erp/analytics',         icon: <BarChart2 size={18} />,       roles: ['PRINCIPAL', 'TEACHER'] },
  { label: 'Early Warning',   to: '/erp/early-warning',     icon: <AlertTriangle size={18} />,   roles: ['PRINCIPAL', 'TEACHER'] },
  { label: 'Quizzes',         to: '/erp/quizzes',           icon: <FileText size={18} />,        roles: ['PRINCIPAL', 'TEACHER', 'STUDENT'] },
  { label: 'Resources',       to: '/erp/resources',         icon: <Library size={18} />,         roles: ['PRINCIPAL', 'TEACHER', 'STUDENT'] },
  { label: 'Notices',         to: '/erp/notices',           icon: <Bell size={18} />,            roles: ['PRINCIPAL', 'TEACHER', 'STUDENT'] },
  { label: 'Transfer Certs',  to: '/erp/tc',                icon: <FileText size={18} />,        roles: ['PRINCIPAL', 'TEACHER', 'STUDENT'] },
  { label: 'Gallery',         to: '/erp/gallery',           icon: <Image size={18} />,           roles: ['PRINCIPAL', 'TEACHER', 'STUDENT'] },
  { label: 'AI Assistant',    to: '/erp/ai',                icon: <Bot size={18} />,             roles: ['PRINCIPAL', 'TEACHER', 'STUDENT'] },
  { label: 'Reports',         to: '/erp/reports',           icon: <BarChart2 size={18} />,       roles: ['PRINCIPAL', 'TEACHER'] },
  { label: 'School Profile',  to: '/erp/school-profile',    icon: <Settings size={18} />,        roles: ['PRINCIPAL', 'TEACHER', 'STUDENT'] },
  { label: 'Public Website',  to: '/erp/public-website',    icon: <Globe size={18} />,           roles: ['PRINCIPAL'] },
];

const superAdminNavItems: NavItem[] = [
  { label: 'Dashboard',   to: '/erp/super-admin/dashboard', icon: <LayoutDashboard size={18} />, roles: ['SUPER_ADMIN'] },
  { label: 'Schools',     to: '/erp/super-admin/schools',   icon: <School size={18} />,          roles: ['SUPER_ADMIN'] },
  { label: 'Users',       to: '/erp/super-admin/users',     icon: <Users size={18} />,           roles: ['SUPER_ADMIN'] },
];

export function Sidebar() {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const items = user?.role === 'SUPER_ADMIN' ? superAdminNavItems : navItems;
  const visibleItems = items.filter((item) => user && item.roles.includes(user.role));

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="sidebar-mobile-overlay" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile toggle */}
      <button
        className="sidebar-mobile-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''} ${mobileOpen ? 'sidebar-mobile-open' : ''}`}
        aria-label="Main navigation"
      >
        {/* Logo / School Area */}
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            {user?.school?.logoUrl ? (
              <img src={user.school.logoUrl} alt="School Logo" style={{ width: 22, height: 22, objectFit: 'contain', borderRadius: 4 }} />
            ) : (
              <School size={22} />
            )}
          </div>
          {!collapsed && (
            <div className="sidebar-brand-text">
              <span className="sidebar-product-name" style={{ fontSize: user?.school ? '0.85rem' : undefined, whiteSpace: 'normal', lineHeight: 1.2 }}>
                {user?.school ? user.school.name : 'ZP School ERP'}
              </span>
              <span className="sidebar-school-name" style={{ color: 'var(--color-primary-600)', fontWeight: 600 }}>
                {user?.role === 'SUPER_ADMIN' ? 'Platform Admin' : `Digital Campus`}
              </span>
            </div>
          )}
          <button
            className="sidebar-collapse-btn"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav" role="navigation">
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-item ${isActive ? 'sidebar-item-active' : ''}`}
              title={collapsed ? item.label : undefined}
              onClick={() => setMobileOpen(false)}
            >
              <span className="sidebar-item-icon" aria-hidden="true">{item.icon}</span>
              {!collapsed && <span className="sidebar-item-label">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Platform Branding */}
        {!collapsed && (
          <div style={{ padding: 'var(--space-4)', fontSize: '0.7rem', color: 'var(--color-neutral-400)', textAlign: 'center', marginTop: 'auto' }}>
            Powered by <strong>EduVanta</strong>
          </div>
        )}
      </aside>
    </>
  );
}
