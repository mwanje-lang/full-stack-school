import React, { useState } from 'react';
import { BarChart3, Download, FileText, PieChart } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RPie, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#22c55e', '#eab308', '#ef4444', '#8b5cf6', '#06b6d4'];
const reportTypes = ['Attendance Report', 'Fee Collection Report', 'Exam Results', 'Financial Summary', 'Student Enrollment', 'Staff Performance', 'Library Usage', 'Transport Report', 'Custom Report'];

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const attendanceData = [
    { class: '10A', present: 92, absent: 8 }, { class: '10B', present: 88, absent: 12 },
    { class: '9A', present: 95, absent: 5 }, { class: '9B', present: 90, absent: 10 },
    { class: '8A', present: 85, absent: 15 }, { class: '8B', present: 91, absent: 9 },
  ];

  const enrollmentData = [
    { name: 'Class 10', value: 120 }, { name: 'Class 9', value: 115 },
    { name: 'Class 8', value: 130 }, { name: 'Class 7', value: 108 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl"><BarChart3 size={24} className="text-indigo-600" /></div>
          <div><h1 className="text-2xl font-bold">Reports & Analytics</h1><p className="text-sm text-gray-500">Generate custom reports & analytics</p></div>
        </div>
        <button className="btn-primary flex items-center gap-2"><Download size={18} /> Export to Excel</button>
      </div>

      <div className="card p-4 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium mb-1">Report Type</label>
          <select className="input-field" value={selectedReport} onChange={e => setSelectedReport(e.target.value)}>
            <option value="">Select Report...</option>
            {reportTypes.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div><label className="block text-sm font-medium mb-1">From</label><input type="date" className="input-field" value={dateFrom} onChange={e => setDateFrom(e.target.value)} /></div>
        <div><label className="block text-sm font-medium mb-1">To</label><input type="date" className="input-field" value={dateTo} onChange={e => setDateTo(e.target.value)} /></div>
        <button className="btn-primary">Generate Report</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold mb-4">Attendance by Class</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="class" /><YAxis /><Tooltip /><Legend />
              <Bar dataKey="present" fill="#22c55e" name="Present %" radius={[4, 4, 0, 0]} />
              <Bar dataKey="absent" fill="#ef4444" name="Absent %" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 className="font-semibold mb-4">Student Enrollment Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RPie>
              <Pie data={enrollmentData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {enrollmentData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip /><Legend />
            </RPie>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Report Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {reportTypes.slice(0, 4).map(rt => (
          <button key={rt} onClick={() => setSelectedReport(rt)} className="card text-left hover:shadow-md transition-shadow">
            <FileText size={20} className="text-primary-500 mb-2" />
            <p className="font-medium text-sm">{rt}</p>
            <p className="text-xs text-gray-500 mt-1">Click to generate</p>
          </button>
        ))}
      </div>
    </div>
  );
}
