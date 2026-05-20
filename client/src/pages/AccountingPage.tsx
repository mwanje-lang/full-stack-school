import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import DataTable from '../components/layout/DataTable';
import Modal from '../components/layout/Modal';
import { api } from '../services/api';
import type { AccountingEntry } from '../types';
import toast from 'react-hot-toast';

export default function AccountingPage() {
  const [entries, setEntries] = useState<AccountingEntry[]>([]);
  const [tab, setTab] = useState<'all' | 'income' | 'expense'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ date: '', description: '', type: 'income', category: '', amount: '', reference: '', paymentMethod: 'cash' });

  useEffect(() => { loadData(); }, []);
  const loadData = async () => { try { const d = await api.get('/accounting'); setEntries(d); } catch { setEntries([]); } };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await api.post('/accounting', { ...form, amount: parseFloat(form.amount) }); toast.success('Entry added'); loadData(); setModalOpen(false);
      setForm({ date: '', description: '', type: 'income', category: '', amount: '', reference: '', paymentMethod: 'cash' });
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Failed'); }
  };

  const filtered = tab === 'all' ? entries : entries.filter(e => e.type === tab);
  const totalIncome = entries.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0);
  const totalExpenses = entries.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0);

  const chartData = [
    { month: 'Jan', income: 45000, expenses: 32000 }, { month: 'Feb', income: 52000, expenses: 35000 },
    { month: 'Mar', income: 48000, expenses: 30000 }, { month: 'Apr', income: 61000, expenses: 38000 },
    { month: 'May', income: 55000, expenses: 34000 }, { month: 'Jun', income: 67000, expenses: 40000 },
  ];

  const columns = [
    { key: 'date', label: 'Date' },
    { key: 'description', label: 'Description' },
    { key: 'category', label: 'Category' },
    { key: 'type', label: 'Type', render: (e: AccountingEntry) => <span className={e.type === 'income' ? 'badge-success' : 'badge-danger'}>{e.type}</span> },
    { key: 'amount', label: 'Amount', render: (e: AccountingEntry) => <span className={e.type === 'income' ? 'text-green-600' : 'text-red-600'}>${e.amount.toLocaleString()}</span> },
    { key: 'paymentMethod', label: 'Method' },
    { key: 'status', label: 'Status', render: (e: AccountingEntry) => <span className="badge-primary capitalize">{e.status}</span> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl"><CreditCard size={24} className="text-emerald-600" /></div>
          <div><h1 className="text-2xl font-bold">Accounting</h1><p className="text-sm text-gray-500">Income, expenses & financial management</p></div>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2"><Plus size={18} /> Add Entry</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card flex items-center gap-4"><div className="p-3 bg-green-100 rounded-xl"><TrendingUp size={24} className="text-green-600" /></div><div><p className="text-sm text-gray-500">Total Income</p><p className="text-2xl font-bold text-green-600">${totalIncome.toLocaleString()}</p></div></div>
        <div className="card flex items-center gap-4"><div className="p-3 bg-red-100 rounded-xl"><TrendingDown size={24} className="text-red-600" /></div><div><p className="text-sm text-gray-500">Total Expenses</p><p className="text-2xl font-bold text-red-600">${totalExpenses.toLocaleString()}</p></div></div>
        <div className="card flex items-center gap-4"><div className="p-3 bg-blue-100 rounded-xl"><DollarSign size={24} className="text-blue-600" /></div><div><p className="text-sm text-gray-500">Net Profit</p><p className="text-2xl font-bold text-blue-600">${(totalIncome - totalExpenses).toLocaleString()}</p></div></div>
      </div>

      <div className="card">
        <h3 className="font-semibold mb-4">Revenue vs Expenses Trend</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} /><Legend />
            <Line type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={2} /><Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setTab('all')} className={tab === 'all' ? 'btn-primary' : 'btn-secondary'}>All</button>
        <button onClick={() => setTab('income')} className={tab === 'income' ? 'btn-primary' : 'btn-secondary'}>Income</button>
        <button onClick={() => setTab('expense')} className={tab === 'expense' ? 'btn-primary' : 'btn-secondary'}>Expenses</button>
      </div>

      <div className="card"><DataTable columns={columns} data={filtered} searchPlaceholder="Search entries..." /></div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Accounting Entry">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Date *</label><input type="date" className="input-field" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required /></div>
            <div><label className="block text-sm font-medium mb-1">Type *</label>
              <select className="input-field" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                <option value="income">Income</option><option value="expense">Expense</option>
              </select></div>
          </div>
          <div><label className="block text-sm font-medium mb-1">Description *</label><input className="input-field" value={form.description} onChange={e => setForm({...form, description: e.target.value})} required /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Category</label><input className="input-field" value={form.category} onChange={e => setForm({...form, category: e.target.value})} placeholder="e.g. Tuition, Supplies" /></div>
            <div><label className="block text-sm font-medium mb-1">Amount *</label><input type="number" className="input-field" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required /></div>
            <div><label className="block text-sm font-medium mb-1">Reference</label><input className="input-field" value={form.reference} onChange={e => setForm({...form, reference: e.target.value})} /></div>
            <div><label className="block text-sm font-medium mb-1">Payment Method</label>
              <select className="input-field" value={form.paymentMethod} onChange={e => setForm({...form, paymentMethod: e.target.value})}>
                <option value="cash">Cash</option><option value="bank">Bank</option><option value="online">Online</option><option value="cheque">Cheque</option>
              </select></div>
          </div>
          <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button><button type="submit" className="btn-primary">Add Entry</button></div>
        </form>
      </Modal>
    </div>
  );
}
