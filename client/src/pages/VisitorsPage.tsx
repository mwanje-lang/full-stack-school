import React, { useState, useEffect } from 'react';
import { Eye, Plus, LogIn, LogOut } from 'lucide-react';
import DataTable from '../components/layout/DataTable';
import Modal from '../components/layout/Modal';
import { api } from '../services/api';
import type { Visitor } from '../types';
import toast from 'react-hot-toast';

export default function VisitorsPage() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', purpose: '', visitingPerson: '', idType: '', idNumber: '' });

  useEffect(() => { loadData(); }, []);
  const loadData = async () => { try { const d = await api.get('/visitors'); setVisitors(d); } catch { setVisitors([]); } };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await api.post('/visitors', form); toast.success('Visitor checked in'); loadData(); setModalOpen(false); }
    catch (err) { toast.error(err instanceof Error ? err.message : 'Failed'); }
  };

  const handleCheckout = async (id: string) => {
    try { await api.post(`/visitors/${id}/checkout`, {}); toast.success('Checked out'); loadData(); } catch { toast.error('Failed'); }
  };

  const columns = [
    { key: 'name', label: 'Visitor Name' }, { key: 'phone', label: 'Phone' },
    { key: 'purpose', label: 'Purpose' }, { key: 'visitingPerson', label: 'Visiting' },
    { key: 'checkIn', label: 'Check In', render: (v: Visitor) => new Date(v.checkIn).toLocaleString() },
    { key: 'checkOut', label: 'Check Out', render: (v: Visitor) => v.checkOut ? new Date(v.checkOut).toLocaleString() : '-' },
    { key: 'status', label: 'Status', render: (v: Visitor) => <span className={v.status === 'checked_in' ? 'badge-warning' : 'badge-success'}>{v.status === 'checked_in' ? 'In' : 'Out'}</span> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-xl"><Eye size={24} className="text-gray-600" /></div>
          <div><h1 className="text-2xl font-bold">Visitor Management</h1><p className="text-sm text-gray-500">Track visitor entry & exit</p></div>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2"><LogIn size={18} /> Check In Visitor</button>
      </div>
      <div className="card">
        <DataTable columns={columns} data={visitors} searchPlaceholder="Search visitors..."
          actions={(item) => { const v = item as unknown as Visitor; return v.status === 'checked_in' ? (
            <button onClick={() => handleCheckout(v.id)} className="btn-secondary text-xs py-1 px-3 flex items-center gap-1"><LogOut size={14} /> Check Out</button>
          ) : null; }} />
      </div>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Check In Visitor">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Name *</label><input className="input-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Phone *</label><input className="input-field" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required /></div>
            <div><label className="block text-sm font-medium mb-1">Visiting Person *</label><input className="input-field" value={form.visitingPerson} onChange={e => setForm({...form, visitingPerson: e.target.value})} required /></div>
          </div>
          <div><label className="block text-sm font-medium mb-1">Purpose *</label><input className="input-field" value={form.purpose} onChange={e => setForm({...form, purpose: e.target.value})} required /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">ID Type</label><input className="input-field" value={form.idType} onChange={e => setForm({...form, idType: e.target.value})} placeholder="e.g. National ID" /></div>
            <div><label className="block text-sm font-medium mb-1">ID Number</label><input className="input-field" value={form.idNumber} onChange={e => setForm({...form, idNumber: e.target.value})} /></div>
          </div>
          <div className="flex justify-end gap-3"><button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button><button type="submit" className="btn-primary">Check In</button></div>
        </form>
      </Modal>
    </div>
  );
}
