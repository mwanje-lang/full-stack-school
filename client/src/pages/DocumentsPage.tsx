import React, { useState, useEffect } from 'react';
import { Upload, Plus, Download, Trash2, File, FileText, Image } from 'lucide-react';
import DataTable from '../components/layout/DataTable';
import Modal from '../components/layout/Modal';
import { api } from '../services/api';
import type { Document } from '../types';
import toast from 'react-hot-toast';

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'general', type: '' });

  useEffect(() => { loadData(); }, []);
  const loadData = async () => { try { const d = await api.get('/documents'); setDocs(d); } catch { setDocs([]); } };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await api.post('/documents', form); toast.success('Document uploaded'); loadData(); setModalOpen(false); }
    catch (err) { toast.error(err instanceof Error ? err.message : 'Failed'); }
  };

  const columns = [
    { key: 'name', label: 'Document Name' },
    { key: 'category', label: 'Category', render: (d: Document) => <span className="badge-primary capitalize">{d.category}</span> },
    { key: 'uploadedByName', label: 'Uploaded By' },
    { key: 'fileSize', label: 'Size', render: (d: Document) => `${(d.fileSize / 1024).toFixed(1)} KB` },
    { key: 'createdAt', label: 'Date', render: (d: Document) => new Date(d.createdAt).toLocaleDateString() },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-100 dark:bg-slate-900/30 rounded-xl"><Upload size={24} className="text-slate-600" /></div>
          <div><h1 className="text-2xl font-bold">Document Storage</h1><p className="text-sm text-gray-500">Secure document management</p></div>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2"><Plus size={18} /> Upload Document</button>
      </div>
      <div className="card"><DataTable columns={columns} data={docs} searchPlaceholder="Search documents..." /></div>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Upload Document">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Name *</label><input className="input-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
          <div><label className="block text-sm font-medium mb-1">Category</label>
            <select className="input-field" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
              <option value="general">General</option><option value="student">Student</option><option value="staff">Staff</option><option value="financial">Financial</option><option value="academic">Academic</option><option value="contract">Contract</option>
            </select></div>
          <div className="border-2 border-dashed rounded-xl p-8 text-center"><Upload size={32} className="mx-auto text-gray-400 mb-2" /><p className="text-sm text-gray-500">Drag & drop files or click to browse</p><input type="file" className="mt-2" /></div>
          <div className="flex justify-end gap-3"><button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button><button type="submit" className="btn-primary">Upload</button></div>
        </form>
      </Modal>
    </div>
  );
}
