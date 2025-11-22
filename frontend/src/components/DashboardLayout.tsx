import React, { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GlobalSearch } from './GlobalSearch';
import { MobileMenu } from './MobileMenu';
import { NotificationBell } from './NotificationBell';
import { ThemeToggle } from './ThemeToggle';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navigation = [
    { name: t('navigation.dashboard'), path: '/dashboard', icon: '📊' },
    { name: t('navigation.cases'), path: '/cases', icon: '📁' },
    { name: t('navigation.clients'), path: '/clients', icon: '👥' },
    { name: t('navigation.documents'), path: '/documents', icon: '📄' },
    { name: t('navigation.calendar'), path: '/calendar', icon: '📅' },
    { name: t('navigation.tasks'), path: '/tasks', icon: '✓' },
    { name: t('navigation.reports'), path: '/reports', icon: '📊' },
    { name: t('navigation.settings'), path: '/settings', icon: '⚙️' },
  ];

  if (user?.role === 'ADMIN') {
    navigation.push({ name: 'Users', path: '/users', icon: '👤' });
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <aside className={`${isSidebarCollapsed ? 'w-20' : 'w-64'} bg-gray-800 text-white transition-all duration-300 hidden lg:flex flex-col`}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 bg-gray-900">
          {!isSidebarCollapsed && <h1 className="text-xl font-bold">LexNotar</h1>}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-2 rounded hover:bg-gray-700"
          >
            {isSidebarCollapsed ? '→' : '←'}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {navigation.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center px-4 py-3 hover:bg-gray-700 transition-colors"
            >
              <span className="text-xl">{item.icon}</span>
              {!isSidebarCollapsed && <span className="ml-3">{item.name}</span>}
            </Link>
          ))}
        </nav>

        {/* User Profile */}
        <div className="border-t border-gray-700 p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            {!isSidebarCollapsed && (
              <div className="ml-3">
                <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-gray-400">{user?.role}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="mt-4 w-full py-2 bg-red-600 hover:bg-red-700 rounded transition-colors"
          >
            {!isSidebarCollapsed ? 'Logout' : '🚪'}
          </button>
        </div>
      </aside>
      {/* Mobile Menu */}
      <MobileMenu 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onLogout={handleLogout}
        user={user}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm h-16 flex items-center justify-between px-4">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-md"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-4">
            <GlobalSearch />
          </div>

          {/* Right Icons */}
          <div className="flex items-center space-x-3">
            <LanguageSwitcher />
            <ThemeToggle />
            <NotificationBell />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
