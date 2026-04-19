import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Plus, Eye, Send, ArrowDownToLine, Loader2, ChevronDown } from 'lucide-react';
import TopBar from '../components/TopBar';
import Modal from '../components/Modal';
import { EmptyState, PageLoader } from '../components/Shared';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const STATUS_MAP = {
  draft: { label:'Draft', cls:'badge-neutral' },
  sent: { label:'Sent', cls:'badge-info' },
  acknowledged: { label:'Acknowledged', cls:'badge-info' },
  partially_received: { label:'Partial', cls:'badge-warning' },
  received: { label:'Received', cls:'badge-success' },
  cancelled: { label:'Cancelled', cls:'badge-danger' },
};

const PurchaseOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [saving, setSaving] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);

  const [form, setForm] = useState({
    supplierId:'', warehouseId:'', expectedDelivery:'', notes:'',
    lineItems:[{ productId:'', quantity:1, unitCost:0 }],
  });

  const fetchOrders = async () => {
    setLoading(true);
    try { const r = await api.get('/purchase-orders'); setOrders(r.data.data||[]); }
    catch { toast.error('Failed to load orders'); }
    finally { setLoading(false); }
  };

  const fetchLookups = async () => {
    try {
      const [s,w,p] = await Promise.all([api.get('/suppliers'), api.get('/warehouses'), api.get('/products',{params:{limit:200}})]);
      setSuppliers(s.data.data||[]); setWarehouses(w.data.data||[]); setProducts(p.data.data||[]);
    } catch {}
  };

  useEffect(() => { fetchOrders(); fetchLookups(); }, []);

  const openCreate = () => {
    setForm({ supplierId:'', warehouseId:'', expectedDelivery:'', notes:'', lineItems:[{productId:'',quantity:1,unitCost:0}] });
    setShowCreate(true);
  };

  const addLine = () => setForm(p=>({...p, lineItems:[...p.lineItems, {productId:'',quantity:1,unitCost:0}]}));
  const removeLine = (idx) => setForm(p=>({...p, lineItems:p.lineItems.filter((_,i)=>i!==idx)}));
  const updateLine = (idx,k,v) => setForm(p=>({...p, lineItems:p.lineItems.map((l,i)=>i===idx?{...l,[k]:v}:l)}));

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const items = form.lineItems.map(l => {
        const prod = products.find(p=>p._id===l.productId);
        return { productId:l.productId, productName:prod?.name||'', sku:prod?.sku||'', quantity:Number(l.quantity), unitCost:Number(l.unitCost) };
      });
      const total = items.reduce((s,i)=>s+i.quantity*i.unitCost, 0);
      await api.post('/purchase-orders', {
        supplierId:form.supplierId, warehouseId:form.warehouseId,
        lineItems:items, totalAmount:total, expectedDelivery:form.expectedDelivery||undefined, notes:form.notes,
      });
      toast.success('Purchase order created'); setShowCreate(false); fetchOrders();
    } catch(err) { toast.error(err.response?.data?.message||'Failed to create PO'); }
    finally { setSaving(false); }
  };

  const handleSend = async (id) => {
    try { await api.patch(`/purchase-orders/${id}/send`); toast.success('PO sent'); fetchOrders(); }
    catch { toast.error('Failed to send PO'); }
  };

  const handleReceive = async (id) => {
    try { await api.patch(`/purchase-orders/${id}/receive`, { lineItems:[] }); toast.success('PO received'); fetchOrders(); setShowDetail(null); }
    catch { toast.error('Failed to receive PO'); }
  };

  const total = form.lineItems.reduce((s,l)=>s+Number(l.quantity)*Number(l.unitCost),0);

  return (
    <div>
      <TopBar title="Purchase Orders" subtitle="Manage procurement from suppliers" />
      <div className="p-6 max-w-[1400px] mx-auto space-y-5">
        <div className="flex justify-between items-center">
          <div />
          <button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" />Create PO</button>
        </div>

        {loading ? <PageLoader /> : orders.length===0 ? (
          <EmptyState icon={FileText} title="No purchase orders" description="Create your first purchase order to start procurement." action={<button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" />Create PO</button>} />
        ) : (
          <div className="table-container"><div className="overflow-x-auto"><table className="w-full text-sm">
            <thead><tr className="table-header">
              <th className="text-left px-5 py-3 font-semibold text-text-secondary">PO #</th>
              <th className="text-left px-5 py-3 font-semibold text-text-secondary">Supplier</th>
              <th className="text-left px-5 py-3 font-semibold text-text-secondary">Warehouse</th>
              <th className="text-center px-5 py-3 font-semibold text-text-secondary">Items</th>
              <th className="text-right px-5 py-3 font-semibold text-text-secondary">Total</th>
              <th className="text-center px-5 py-3 font-semibold text-text-secondary">Status</th>
              <th className="text-left px-5 py-3 font-semibold text-text-secondary">Expected</th>
              <th className="text-right px-5 py-3 font-semibold text-text-secondary">Actions</th>
            </tr></thead>
            <tbody>{orders.map((po,i)=>{
              const st = STATUS_MAP[po.status]||STATUS_MAP.draft;
              return (
                <motion.tr key={po._id} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:i*0.02}} className="table-row">
                  <td className="px-5 py-3.5 font-bold text-accent-primary">{po.poNumber}</td>
                  <td className="px-5 py-3.5 text-text-primary font-medium">{po.supplierId?.name||'—'}</td>
                  <td className="px-5 py-3.5 text-text-secondary">{po.warehouseId?.name||'—'}</td>
                  <td className="px-5 py-3.5 text-center text-text-muted">{po.lineItems?.length||0}</td>
                  <td className="px-5 py-3.5 text-right font-bold tabular-nums">${po.totalAmount?.toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-center"><span className={st.cls}>{st.label}</span></td>
                  <td className="px-5 py-3.5 text-text-muted text-xs">{po.expectedDelivery ? format(new Date(po.expectedDelivery),'MMM dd, yyyy') : '—'}</td>
                  <td className="px-5 py-3.5"><div className="flex justify-end gap-1">
                    <button onClick={()=>setShowDetail(po)} className="p-1.5 rounded-lg hover:bg-surface-hover text-text-muted hover:text-text-primary transition-colors"><Eye className="w-3.5 h-3.5" /></button>
                    {po.status==='draft' && <button onClick={()=>handleSend(po._id)} className="p-1.5 rounded-lg hover:bg-accent-light text-text-muted hover:text-accent-primary transition-colors" title="Send"><Send className="w-3.5 h-3.5" /></button>}
                    {['sent','acknowledged','partially_received'].includes(po.status) && <button onClick={()=>handleReceive(po._id)} className="p-1.5 rounded-lg hover:bg-success-light text-text-muted hover:text-success transition-colors" title="Receive"><ArrowDownToLine className="w-3.5 h-3.5" /></button>}
                  </div></td>
                </motion.tr>
              );
            })}</tbody>
          </table></div></div>
        )}
      </div>

      {/* Create PO Modal */}
      <Modal isOpen={showCreate} onClose={()=>setShowCreate(false)} title="Create Purchase Order" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><label className="text-sm font-medium text-text-secondary">Supplier *</label>
              <select required value={form.supplierId} onChange={e=>setForm(p=>({...p,supplierId:e.target.value}))} className="input-field">
                <option value="">Select supplier...</option>
                {suppliers.map(s=><option key={s._id} value={s._id}>{s.name}</option>)}
              </select></div>
            <div className="space-y-1.5"><label className="text-sm font-medium text-text-secondary">Warehouse *</label>
              <select required value={form.warehouseId} onChange={e=>setForm(p=>({...p,warehouseId:e.target.value}))} className="input-field">
                <option value="">Select warehouse...</option>
                {warehouses.map(w=><option key={w._id} value={w._id}>{w.name}</option>)}
              </select></div>
          </div>
          <div className="space-y-1.5"><label className="text-sm font-medium text-text-secondary">Expected Delivery</label>
            <input type="date" value={form.expectedDelivery} onChange={e=>setForm(p=>({...p,expectedDelivery:e.target.value}))} className="input-field" /></div>

          <div className="space-y-2">
            <div className="flex justify-between items-center"><label className="text-sm font-bold text-text-primary">Line Items</label>
              <button type="button" onClick={addLine} className="text-xs text-accent-primary hover:underline">+ Add Item</button></div>
            {form.lineItems.map((l,idx)=>(
              <div key={idx} className="flex gap-2 items-end">
                <div className="flex-1"><select required value={l.productId} onChange={e=>updateLine(idx,'productId',e.target.value)} className="input-field text-xs">
                  <option value="">Product...</option>
                  {products.map(p=><option key={p._id} value={p._id}>{p.name} ({p.sku})</option>)}
                </select></div>
                <div className="w-20"><input type="number" min="1" required value={l.quantity} onChange={e=>updateLine(idx,'quantity',e.target.value)} className="input-field text-xs" placeholder="Qty" /></div>
                <div className="w-24"><input type="number" min="0" step="0.01" required value={l.unitCost} onChange={e=>updateLine(idx,'unitCost',e.target.value)} className="input-field text-xs" placeholder="Cost" /></div>
                {form.lineItems.length>1 && <button type="button" onClick={()=>removeLine(idx)} className="text-danger text-xs hover:underline pb-2.5">✕</button>}
              </div>
            ))}
            <div className="text-right text-sm font-bold text-text-primary">Total: ${total.toFixed(2)}</div>
          </div>

          <div className="space-y-1.5"><label className="text-sm font-medium text-text-secondary">Notes</label>
            <textarea rows={2} value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} className="input-field resize-none" /></div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button type="button" onClick={()=>setShowCreate(false)} className="btn-outline">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving&&<Loader2 className="w-4 h-4 animate-spin" />}Create PO</button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={!!showDetail} onClose={()=>setShowDetail(null)} title={`PO ${showDetail?.poNumber||''}`}>
        {showDetail && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-text-muted">Supplier:</span> <span className="font-medium">{showDetail.supplierId?.name}</span></div>
              <div><span className="text-text-muted">Warehouse:</span> <span className="font-medium">{showDetail.warehouseId?.name}</span></div>
              <div><span className="text-text-muted">Status:</span> <span className={STATUS_MAP[showDetail.status]?.cls}>{STATUS_MAP[showDetail.status]?.label}</span></div>
              <div><span className="text-text-muted">Total:</span> <span className="font-bold">${showDetail.totalAmount?.toLocaleString()}</span></div>
            </div>
            <div className="border-t border-border pt-3">
              <h4 className="text-sm font-bold text-text-primary mb-2">Line Items</h4>
              <div className="space-y-2">{showDetail.lineItems?.map((li,i)=>(
                <div key={i} className="flex justify-between items-center text-sm bg-surface-muted rounded-lg px-3 py-2">
                  <div><span className="font-medium">{li.productName}</span> <span className="text-text-muted">({li.sku})</span></div>
                  <div className="text-right"><span className="text-text-muted">{li.quantity} × ${li.unitCost}</span> = <span className="font-bold">${(li.quantity*li.unitCost).toFixed(2)}</span></div>
                </div>
              ))}</div>
            </div>
            {showDetail.notes && <div className="text-sm text-text-muted"><span className="font-medium">Notes:</span> {showDetail.notes}</div>}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PurchaseOrders;
