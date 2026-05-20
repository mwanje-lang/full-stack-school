import React, { useState, useEffect } from 'react';
import { Scale, Plus } from 'lucide-react';
import DataTable from '../components/layout/DataTable';
import Modal from '../components/layout/Modal';
import { api } from '../services/api';
import type { DisciplineRecord } from '../types';
import toast from 'react-hot-toast';

export default function DisciplinePage() {
  const [records, setRecords] = useState<DisciplineRecord[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ studentId: '', violation: '', description: '', action: '', reportedBy: '' });

  useEffect(() => { loadData(); }, []);
  const loadData = async () => { try { const d = await api.get('/discipline'); setRecords(d); } catch { setRecords([]); } };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await api.post('/discipline', form); toast.success('Record added'); loadData(); setModalOpen(false); }
    catch (err) { toast.error(err instanceof Error ? err.message : 'Failed'); }
  };

  const columns = [
    { key: 'studentName', label: 'Student' }, { key: 'violation', label: 'Violation' },
    { key: 'date', label: 'Date' }, { key: 'action', label: 'Action Taken' },
    { key: 'reportedBy', label: 'Reported By' },
    { key: 'status', label: 'Status', render: (r: DisciplineRecord) => {
      const c: Record<string, string> = { pending: 'badge-warning', resolved: 'badge-success', escalated: 'badge-danger' };
      return <span className={c[r.status]}>{r.status}</span>;
    }},
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-xl"><Scale size={24} className="text-orange-600" /></div>
          <div><h1 className="text-2xl font-bold">Discipline Tracking</h1><p className="text-sm text-gray-500">Track violations & actions</p></div>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2"><Plus size={18} /> Report Incident</button>
      </div>
      <div className="card"><DataTable columns={columns} data={records} searchPlaceholder="Search records..." /></div>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Report Discipline Incident">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Student *</label><input className="input-field" value={form.studentId} onChange={e => setForm({...form, studentId: e.target.value})} required /></div>
          <div><label className="block text-sm font-medium mb-1">Violation *</label><input className="input-field" value={form.violation} onChange={e => setForm({...form, violation: e.target.value})} required /></div>
          <div><label className="block text-sm font-medium mb-1">Description</label><textarea className="input-field" rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
          <div><label className="block text-sm font-medium mb-1">Action Taken</label><input className="input-field" value={form.action} onChange={e => setForm({...form, action: e.target.value})} /></div>
          <div><label className="block text-sm font-medium mb-1">Reported By</label><input className="input-field" value={form.reportedBy} onChange={e => setForm({...form, reportedBy: e.target.value})} /></div>
          <div className="flex justify-end gap-3"><button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button><button type="submit" className="btn-primary">Submit</button></div>
        </form>
      </Modal>
    </div>
  );
}
