import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeftRight, Plus, ArrowDownToLine, ArrowUpFromLine,
  RotateCcw, AlertTriangle, Loader2, Filter, ChevronLeft, ChevronRight,
} from 'lucide-react';
import TopBar from '../components/TopBar';
import Modal from '../components/Modal';
import { EmptyState, PageLoader } from '../components/Shared';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const MOVEMENT_TYPES = [
  { value: 'receive', label: 'Receive', icon: ArrowDownToLine, color: 'text-success', bg: 'bg-success-light' },
  { value: 'sell', label: 'Sell', icon: ArrowUpFromLine, color: 'text-info', bg: 'bg-info-light' },
  { value: 'transfer_in', label: 'Transfer In', icon: ArrowDownToLine, color: 'text-accent-primary', bg: 'bg-accent-light' },
  { value: 'transfer_out', label: 'Transfer Out', icon: ArrowUpFromLine, color: 'text-warning', bg: 'bg-warning-light' },
  { value: 'adjust', label: 'Adjust', icon: RotateCcw, color: 'text-text-secondary', bg: 'bg-surface-hover' },
  { value: 'return', label: 'Return', icon: RotateCcw, color: 'text-info', bg: 'bg-info-light' },
  { value: 'write_off', label: 'Write Off', icon: AlertTriangle, color: 'text-danger', bg: 'bg-danger-light' },
];

const getMovementMeta = (type) => MOVEMENT_TYPES.find(m => m.value === type) || MOVEMENT_TYPES[4];

const Movements = () => {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [filterType, setFilterType] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const [form, setForm] = useState({
    productId: '', warehouseId: '', type: 'receive', quantity: '', reference: '', notes: '',
  });

  const fetchMovements = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (filterType) params.type = filterType;
      const res = await api.get('/movements', { params });
      setMovements(res.data.data || []);
      setPagination(res.data.pagination || {});
    } catch {
      toast.error('Failed to load movements');
    } finally {
      setLoading(false);
    }
  };

  const fetchLookups = async () => {
    try {
      const [prodRes, whRes] = await Promise.all([
        api.get('/products', { params: { limit: 200 } }),
        api.get('/warehouses'),
      ]);
      setProducts(prodRes.data.data || []);
      setWarehouses(whRes.data.data || []);
    } catch { /* silent */ }
  };

  useEffect(() => { fetchMovements(); }, [page, filterType]);
  useEffect(() => { fetchLookups(); }, []);

  const openCreate = () => {
    setForm({ productId: '', warehouseId: '', type: 'receive', quantity: '', reference: '', notes: '' });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/movements', {
        productId: form.productId,
        warehouseId: form.warehouseId,
        type: form.type,
        quantity: Number(form.quantity),
        reference: form.reference,
        notes: form.notes,
      });
      toast.success('Movement recorded');
      setShowModal(false);
      fetchMovements();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record movement');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  return (
    <div>
      <TopBar title="Stock Movements" subtitle="Track inventory ins and outs" />

      <div className="p-6 max-w-[1400px] mx-auto space-y-5">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-text-muted" />
            <select
              value={filterType}
              onChange={e => { setFilterType(e.target.value); setPage(1); }}
              className="input-field !w-auto !py-2 text-sm"
            >
              <option value="">All Types</option>
              {MOVEMENT_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <button onClick={openCreate} className="btn-primary">
            <Plus className="w-4 h-4" />
            Record Movement
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <PageLoader />
        ) : movements.length === 0 ? (
          <EmptyState
            icon={ArrowLeftRight}
            title="No movements found"
            description="Record your first stock movement to start tracking inventory changes."
            action={
              <button onClick={openCreate} className="btn-primary">
                <Plus className="w-4 h-4" /> Record Movement
              </button>
            }
          />
        ) : (
          <div className="table-container">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="table-header">
                    <th className="text-left px-5 py-3 font-semibold text-text-secondary">Type</th>
                    <th className="text-left px-5 py-3 font-semibold text-text-secondary">Product</th>
                    <th className="text-left px-5 py-3 font-semibold text-text-secondary">Warehouse</th>
                    <th className="text-right px-5 py-3 font-semibold text-text-secondary">Qty</th>
                    <th className="text-right px-5 py-3 font-semibold text-text-secondary">Before</th>
                    <th className="text-right px-5 py-3 font-semibold text-text-secondary">After</th>
                    <th className="text-left px-5 py-3 font-semibold text-text-secondary">Reference</th>
                    <th className="text-left px-5 py-3 font-semibold text-text-secondary">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map((mv, i) => {
                    const meta = getMovementMeta(mv.type);
                    const Icon = meta.icon;
                    return (
                      <motion.tr
                        key={mv._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.02 }}
                        className="table-row"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <span className={`w-7 h-7 rounded-lg ${meta.bg} flex items-center justify-center`}>
                              <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
                            </span>
                            <span className="font-medium text-text-primary capitalize">{meta.label}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-text-primary font-medium">
                          {mv.productId?.name || mv.productId?.sku || '—'}
                        </td>
                        <td className="px-5 py-3.5 text-text-secondary">
                          {mv.warehouseId?.name || '—'}
                        </td>
                        <td className="px-5 py-3.5 text-right font-bold tabular-nums">
                          <span className={mv.quantity >= 0 ? 'text-success' : 'text-danger'}>
                            {mv.quantity >= 0 ? '+' : ''}{mv.quantity}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right text-text-muted tabular-nums">{mv.quantityBefore}</td>
                        <td className="px-5 py-3.5 text-right text-text-primary font-medium tabular-nums">{mv.quantityAfter}</td>
                        <td className="px-5 py-3.5 text-text-muted">{mv.reference || '—'}</td>
                        <td className="px-5 py-3.5 text-text-muted text-xs">
                          {mv.createdAt ? format(new Date(mv.createdAt), 'MMM dd, HH:mm') : '—'}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-border">
                <span className="text-xs text-text-muted">
                  Page {pagination.page} of {pagination.totalPages} · {pagination.total} records
                </span>
                <div className="flex gap-1">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="btn-ghost btn-sm btn-icon">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={() => setPage(p => p + 1)} disabled={page >= pagination.totalPages} className="btn-ghost btn-sm btn-icon">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Record Movement">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-secondary">Movement Type *</label>
            <select value={form.type} onChange={e => updateField('type', e.target.value)} className="input-field">
              {MOVEMENT_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-secondary">Product *</label>
            <select required value={form.productId} onChange={e => updateField('productId', e.target.value)} className="input-field">
              <option value="">Select product...</option>
              {products.map(p => (
                <option key={p._id} value={p._id}>{p.name} ({p.sku})</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-secondary">Warehouse *</label>
            <select required value={form.warehouseId} onChange={e => updateField('warehouseId', e.target.value)} className="input-field">
              <option value="">Select warehouse...</option>
              {warehouses.map(w => (
                <option key={w._id} value={w._id}>{w.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-secondary">Quantity *</label>
              <input type="number" required min="1" value={form.quantity} onChange={e => updateField('quantity', e.target.value)} className="input-field" placeholder="0" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-secondary">Reference</label>
              <input type="text" value={form.reference} onChange={e => updateField('reference', e.target.value)} className="input-field" placeholder="PO-001, INV-123..." />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-secondary">Notes</label>
            <textarea rows={2} value={form.notes} onChange={e => updateField('notes', e.target.value)} className="input-field resize-none" placeholder="Optional notes..." />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button type="button" onClick={() => setShowModal(false)} className="btn-outline">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Record
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Movements;
