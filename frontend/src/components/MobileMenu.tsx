import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  user: any;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, onLogout, user }) => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const linkClass = (path: string) => `
    block px-4 py-3 text-base font-medium rounded-md transition-colors
    ${isActive(path) 
      ? 'bg-indigo-700 text-white' 
      : 'text-white hover:bg-indigo-700'
    }
  `;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Slide-out Menu */}
      <div className="fixed inset-y-0 left-0 w-64 bg-indigo-600 shadow-xl z-50 lg:hidden transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-indigo-700">
            <h2 className="text-xl font-bold text-white">LexNotar</h2>
            <button 
              onClick={onClose}
              className="text-white hover:bg-indigo-700 p-2 rounded-md"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
            <Link to="/dashboard" className={linkClass('/dashboard')} onClick={onClose}>
              📊 Dashboard
            </Link>
            <Link to="/cases" className={linkClass('/cases')} onClick={onClose}>
              📁 Cases
            </Link>
            <Link to="/clients" className={linkClass('/clients')} onClick={onClose}>
              👥 Clients
            </Link>
            <Link to="/tasks" className={linkClass('/tasks')} onClick={onClose}>
              ✓ Tasks
            </Link>
            <Link to="/documents" className={linkClass('/documents')} onClick={onClose}>
              📄 Documents
            </Link>
            <Link to="/calendar" className={linkClass('/calendar')} onClick={onClose}>
              📅 Calendar
            </Link>
            {user?.role === 'ADMIN' && (
              <Link to="/users" className={linkClass('/users')} onClick={onClose}>
                👤 Users
              </Link>
            )}
            <Link to="/templates" className={linkClass('/templates')} onClick={onClose}>
              📝 Templates
            </Link>
            <Link to="/reports" className={linkClass('/reports')} onClick={onClose}>
              📊 Reports
            </Link>
            {(user?.role === 'ADMIN' || user?.role === 'NOTAR') && (
              <Link to="/audit-logs" className={linkClass('/audit-logs')} onClick={onClose}>
                📜 Audit Logs
              </Link>
            )}
          </nav>

          {/* User Info & Logout */}
          <div className="border-t border-indigo-700 px-4 py-4">
            <div className="mb-3">
              <p className="text-sm text-white font-medium">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-indigo-200">{user?.role}</p>
            </div>
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full bg-indigo-700 hover:bg-indigo-800 px-4 py-2 rounded-md text-sm font-medium text-white"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
