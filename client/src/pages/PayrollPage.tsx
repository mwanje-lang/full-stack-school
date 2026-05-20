import React, { useState } from 'react';
import { DollarSign, Download, Send } from 'lucide-react';
import DataTable from '../components/layout/DataTable';

const mockPayroll = [
  { id: '1', employeeName: 'John Smith', role: 'Teacher', baseSalary: 4500, allowances: 500, deductions: 200, netSalary: 4800, status: 'paid', month: 'May 2026' },
  { id: '2', employeeName: 'Jane Doe', role: 'Admin', baseSalary: 5000, allowances: 600, deductions: 250, netSalary: 5350, status: 'pending', month: 'May 2026' },
  { id: '3', employeeName: 'Bob Wilson', role: 'Librarian', baseSalary: 3500, allowances: 400, deductions: 150, netSalary: 3750, status: 'paid', month: 'May 2026' },
];

export default function PayrollPage() {
  const [month, setMonth] = useState('2026-05');

  const columns = [
    { key: 'employeeName', label: 'Employee' },
    { key: 'role', label: 'Role' },
    { key: 'baseSalary', label: 'Base Salary', render: (p: typeof mockPayroll[0]) => `$${p.baseSalary.toLocaleString()}` },
    { key: 'allowances', label: 'Allowances', render: (p: typeof mockPayroll[0]) => `$${p.allowances.toLocaleString()}` },
    { key: 'deductions', label: 'Deductions', render: (p: typeof mockPayroll[0]) => `$${p.deductions.toLocaleString()}` },
    { key: 'netSalary', label: 'Net Salary', render: (p: typeof mockPayroll[0]) => <span className="font-bold">${p.netSalary.toLocaleString()}</span> },
    { key: 'status', label: 'Status', render: (p: typeof mockPayroll[0]) => <span className={p.status === 'paid' ? 'badge-success' : 'badge-warning'}>{p.status}</span> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl"><DollarSign size={24} className="text-green-600" /></div>
          <div><h1 className="text-2xl font-bold">Payroll Management</h1><p className="text-sm text-gray-500">Staff salary & payroll</p></div>
        </div>
        <div className="flex gap-2">
          <button className="btn-primary flex items-center gap-2"><Send size={18} /> Process Payroll</button>
          <button className="btn-secondary flex items-center gap-2"><Download size={18} /> Export</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card"><p className="text-sm text-gray-500">Total Payroll</p><p className="text-2xl font-bold">${mockPayroll.reduce((s, p) => s + p.netSalary, 0).toLocaleString()}</p></div>
        <div className="card"><p className="text-sm text-gray-500">Employees</p><p className="text-2xl font-bold">{mockPayroll.length}</p></div>
        <div className="card"><p className="text-sm text-gray-500">Pending</p><p className="text-2xl font-bold text-amber-600">{mockPayroll.filter(p => p.status === 'pending').length}</p></div>
      </div>

      <div className="card p-4 flex gap-4 items-center">
        <label className="text-sm font-medium">Month:</label>
        <input type="month" className="input-field w-auto" value={month} onChange={e => setMonth(e.target.value)} />
      </div>

      <div className="card"><DataTable columns={columns} data={mockPayroll} searchPlaceholder="Search employees..." /></div>
    </div>
  );
}
