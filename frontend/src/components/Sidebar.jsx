import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  Warehouse,
  ArrowLeftRight,
  Truck,
  FileText,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Products', icon: Package, path: '/products' },
  { label: 'Warehouses', icon: Warehouse, path: '/warehouses' },
  { label: 'Movements', icon: ArrowLeftRight, path: '/movements' },
  { label: 'Suppliers', icon: Truck, path: '/suppliers' },
  { label: 'Purchase Orders', icon: FileText, path: '/purchase-orders' },
  { label: 'AI Insights', icon: Sparkles, path: '/ai-insights' },
];

const bottomItems = [
  { label: 'Settings', icon: Settings, path: '/settings' },
];

const Sidebar = ({ collapsed, onToggle }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="h-screen bg-surface border-r border-border flex flex-col fixed left-0 top-0 z-40"
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-border gap-3">
        <img src="/logo.png" alt="Intellistock" className="w-8 h-8 object-contain flex-shrink-0" />
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-lg font-bold text-brand-30 tracking-tight whitespace-nowrap"
          >
            intellistock
          </motion.span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive ? 'sidebar-link-active' : 'sidebar-link'
            }
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && (
              <span className="whitespace-nowrap">{item.label}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="border-t border-border py-3 px-3 space-y-1">
        {bottomItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive ? 'sidebar-link-active' : 'sidebar-link'
            }
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
          </NavLink>
        ))}

        <button
          onClick={handleLogout}
          className="sidebar-link w-full text-danger hover:bg-danger-light hover:text-danger"
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>

        {/* Collapse Toggle */}
        <button
          onClick={onToggle}
          className="sidebar-link w-full mt-2"
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5 flex-shrink-0" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5 flex-shrink-0" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
