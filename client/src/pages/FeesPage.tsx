import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, AlertTriangle, FileText, Send } from 'lucide-react';
import DataTable from '../components/layout/DataTable';
import Modal from '../components/layout/Modal';
import { api } from '../services/api';
import type { Fee, FeeStructure } from '../types';
import toast from 'react-hot-toast';

export default function FeesPage() {
  const [fees, setFees] = useState<Fee[]>([]);
  const [structures, setStructures] = useState<FeeStructure[]>([]);
  const [tab, setTab] = useState<'fees' | 'structure' | 'defaulters'>('fees');
  const [modalOpen, setModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null);
  const [structureForm, setStructureForm] = useState({ name: '', classId: '', amount: '', term: 'Term 1', dueDate: '', description: '' });
  const [paymentForm, setPaymentForm] = useState({ amount: '', method: 'cash', remarks: '' });

  useEffect(() => { loadData(); }, []);
  const loadData = async () => {
    try { const [f, s] = await Promise.all([api.get('/fees'), api.get('/fee-structures')]); setFees(f); setStructures(s); } catch { setFees([]); setStructures([]); }
  };

  const handleStructureSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await api.post('/fee-structures', { ...structureForm, amount: parseFloat(structureForm.amount) }); toast.success('Fee structure added'); loadData(); setModalOpen(false); }
    catch (err) { toast.error(err instanceof Error ? err.message : 'Failed'); }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFee) return;
    try {
      await api.post(`/fees/${selectedFee.id}/pay`, { amount: parseFloat(paymentForm.amount), method: paymentForm.method, remarks: paymentForm.remarks });
      toast.success('Payment recorded');
      loadData(); setPaymentModalOpen(false); setSelectedFee(null);
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Failed'); }
  };

  const defaulters = fees.filter(f => f.status === 'overdue' || f.status === 'unpaid');

  const feeColumns = [
    { key: 'studentName', label: 'Student' },
    { key: 'description', label: 'Fee Type' },
    { key: 'totalAmount', label: 'Total', render: (f: Fee) => `$${f.totalAmount.toLocaleString()}` },
    { key: 'paidAmount', label: 'Paid', render: (f: Fee) => `$${f.paidAmount.toLocaleString()}` },
    { key: 'balance', label: 'Balance', render: (f: Fee) => <span className={f.balance > 0 ? 'text-red-600 font-semibold' : 'text-green-600'}>${f.balance.toLocaleString()}</span> },
    { key: 'dueDate', label: 'Due Date' },
    { key: 'status', label: 'Status', render: (f: Fee) => {
      const c: Record<string, string> = { paid: 'badge-success', partial: 'badge-warning', unpaid: 'badge-danger', overdue: 'badge-danger' };
      return <span className={c[f.status] || 'badge-primary'}>{f.status}</span>;
    }},
  ];

  const structureColumns = [
    { key: 'name', label: 'Fee Name' },
    { key: 'className', label: 'Class' },
    { key: 'amount', label: 'Amount', render: (s: FeeStructure) => `$${s.amount.toLocaleString()}` },
    { key: 'term', label: 'Term' },
    { key: 'dueDate', label: 'Due Date' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl"><DollarSign size={24} className="text-amber-600" /></div>
          <div><h1 className="text-2xl font-bold">Fee Management</h1><p className="text-sm text-gray-500">Manage fee structures, payments & defaulters</p></div>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2"><Plus size={18} /> Add Fee Structure</button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setTab('fees')} className={tab === 'fees' ? 'btn-primary' : 'btn-secondary'}>All Fees</button>
        <button onClick={() => setTab('structure')} className={tab === 'structure' ? 'btn-primary' : 'btn-secondary'}>Fee Structure</button>
        <button onClick={() => setTab('defaulters')} className={tab === 'defaulters' ? 'btn-danger' : 'btn-secondary'}>
          <span className="flex items-center gap-1"><AlertTriangle size={16} /> Defaulters ({defaulters.length})</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="card"><p className="text-sm text-gray-500">Total Expected</p><p className="text-2xl font-bold">${fees.reduce((s, f) => s + f.totalAmount, 0).toLocaleString()}</p></div>
        <div className="card"><p className="text-sm text-gray-500">Total Collected</p><p className="text-2xl font-bold text-green-600">${fees.reduce((s, f) => s + f.paidAmount, 0).toLocaleString()}</p></div>
        <div className="card"><p className="text-sm text-gray-500">Total Balance</p><p className="text-2xl font-bold text-red-600">${fees.reduce((s, f) => s + f.balance, 0).toLocaleString()}</p></div>
        <div className="card"><p className="text-sm text-gray-500">Defaulters</p><p className="text-2xl font-bold text-orange-600">{defaulters.length}</p></div>
      </div>

      <div className="card">
        {tab === 'fees' && (
          <DataTable columns={feeColumns} data={fees} searchPlaceholder="Search fees..."
            actions={(item) => { const f = item as unknown as Fee; return f.balance > 0 ? (
              <button onClick={(e) => { e.stopPropagation(); setSelectedFee(f); setPaymentModalOpen(true); }} className="btn-primary text-xs py-1 px-3">Record Payment</button>
            ) : <span className="badge-success">Paid</span>; }} />
        )}
        {tab === 'structure' && <DataTable columns={structureColumns} data={structures} searchPlaceholder="Search fee structures..." />}
        {tab === 'defaulters' && <DataTable columns={feeColumns} data={defaulters} searchPlaceholder="Search defaulters..." emptyMessage="No defaulters found" />}
      </div>

      {/* Fee Structure Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Fee Structure">
        <form onSubmit={handleStructureSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Fee Name *</label><input className="input-field" value={structureForm.name} onChange={e => setStructureForm({...structureForm, name: e.target.value})} placeholder="e.g. Tuition Fee" required /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Class *</label><input className="input-field" value={structureForm.classId} onChange={e => setStructureForm({...structureForm, classId: e.target.value})} required /></div>
            <div><label className="block text-sm font-medium mb-1">Amount *</label><input type="number" className="input-field" value={structureForm.amount} onChange={e => setStructureForm({...structureForm, amount: e.target.value})} required /></div>
            <div><label className="block text-sm font-medium mb-1">Term</label>
              <select className="input-field" value={structureForm.term} onChange={e => setStructureForm({...structureForm, term: e.target.value})}>
                <option>Term 1</option><option>Term 2</option><option>Term 3</option><option>Annual</option>
              </select></div>
            <div><label className="block text-sm font-medium mb-1">Due Date *</label><input type="date" className="input-field" value={structureForm.dueDate} onChange={e => setStructureForm({...structureForm, dueDate: e.target.value})} required /></div>
          </div>
          <div><label className="block text-sm font-medium mb-1">Description</label><textarea className="input-field" rows={2} value={structureForm.description} onChange={e => setStructureForm({...structureForm, description: e.target.value})} /></div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Add Fee Structure</button>
          </div>
        </form>
      </Modal>

      {/* Payment Modal */}
      <Modal isOpen={paymentModalOpen} onClose={() => { setPaymentModalOpen(false); setSelectedFee(null); }} title="Record Payment">
        {selectedFee && (
          <form onSubmit={handlePayment} className="space-y-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm">
              <p><strong>Student:</strong> {selectedFee.studentName}</p>
              <p><strong>Total:</strong> ${selectedFee.totalAmount} | <strong>Paid:</strong> ${selectedFee.paidAmount} | <strong>Balance:</strong> <span className="text-red-600">${selectedFee.balance}</span></p>
            </div>
            <div><label className="block text-sm font-medium mb-1">Amount *</label><input type="number" className="input-field" value={paymentForm.amount} onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})} max={selectedFee.balance} required /></div>
            <div><label className="block text-sm font-medium mb-1">Payment Method</label>
              <select className="input-field" value={paymentForm.method} onChange={e => setPaymentForm({...paymentForm, method: e.target.value})}>
                <option value="cash">Cash</option><option value="bank">Bank Transfer</option><option value="online">Online</option><option value="cheque">Cheque</option>
              </select></div>
            <div><label className="block text-sm font-medium mb-1">Remarks</label><input className="input-field" value={paymentForm.remarks} onChange={e => setPaymentForm({...paymentForm, remarks: e.target.value})} /></div>
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => setPaymentModalOpen(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">Record Payment</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
