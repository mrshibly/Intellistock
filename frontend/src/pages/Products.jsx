import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, Plus, Search, Filter, Edit2, Trash2, Eye,
  ChevronLeft, ChevronRight, X, Loader2, Download, Upload,
} from 'lucide-react';
import TopBar from '../components/TopBar';
import Modal from '../components/Modal';
import { EmptyState, PageLoader, ConfirmDialog } from '../components/Shared';
import api from '../api/axios';
import toast from 'react-hot-toast';

const UNITS = ['pcs', 'kg', 'g', 'l', 'ml', 'm', 'box', 'set'];

const defaultForm = {
  name: '', sku: '', description: '', unit: 'pcs',
  costPrice: '', sellingPrice: '', barcode: '',
  reorderPoint: '10', reorderQty: '50', tags: '',
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [suppliers, setSuppliers] = useState([]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products', {
        params: { page, limit: 10, search: search || undefined },
      });
      const d = res.data;
      setProducts(d.data || []);
      setTotal(d.total || d.data?.length || 0);
      setTotalPages(d.totalPages || Math.ceil((d.total || 0) / 10) || 1);
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await api.get('/suppliers');
      setSuppliers(res.data.data || []);
    } catch {}
  };

  useEffect(() => {
    fetchProducts();
  }, [page]);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      fetchProducts();
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const openCreate = () => {
    setEditingProduct(null);
    setForm(defaultForm);
    setShowModal(true);
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name || '',
      sku: product.sku || '',
      description: product.description || '',
      unit: product.unit || 'pcs',
      costPrice: product.costPrice?.toString() || '',
      sellingPrice: product.sellingPrice?.toString() || '',
      barcode: product.barcode || '',
      reorderPoint: product.reorderPoint?.toString() || '10',
      reorderQty: product.reorderQty?.toString() || '50',
      tags: product.tags?.join(', ') || '',
      supplierId: product.supplierId || '',
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = {
        ...form,
        costPrice: parseFloat(form.costPrice),
        sellingPrice: parseFloat(form.sellingPrice),
        reorderPoint: parseInt(form.reorderPoint) || 0,
        reorderQty: parseInt(form.reorderQty) || 0,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      };

      if (editingProduct) {
        await api.patch(`/products/${editingProduct._id}`, body);
        toast.success('Product updated');
      } else {
        await api.post('/products', body);
        toast.success('Product created');
      }

      setShowModal(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/products/${deleteTarget._id}`);
      toast.success('Product deleted');
      setDeleteTarget(null);
      fetchProducts();
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  const updateField = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  return (
    <div>
      <TopBar title="Products" subtitle={`${total} total products`} />

      <div className="p-6 max-w-[1400px] mx-auto space-y-5">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search products by name, SKU..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field input-with-icon"
            />
          </div>
          <button onClick={openCreate} className="btn-primary">
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <PageLoader />
        ) : products.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No products yet"
            description="Add your first product to start tracking inventory."
            action={
              <button onClick={openCreate} className="btn-primary">
                <Plus className="w-4 h-4" />
                Add Product
              </button>
            }
          />
        ) : (
          <div className="table-container overflow-x-auto">
            <table className="w-full">
              <thead className="table-header">
                <tr>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-text-muted uppercase tracking-wider">Product</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-text-muted uppercase tracking-wider">SKU</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-text-muted uppercase tracking-wider">Unit</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-text-muted uppercase tracking-wider">Cost</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-text-muted uppercase tracking-wider">Price</th>
                  <th className="text-center px-5 py-3.5 text-xs font-semibold text-text-muted uppercase tracking-wider">Reorder</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-text-muted uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, i) => (
                  <motion.tr
                    key={product._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="table-row"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-accent-light flex items-center justify-center flex-shrink-0">
                          <Package className="w-4 h-4 text-accent-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-text-primary truncate">{product.name}</p>
                          {product.tags?.length > 0 && (
                            <div className="flex gap-1 mt-0.5">
                              {product.tags.slice(0, 2).map(tag => (
                                <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-surface-hover text-text-muted">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-text-secondary font-mono">{product.sku}</td>
                    <td className="px-5 py-3.5 text-sm text-text-secondary capitalize">{product.unit}</td>
                    <td className="px-5 py-3.5 text-sm text-text-secondary text-right">${product.costPrice?.toFixed(2)}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-text-primary text-right">${product.sellingPrice?.toFixed(2)}</td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="text-sm text-text-muted">{product.reorderPoint}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(product)}
                          className="p-2 rounded-lg hover:bg-surface-hover text-text-muted hover:text-text-primary transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(product)}
                          className="p-2 rounded-lg hover:bg-danger-light text-text-muted hover:text-danger transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3.5 border-t border-border">
                <p className="text-sm text-text-muted">
                  Showing {(page - 1) * 10 + 1}-{Math.min(page * 10, total)} of {total}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="btn-ghost btn-sm btn-icon disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`btn-sm min-w-[32px] rounded-lg text-sm font-medium ${
                        p === page
                          ? 'bg-accent-primary text-white'
                          : 'btn-ghost'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="btn-ghost btn-sm btn-icon disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingProduct ? 'Edit Product' : 'Add Product'}
        size="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-secondary">Name *</label>
              <input
                type="text" required value={form.name}
                onChange={e => updateField('name', e.target.value)}
                className="input-field" placeholder="Product name"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-secondary">SKU *</label>
              <input
                type="text" required value={form.sku}
                onChange={e => updateField('sku', e.target.value)}
                className="input-field" placeholder="SKU-001"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-secondary">Unit *</label>
              <select
                value={form.unit}
                onChange={e => updateField('unit', e.target.value)}
                className="input-field"
              >
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-secondary">Barcode</label>
              <input
                type="text" value={form.barcode}
                onChange={e => updateField('barcode', e.target.value)}
                className="input-field" placeholder="Barcode (optional)"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-secondary">Cost Price *</label>
              <input
                type="number" step="0.01" min="0" required value={form.costPrice}
                onChange={e => updateField('costPrice', e.target.value)}
                className="input-field" placeholder="0.00"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-secondary">Selling Price *</label>
              <input
                type="number" step="0.01" min="0" required value={form.sellingPrice}
                onChange={e => updateField('sellingPrice', e.target.value)}
                className="input-field" placeholder="0.00"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-secondary">Reorder Point</label>
              <input
                type="number" min="0" value={form.reorderPoint}
                onChange={e => updateField('reorderPoint', e.target.value)}
                className="input-field" placeholder="10"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-secondary">Reorder Qty</label>
              <input
                type="number" min="0" value={form.reorderQty}
                onChange={e => updateField('reorderQty', e.target.value)}
                className="input-field" placeholder="50"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-secondary">Description</label>
            <textarea
              value={form.description}
              onChange={e => updateField('description', e.target.value)}
              className="input-field min-h-[80px] resize-none"
              placeholder="Product description (optional)"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-secondary">Tags (comma separated)</label>
            <input
              type="text" value={form.tags}
              onChange={e => updateField('tags', e.target.value)}
              className="input-field" placeholder="electronics, new arrival"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button type="button" onClick={() => setShowModal(false)} className="btn-outline">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {editingProduct ? 'Update' : 'Create'} Product
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default Products;
