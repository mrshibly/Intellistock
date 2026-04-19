import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, User, ChevronDown, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const TopBar = ({ title, subtitle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`
    : 'U';

  return (
    <header className="h-16 bg-surface/80 backdrop-blur-md border-b border-border flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Left: Title */}
      <div>
        <h1 className="text-xl font-bold text-text-primary leading-tight">{title}</h1>
        {subtitle && (
          <p className="text-sm text-text-muted">{subtitle}</p>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search..."
            className="input-field input-with-icon w-64 py-2 text-sm"
          />
        </div>

        {/* Notifications */}
        <button className="btn-ghost btn-icon relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full" />
        </button>

        {/* User Menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2.5 pl-3 pr-2 py-1.5 rounded-xl hover:bg-surface-hover transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-accent-primary/10 flex items-center justify-center">
              <span className="text-sm font-bold text-accent-primary">{initials}</span>
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-semibold text-text-primary leading-tight">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-text-muted capitalize">{user?.role || 'User'}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-text-muted" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 w-56 card shadow-lg py-2 animate-scale-in z-50">
              <button
                onClick={() => { navigate('/settings'); setShowDropdown(false); }}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-secondary hover:bg-surface-hover w-full transition-colors"
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
              <hr className="my-1 border-border" />
              <button
                onClick={handleLogout}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-danger hover:bg-danger-light w-full transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
