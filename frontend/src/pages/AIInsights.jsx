import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, AlertTriangle, ShoppingCart, BarChart3, RefreshCw, Loader2, PackageCheck } from 'lucide-react';
import TopBar from '../components/TopBar';
import { PageLoader } from '../components/Shared';
import api from '../api/axios';
import toast from 'react-hot-toast';

const AIInsights = () => {
  const [forecasts, setForecasts] = useState([]);
  const [reorderPlan, setReorderPlan] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [creatingPo, setCreatingPo] = useState(null);

  const fetchForecasts = async () => {
    setLoading(true);
    try {
      const [forecastRes, reorderRes, warehouseRes] = await Promise.all([
        api.get('/forecasts'),
        api.get('/forecasts/reorder-plan'),
        api.get('/warehouses'),
      ]);
      setForecasts(forecastRes.data.data || []);
      setReorderPlan(reorderRes.data.data || []);
      setWarehouses(warehouseRes.data.data || []);
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

  const handleCreateDraftPo = async (item) => {
    const warehouse = warehouses.find((w) => w.isDefault) || warehouses[0];
    if (!warehouse) {
      toast.error('Add a warehouse before creating purchase orders');
      return;
    }
    if (!item.supplierId) {
      toast.error('Assign a supplier to this product first');
      return;
    }
    if (!item.suggestedReorderQty) {
      toast.error('No reorder quantity suggested for this product');
      return;
    }

    setCreatingPo(item.productId);
    try {
      await api.post('/purchase-orders', {
        supplierId: item.supplierId,
        warehouseId: warehouse._id,
        lineItems: [{
          productId: item.productId,
          productName: item.productName,
          sku: item.sku,
          quantity: item.suggestedReorderQty,
          unitCost: item.unitCost || 0,
        }],
        notes: `Created from reorder plan. Current stock ${item.currentStock}, reorder point ${item.reorderPoint}, 30-day demand ${item.thirtyDayDemand}.`,
      });
      toast.success('Draft purchase order created');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create purchase order');
    } finally {
      setCreatingPo(null);
    }
  };

  const insights = [
    { icon: TrendingUp, title: 'Demand Forecasting', desc: 'Predict future demand using historical sales data and seasonal patterns.', color: 'text-accent-primary', bg: 'bg-accent-light', status: forecasts.length > 0 ? 'active' : 'pending' },
    { icon: AlertTriangle, title: 'Low Stock Alerts', desc: 'Automatically detect products approaching reorder points.', color: 'text-warning', bg: 'bg-warning-light', status: 'active' },
    { icon: ShoppingCart, title: 'Reorder Suggestions', desc: 'AI-recommended purchase orders based on lead times and demand.', color: 'text-success', bg: 'bg-success-light', status: 'active' },
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

        {/* Reorder Plan */}
        {loading ? <PageLoader /> : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="table-container">
            <div className="px-5 py-3 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-text-primary">Reorder Plan</h3>
                <p className="text-xs text-text-muted">Forecasted stock risk from recent outbound movement, supplier lead time, and reorder rules.</p>
              </div>
              <span className="badge-info">{reorderPlan.length} recommendations</span>
            </div>
            {reorderPlan.length === 0 ? (
              <div className="p-8 text-center text-sm text-text-muted">
                No reorder risks found. Products with healthy stock stay boring, which is the point.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="table-header">
                    <th className="text-left px-5 py-3 font-semibold text-text-secondary">Product</th>
                    <th className="text-left px-5 py-3 font-semibold text-text-secondary">Supplier</th>
                    <th className="text-right px-5 py-3 font-semibold text-text-secondary">Stock</th>
                    <th className="text-right px-5 py-3 font-semibold text-text-secondary">30d Demand</th>
                    <th className="text-right px-5 py-3 font-semibold text-text-secondary">Days Until Reorder</th>
                    <th className="text-right px-5 py-3 font-semibold text-text-secondary">Suggested Qty</th>
                    <th className="text-center px-5 py-3 font-semibold text-text-secondary">Status</th>
                    <th className="text-right px-5 py-3 font-semibold text-text-secondary">Action</th>
                  </tr></thead>
                  <tbody>{reorderPlan.map((item) => (
                    <tr key={item.productId} className="table-row">
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-text-primary">{item.productName}</div>
                        <div className="text-xs text-text-muted">{item.sku}</div>
                      </td>
                      <td className="px-5 py-3.5 text-text-secondary">{item.supplierName}</td>
                      <td className="px-5 py-3.5 text-right tabular-nums">{item.currentStock} / {item.reorderPoint}</td>
                      <td className="px-5 py-3.5 text-right tabular-nums">{item.thirtyDayDemand}</td>
                      <td className="px-5 py-3.5 text-right tabular-nums">{item.daysUntilReorder ?? 'No demand'}</td>
                      <td className="px-5 py-3.5 text-right tabular-nums font-semibold">{item.suggestedReorderQty}</td>
                      <td className="px-5 py-3.5 text-center">
                        <span className={item.status === 'critical' ? 'badge-danger' : item.status === 'order_soon' ? 'badge-warning' : 'badge-success'}>
                          {item.status === 'critical' ? 'Critical' : item.status === 'order_soon' ? 'Order soon' : 'Healthy'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => handleCreateDraftPo(item)}
                          disabled={creatingPo === item.productId || !item.supplierId || !item.suggestedReorderQty}
                          className="btn-primary py-1.5 px-3 text-xs"
                        >
                          {creatingPo === item.productId ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PackageCheck className="w-3.5 h-3.5" />}
                          Draft PO
                        </button>
                      </td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {/* Forecast Results */}
        {!loading && forecasts.length > 0 && (
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
