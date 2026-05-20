import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap, Users, BookOpen, DollarSign, UserCheck, Clock,
  TrendingUp, TrendingDown, Calendar, Bell, BarChart3, PieChart
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RPie, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { DashboardStats } from '../types';

const COLORS = ['#3b82f6', '#22c55e', '#eab308', '#ef4444', '#8b5cf6', '#06b6d4'];

const defaultStats: DashboardStats = {
  totalStudents: 0, totalTeachers: 0, totalStaff: 0, totalClasses: 0,
  totalRevenue: 0, totalExpenses: 0, attendanceRate: 0, feeCollectionRate: 0,
  recentActivities: [], upcomingEvents: [], notifications: []
};

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>(defaultStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get('/dashboard/stats');
        setStats(data);
      } catch { /* use defaults */ }
      setLoading(false);
    })();
  }, []);

  const statCards = [
    { label: 'Total Students', value: stats.totalStudents, icon: <GraduationCap size={24} />, color: 'bg-blue-500', path: '/students' },
    { label: 'Total Teachers', value: stats.totalTeachers, icon: <Users size={24} />, color: 'bg-green-500', path: '/staff' },
    { label: 'Total Classes', value: stats.totalClasses, icon: <BookOpen size={24} />, color: 'bg-purple-500', path: '/academics' },
    { label: 'Attendance Rate', value: `${stats.attendanceRate}%`, icon: <UserCheck size={24} />, color: 'bg-teal-500', path: '/attendance' },
    { label: 'Total Revenue', value: `$${stats.totalRevenue.toLocaleString()}`, icon: <TrendingUp size={24} />, color: 'bg-emerald-500', path: '/accounting' },
    { label: 'Fee Collection', value: `${stats.feeCollectionRate}%`, icon: <DollarSign size={24} />, color: 'bg-amber-500', path: '/fees' },
  ];

  const attendanceData = [
    { name: 'Mon', present: 92, absent: 8 },
    { name: 'Tue', present: 88, absent: 12 },
    { name: 'Wed', present: 95, absent: 5 },
    { name: 'Thu', present: 90, absent: 10 },
    { name: 'Fri', present: 85, absent: 15 },
  ];

  const feeData = [
    { name: 'Paid', value: stats.feeCollectionRate || 72 },
    { name: 'Partial', value: 18 },
    { name: 'Unpaid', value: 10 },
  ];

  const revenueData = [
    { month: 'Jan', income: 45000, expenses: 32000 },
    { month: 'Feb', income: 52000, expenses: 35000 },
    { month: 'Mar', income: 48000, expenses: 30000 },
    { month: 'Apr', income: 61000, expenses: 38000 },
    { month: 'May', income: 55000, expenses: 34000 },
    { month: 'Jun', income: 67000, expenses: 40000 },
  ];

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome, {user?.firstName}!</h1>
          <p className="text-gray-500 text-sm mt-1">Here's what's happening at your school today</p>
        </div>
      </div>

      {/* Stat Cards - all clickable */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map(card => (
          <button
            key={card.label}
            onClick={() => navigate(card.path)}
            className="card flex items-center gap-4 hover:shadow-md transition-shadow text-left"
          >
            <div className={`${card.color} p-3 rounded-xl text-white`}>{card.icon}</div>
            <div>
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="text-xs text-gray-500">{card.label}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Weekly Attendance</h3>
            <button onClick={() => navigate('/attendance')} className="text-sm text-primary-600 hover:underline">View All</button>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="present" fill="#22c55e" name="Present" radius={[4, 4, 0, 0]} />
              <Bar dataKey="absent" fill="#ef4444" name="Absent" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Fee Collection Pie */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Fee Collection Status</h3>
            <button onClick={() => navigate('/fees')} className="text-sm text-primary-600 hover:underline">View All</button>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <RPie>
              <Pie data={feeData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}%`}>
                {feeData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip />
            </RPie>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue & Expense Chart */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Revenue vs Expenses</h3>
          <button onClick={() => navigate('/accounting')} className="text-sm text-primary-600 hover:underline">View All</button>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
            <Legend />
            <Line type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={2} name="Income" />
            <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Expenses" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom row: recent activities & upcoming events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Recent Activities</h3>
          </div>
          <div className="space-y-3">
            {(stats.recentActivities.length > 0 ? stats.recentActivities : [
              { id: '1', action: 'Student Enrolled', description: 'John Doe admitted to Class 10A', userId: '1', timestamp: new Date().toISOString() },
              { id: '2', action: 'Fee Payment', description: 'Jane Smith paid $500 tuition', userId: '2', timestamp: new Date().toISOString() },
              { id: '3', action: 'Exam Created', description: 'Mid-term Mathematics exam scheduled', userId: '1', timestamp: new Date().toISOString() },
              { id: '4', action: 'Attendance Marked', description: 'Class 8B attendance completed', userId: '3', timestamp: new Date().toISOString() },
            ]).map(activity => (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30">
                <div className="w-2 h-2 rounded-full bg-primary-500 mt-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.description}</p>
                </div>
                <span className="text-xs text-gray-400 ml-auto whitespace-nowrap">
                  {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Upcoming Events</h3>
            <button onClick={() => navigate('/events')} className="text-sm text-primary-600 hover:underline">View All</button>
          </div>
          <div className="space-y-3">
            {(stats.upcomingEvents.length > 0 ? stats.upcomingEvents : [
              { id: '1', title: 'Parent-Teacher Meeting', date: '2026-05-25', type: 'meeting' as const, description: '', isAllDay: false },
              { id: '2', title: 'Mid-Term Exams Begin', date: '2026-06-01', type: 'exam' as const, description: '', isAllDay: true },
              { id: '3', title: 'Sports Day', date: '2026-06-15', type: 'sports' as const, description: '', isAllDay: true },
              { id: '4', title: 'School Anniversary', date: '2026-07-01', type: 'cultural' as const, description: '', isAllDay: true },
            ]).map(event => (
              <button
                key={event.id}
                onClick={() => navigate('/events')}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 text-left"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-primary-50 dark:bg-primary-900/30 rounded-xl flex flex-col items-center justify-center">
                  <span className="text-xs text-primary-600 font-medium">
                    {new Date(event.date).toLocaleDateString('en', { month: 'short' })}
                  </span>
                  <span className="text-lg font-bold text-primary-700">
                    {new Date(event.date).getDate()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium">{event.title}</p>
                  <p className="text-xs text-gray-500 capitalize">{event.type}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
