import React, { useState, useEffect } from 'react';
import { Package, Plus } from 'lucide-react';
import DataTable from '../components/layout/DataTable';
import Modal from '../components/layout/Modal';
import { api } from '../services/api';
import type { InventoryItem } from '../types';
import toast from 'react-hot-toast';

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', category: '', quantity: '', unitPrice: '', location: '', supplier: '', reorderLevel: '10' });

  useEffect(() => { loadData(); }, []);
  const loadData = async () => { try { const d = await api.get('/inventory'); setItems(d); } catch { setItems([]); } };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await api.post('/inventory', { ...form, quantity: parseInt(form.quantity), unitPrice: parseFloat(form.unitPrice), reorderLevel: parseInt(form.reorderLevel) }); toast.success('Item added'); loadData(); setModalOpen(false); }
    catch (err) { toast.error(err instanceof Error ? err.message : 'Failed'); }
  };

  const columns = [
    { key: 'name', label: 'Item Name' }, { key: 'category', label: 'Category' },
    { key: 'quantity', label: 'Qty' }, { key: 'unitPrice', label: 'Unit Price', render: (i: InventoryItem) => `$${i.unitPrice.toFixed(2)}` },
    { key: 'totalValue', label: 'Total Value', render: (i: InventoryItem) => `$${i.totalValue.toFixed(2)}` },
    { key: 'status', label: 'Status', render: (i: InventoryItem) => {
      const c: Record<string, string> = { in_stock: 'badge-success', low_stock: 'badge-warning', out_of_stock: 'badge-danger' };
      return <span className={c[i.status]}>{i.status.replace('_', ' ')}</span>;
    }},
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-lime-100 dark:bg-lime-900/30 rounded-xl"><Package size={24} className="text-lime-600" /></div>
          <div><h1 className="text-2xl font-bold">Inventory</h1><p className="text-sm text-gray-500">School store & assets management</p></div>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2"><Plus size={18} /> Add Item</button>
      </div>
      <div className="card"><DataTable columns={columns} data={items} searchPlaceholder="Search inventory..." /></div>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Inventory Item">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Name *</label><input className="input-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Category</label><input className="input-field" value={form.category} onChange={e => setForm({...form, category: e.target.value})} /></div>
            <div><label className="block text-sm font-medium mb-1">Quantity *</label><input type="number" className="input-field" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} required /></div>
            <div><label className="block text-sm font-medium mb-1">Unit Price *</label><input type="number" step="0.01" className="input-field" value={form.unitPrice} onChange={e => setForm({...form, unitPrice: e.target.value})} required /></div>
            <div><label className="block text-sm font-medium mb-1">Reorder Level</label><input type="number" className="input-field" value={form.reorderLevel} onChange={e => setForm({...form, reorderLevel: e.target.value})} /></div>
            <div><label className="block text-sm font-medium mb-1">Location</label><input className="input-field" value={form.location} onChange={e => setForm({...form, location: e.target.value})} /></div>
            <div><label className="block text-sm font-medium mb-1">Supplier</label><input className="input-field" value={form.supplier} onChange={e => setForm({...form, supplier: e.target.value})} /></div>
          </div>
          <div className="flex justify-end gap-3"><button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button><button type="submit" className="btn-primary">Add Item</button></div>
        </form>
      </Modal>
    </div>
  );
}
