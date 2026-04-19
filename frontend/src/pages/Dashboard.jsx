import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Package, TrendingUp, AlertTriangle, ArrowRight, ArrowDownLeft,
  ArrowUpRight, RotateCcw, Sparkles, BarChart3, Loader2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import TopBar from '../components/TopBar';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import AIInsights from '../components/dashboard/AIInsights';
import DemandForecast from '../components/dashboard/DemandForecast';
import AIChatAssistant from '../components/dashboard/AIChatAssistant';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' }
  }),
};

const StatCard = ({ title, value, icon: Icon, color, bgColor, change, index }) => (
  <motion.div
    custom={index}
    variants={fadeUp}
    initial="hidden"
    animate="visible"
    className="stat-card"
  >
    <div className={`p-3 rounded-xl ${bgColor}`}>
      <Icon className={`w-5 h-5 ${color}`} />
    </div>
    <div className="flex-1">
      <p className="text-sm font-medium text-text-muted">{title}</p>
      <h3 className="text-2xl font-bold text-text-primary mt-0.5">{value}</h3>
      {change && (
        <p className={`text-xs mt-1 font-medium ${change > 0 ? 'text-success' : 'text-danger'}`}>
          {change > 0 ? '+' : ''}{change}% from last month
        </p>
      )}
    </div>
  </motion.div>
);

const MovementTypeIcon = ({ type }) => {
  const icons = {
    receive: { icon: ArrowDownLeft, color: 'text-success', bg: 'bg-success-light' },
    sell: { icon: ArrowUpRight, color: 'text-danger', bg: 'bg-danger-light' },
    transfer_in: { icon: ArrowDownLeft, color: 'text-info', bg: 'bg-info-light' },
    transfer_out: { icon: ArrowUpRight, color: 'text-warning', bg: 'bg-warning-light' },
    adjust: { icon: RotateCcw, color: 'text-text-secondary', bg: 'bg-surface-hover' },
    return: { icon: RotateCcw, color: 'text-info', bg: 'bg-info-light' },
    write_off: { icon: AlertTriangle, color: 'text-danger', bg: 'bg-danger-light' },
  };
  const { icon: I, color, bg } = icons[type] || icons.adjust;
  return (
    <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}>
      <I className={`w-4 h-4 ${color}`} />
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ products: 0, lowStock: 0, movements: 0, warehouses: 0 });
  const [recentMovements, setRecentMovements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock chart data
  const chartData = [
    { name: 'Mon', value: 42 },
    { name: 'Tue', value: 65 },
    { name: 'Wed', value: 38 },
    { name: 'Thu', value: 89 },
    { name: 'Fri', value: 72 },
    { name: 'Sat', value: 45 },
    { name: 'Sun', value: 56 },
  ];

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [productsRes, movementsRes, warehousesRes] = await Promise.allSettled([
          api.get('/products', { params: { limit: 1 } }),
          api.get('/movements', { params: { limit: 5 } }),
          api.get('/warehouses'),
        ]);

        if (productsRes.status === 'fulfilled') {
          const prodData = productsRes.value.data;
          setStats(prev => ({
            ...prev,
            products: prodData.total || prodData.data?.length || 0,
          }));
        }

        if (movementsRes.status === 'fulfilled') {
          const movData = movementsRes.value.data;
          setRecentMovements(movData.data || []);
          setStats(prev => ({
            ...prev,
            movements: movData.total || movData.data?.length || 0,
          }));
        }

        if (warehousesRes.status === 'fulfilled') {
          const whData = warehousesRes.value.data;
          setStats(prev => ({
            ...prev,
            warehouses: whData.data?.length || 0,
          }));
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <div>
      <TopBar
        title={`Welcome back, ${user?.firstName || 'User'}`}
        subtitle="Here's what's happening with your inventory today."
      />

      <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Products"
            value={loading ? '...' : stats.products.toLocaleString()}
            icon={Package}
            color="text-accent-primary"
            bgColor="bg-accent-light"
            change={12}
            index={0}
          />
          <StatCard
            title="Warehouses"
            value={loading ? '...' : stats.warehouses}
            icon={TrendingUp}
            color="text-success"
            bgColor="bg-success-light"
            change={3}
            index={1}
          />
          <StatCard
            title="Low Stock Items"
            value={loading ? '...' : stats.lowStock}
            icon={AlertTriangle}
            color="text-warning"
            bgColor="bg-warning-light"
            index={2}
          />
          <StatCard
            title="Total Movements"
            value={loading ? '...' : stats.movements.toLocaleString()}
            icon={BarChart3}
            color="text-info"
            bgColor="bg-info-light"
            change={8}
            index={3}
          />
        </div>

        {/* Charts & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stock Movement Chart */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="lg:col-span-2 card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-text-primary">Stock Movements</h3>
                <p className="text-sm text-text-muted mt-0.5">Last 7 days overview</p>
              </div>
              <div className="flex gap-2">
                <button className="btn-ghost btn-sm text-xs">Week</button>
                <button className="btn-ghost btn-sm text-xs bg-surface-hover">Month</button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.07)',
                    fontSize: '13px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#0ea5e9"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Recent Movements */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-text-primary">Recent Activity</h3>
              <button
                onClick={() => navigate('/movements')}
                className="text-accent-primary text-sm font-semibold flex items-center gap-1 hover:underline"
              >
                View All <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-accent-primary" />
                </div>
              ) : recentMovements.length === 0 ? (
                <p className="text-sm text-text-muted text-center py-8">
                  No recent movements yet.
                </p>
              ) : (
                recentMovements.slice(0, 5).map((m, i) => (
                  <div key={m._id || i} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-surface-hover transition-colors">
                    <MovementTypeIcon type={m.type} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-text-primary truncate">
                        {m.productId?.name || 'Product'}
                      </p>
                      <p className="text-xs text-text-muted capitalize">
                        {m.type?.replace('_', ' ')} • {m.warehouseId?.name || 'Warehouse'}
                      </p>
                    </div>
                    <p className={`text-sm font-bold ${m.type === 'sell' || m.type === 'transfer_out' || m.type === 'write_off' ? 'text-danger' : 'text-success'}`}>
                      {m.type === 'sell' || m.type === 'transfer_out' || m.type === 'write_off' ? '-' : '+'}{Math.abs(m.quantity)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>

        {/* AI Insights & Forecasting Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AIInsights />
          <div className="space-y-6">
            <DemandForecast productId={recentMovements[0]?.productId?._id} />
            <div className="card bg-brand-30 p-6 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent-primary/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-accent-primary" />
                  <h3 className="text-base font-bold text-white">Stock Optimization</h3>
                </div>
                <p className="text-sm text-slate-400 mb-5">
                  Our AI is analyzing {stats.products} products to find dead stock and optimize your capital.
                </p>
                <button
                  onClick={() => navigate('/ai-insights')}
                  className="btn-primary"
                >
                  View Full Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <AIChatAssistant />
    </div>
  );
};

export default Dashboard;
