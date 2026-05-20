import React, { useState, useEffect } from 'react';
import { Stethoscope, Plus } from 'lucide-react';
import DataTable from '../components/layout/DataTable';
import Modal from '../components/layout/Modal';
import { api } from '../services/api';
import type { HealthRecord } from '../types';
import toast from 'react-hot-toast';

export default function HealthPage() {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ studentId: '', condition: '', description: '', treatment: '', doctor: '', followUpDate: '' });

  useEffect(() => { loadData(); }, []);
  const loadData = async () => { try { const d = await api.get('/health'); setRecords(d); } catch { setRecords([]); } };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await api.post('/health', form); toast.success('Record added'); loadData(); setModalOpen(false); }
    catch (err) { toast.error(err instanceof Error ? err.message : 'Failed'); }
  };

  const columns = [
    { key: 'studentName', label: 'Student' }, { key: 'condition', label: 'Condition' },
    { key: 'date', label: 'Date' }, { key: 'treatment', label: 'Treatment' },
    { key: 'doctor', label: 'Doctor' }, { key: 'followUpDate', label: 'Follow-up' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl"><Stethoscope size={24} className="text-red-600" /></div>
          <div><h1 className="text-2xl font-bold">Health Records (Sick Bay)</h1><p className="text-sm text-gray-500">Student health & counseling</p></div>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2"><Plus size={18} /> Add Record</button>
      </div>
      <div className="card"><DataTable columns={columns} data={records} searchPlaceholder="Search health records..." /></div>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Health Record">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Student *</label><input className="input-field" value={form.studentId} onChange={e => setForm({...form, studentId: e.target.value})} placeholder="Search student..." required /></div>
          <div><label className="block text-sm font-medium mb-1">Condition *</label><input className="input-field" value={form.condition} onChange={e => setForm({...form, condition: e.target.value})} required /></div>
          <div><label className="block text-sm font-medium mb-1">Description</label><textarea className="input-field" rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Treatment</label><input className="input-field" value={form.treatment} onChange={e => setForm({...form, treatment: e.target.value})} /></div>
            <div><label className="block text-sm font-medium mb-1">Doctor</label><input className="input-field" value={form.doctor} onChange={e => setForm({...form, doctor: e.target.value})} /></div>
          </div>
          <div><label className="block text-sm font-medium mb-1">Follow-up Date</label><input type="date" className="input-field" value={form.followUpDate} onChange={e => setForm({...form, followUpDate: e.target.value})} /></div>
          <div className="flex justify-end gap-3"><button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button><button type="submit" className="btn-primary">Add Record</button></div>
        </form>
      </Modal>
    </div>
  );
}
