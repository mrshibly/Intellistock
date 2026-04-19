import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-brand-60">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main
        className="flex-1 transition-all duration-200"
        style={{ marginLeft: collapsed ? 72 : 260 }}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
