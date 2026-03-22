import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, UserCircle, Briefcase, FileText, Users, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { ThemeToggle } from './ThemeToggle';

export const Sidebar = () => {
  const { userProfile, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!userProfile) return null;

  const studentLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Profile', path: '/profile', icon: UserCircle },
    { name: 'Available Jobs', path: '/jobs', icon: Briefcase },
    { name: 'My Applications', path: '/applications', icon: FileText },
  ];

  const adminLinks = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Manage Users', path: '/admin/users', icon: Users },
    { name: 'Manage Jobs', path: '/admin/jobs', icon: Briefcase },
    { name: 'Applications', path: '/admin/applications', icon: FileText },
  ];

  const links = userProfile.role === 'admin' ? adminLinks : studentLinks;

  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-white dark:bg-dark-card rounded-lg shadow-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} className="text-slate-700 dark:text-slate-300" /> : <Menu size={24} className="text-slate-700 dark:text-slate-300" />}
      </button>

      {/* Sidebar Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-dark-card border-r border-slate-200 dark:border-dark-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col">
          {/* Logo/Brand */}
          <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-dark-border">
            <div className="flex items-center space-x-2 text-primary-600">
              <Briefcase size={28} />
              <span className="text-xl font-bold dark:text-white">Placement<span className="text-primary-600">Cell</span></span>
            </div>
          </div>

          {/* User info */}
          <div className="p-6 border-b border-slate-200 dark:border-dark-border bg-slate-50/50 dark:bg-slate-900/50">
            <p className="font-semibold text-slate-800 dark:text-white truncate">{userProfile.name}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 capitalize flex items-center mt-1">
              <span className={`w-2 h-2 rounded-full mr-2 ${userProfile.role === 'admin' ? 'bg-primary-500' : 'bg-green-500'}`}></span>
              {userProfile.role} Account
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.path === '/admin' || link.path === '/dashboard'}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                    }`
                  }
                >
                  <Icon size={20} className="mr-3 flex-shrink-0" />
                  {link.name}
                </NavLink>
              );
            })}
          </nav>

          {/* Footer Actions */}
          <div className="p-4 border-t border-slate-200 dark:border-dark-border flex items-center justify-between">
            <ThemeToggle />
            <button
              onClick={() => logout()}
              className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut size={20} className="mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
