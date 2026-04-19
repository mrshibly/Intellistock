import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, AlertTriangle, ShoppingCart, BarChart3, RefreshCw, Loader2 } from 'lucide-react';
import TopBar from '../components/TopBar';
import { PageLoader } from '../components/Shared';
import api from '../api/axios';
import toast from 'react-hot-toast';

const AIInsights = () => {
  const [forecasts, setForecasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchForecasts = async () => {
    setLoading(true);
    try {
      const r = await api.get('/forecasts');
      setForecasts(r.data.data || []);
    } catch {
      // Forecasts may not be implemented yet — show empty state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchForecasts(); }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await api.post('/forecasts/generate');
      toast.success('Forecast generated');
      fetchForecasts();
    } catch {
      toast.error('Forecast generation not available yet');
    } finally {
      setGenerating(false);
    }
  };

  const insights = [
    { icon: TrendingUp, title: 'Demand Forecasting', desc: 'Predict future demand using historical sales data and seasonal patterns.', color: 'text-accent-primary', bg: 'bg-accent-light', status: forecasts.length > 0 ? 'active' : 'pending' },
    { icon: AlertTriangle, title: 'Low Stock Alerts', desc: 'Automatically detect products approaching reorder points.', color: 'text-warning', bg: 'bg-warning-light', status: 'active' },
    { icon: ShoppingCart, title: 'Reorder Suggestions', desc: 'AI-recommended purchase orders based on lead times and demand.', color: 'text-success', bg: 'bg-success-light', status: 'pending' },
    { icon: BarChart3, title: 'Trend Analysis', desc: 'Identify top-performing products and seasonal trends.', color: 'text-info', bg: 'bg-info-light', status: 'pending' },
  ];

  return (
    <div>
      <TopBar title="AI Insights" subtitle="Intelligent inventory forecasting & analysis" />
      <div className="p-6 max-w-[1400px] mx-auto space-y-6">

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-30 via-brand-30/95 to-accent-primary/80 p-8 text-white">
          <div className="absolute top-0 right-0 w-80 h-80 bg-accent-primary/10 rounded-full blur-3xl -translate-y-20 translate-x-20" />
          <div className="relative z-10 max-w-xl">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-6 h-6 text-accent-primary" />
              <span className="text-sm font-semibold text-accent-primary/80 uppercase tracking-wider">AI-Powered</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">Smart Inventory Intelligence</h2>
            <p className="text-white/70 text-sm leading-relaxed mb-5">
              Leverage machine learning to forecast demand, optimize stock levels, and automate reorder decisions. 
              Our AI engine analyzes historical data to provide actionable insights.
            </p>
            <button onClick={handleGenerate} disabled={generating} className="bg-accent-primary hover:bg-accent-hover text-white font-semibold py-2.5 px-5 rounded-xl transition-all inline-flex items-center gap-2 shadow-lg">
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Generate Forecast
            </button>
          </div>
        </motion.div>

        {/* Capability Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((item, i) => (
            <motion.div key={item.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
              className="card-hover p-5 flex items-start gap-4">
              <div className={`w-11 h-11 rounded-xl ${item.bg} flex items-center justify-center flex-shrink-0`}>
                <item.icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-bold text-text-primary">{item.title}</h3>
                  <span className={`text-[10px] font-semibold uppercase tracking-wider ${item.status === 'active' ? 'text-success' : 'text-text-muted'}`}>
                    {item.status === 'active' ? '● Active' : '○ Coming Soon'}
                  </span>
                </div>
                <p className="text-xs text-text-muted leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Forecast Results */}
        {loading ? <PageLoader /> : forecasts.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="table-container">
            <div className="px-5 py-3 border-b border-border">
              <h3 className="text-sm font-bold text-text-primary">Latest Forecasts</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="table-header">
                  <th className="text-left px-5 py-3 font-semibold text-text-secondary">Product</th>
                  <th className="text-right px-5 py-3 font-semibold text-text-secondary">Current Stock</th>
                  <th className="text-right px-5 py-3 font-semibold text-text-secondary">Predicted Demand</th>
                  <th className="text-right px-5 py-3 font-semibold text-text-secondary">Reorder Qty</th>
                  <th className="text-center px-5 py-3 font-semibold text-text-secondary">Confidence</th>
                </tr></thead>
                <tbody>{forecasts.map((f, i) => (
                  <tr key={f._id || i} className="table-row">
                    <td className="px-5 py-3.5 font-medium text-text-primary">{f.productName || f.productId?.name || '—'}</td>
                    <td className="px-5 py-3.5 text-right tabular-nums">{f.currentStock ?? '—'}</td>
                    <td className="px-5 py-3.5 text-right tabular-nums font-medium">{f.predictedDemand ?? '—'}</td>
                    <td className="px-5 py-3.5 text-right tabular-nums">
                      {f.reorderQty ? <span className="badge-warning">{f.reorderQty}</span> : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {f.confidence ? <span className="badge-success">{Math.round(f.confidence * 100)}%</span> : '—'}
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AIInsights;
