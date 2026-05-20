import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, hasPermission } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, GraduationCap, UserCheck, BookOpen, ClipboardList,
  Calendar, DollarSign, Package, BookMarked, Bus, Building2, Heart,
  CalendarDays, FileText, Shield, BarChart3, Search, Settings, LogOut,
  ChevronLeft, ChevronRight, MessageSquare, Bell, Briefcase, UserCog,
  Home, CreditCard, Truck, Bed, Stethoscope, Scale, Newspaper, Upload,
  Eye, Brain, PieChart
} from 'lucide-react';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  module: string;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/', module: 'dashboard' },
  { label: 'Students', icon: <GraduationCap size={20} />, path: '/students', module: 'dashboard' },
  { label: 'Staff', icon: <Briefcase size={20} />, path: '/staff', module: 'dashboard' },
  { label: 'Attendance', icon: <UserCheck size={20} />, path: '/attendance', module: 'attendance' },
  { label: 'Academics', icon: <BookOpen size={20} />, path: '/academics', module: 'academics' },
  { label: 'Timetable', icon: <Calendar size={20} />, path: '/timetable', module: 'timetable' },
  { label: 'Exams & Grades', icon: <ClipboardList size={20} />, path: '/exams', module: 'exams' },
  { label: 'Report Cards', icon: <FileText size={20} />, path: '/report-cards', module: 'exams' },
  { label: 'Fee Management', icon: <DollarSign size={20} />, path: '/fees', module: 'fees' },
  { label: 'Accounting', icon: <CreditCard size={20} />, path: '/accounting', module: 'accounting' },
  { label: 'Accounting AI', icon: <Brain size={20} />, path: '/accounting-ai', module: 'accounting' },
  { label: 'Payroll', icon: <DollarSign size={20} />, path: '/payroll', module: 'payroll' },
  { label: 'Messages', icon: <MessageSquare size={20} />, path: '/messages', module: 'messages' },
  { label: 'Notifications', icon: <Bell size={20} />, path: '/notifications', module: 'dashboard' },
  { label: 'Library', icon: <BookMarked size={20} />, path: '/library', module: 'library' },
  { label: 'Transport', icon: <Bus size={20} />, path: '/transport', module: 'dashboard' },
  { label: 'Hostel', icon: <Bed size={20} />, path: '/hostel', module: 'dashboard' },
  { label: 'Health Records', icon: <Stethoscope size={20} />, path: '/health', module: 'dashboard' },
  { label: 'Discipline', icon: <Scale size={20} />, path: '/discipline', module: 'dashboard' },
  { label: 'Events', icon: <CalendarDays size={20} />, path: '/events', module: 'dashboard' },
  { label: 'Documents', icon: <Upload size={20} />, path: '/documents', module: 'dashboard' },
  { label: 'Visitors', icon: <Eye size={20} />, path: '/visitors', module: 'dashboard' },
  { label: 'Inventory', icon: <Package size={20} />, path: '/inventory', module: 'inventory' },
  { label: 'Reports', icon: <BarChart3 size={20} />, path: '/reports', module: 'reports' },
  { label: 'User Management', icon: <UserCog size={20} />, path: '/users', module: 'dashboard' },
  { label: 'Settings', icon: <Settings size={20} />, path: '/settings', module: 'dashboard' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const filteredItems = navItems.filter(item =>
    user ? hasPermission(user.role, item.module) : false
  );

  return (
    <aside className={`fixed left-0 top-0 h-full bg-white dark:bg-gray-800 border-r shadow-sm z-40 transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'} flex flex-col`}>
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <GraduationCap size={20} className="text-white" />
            </div>
            <span className="font-bold text-lg text-primary-600">SMS</span>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 px-2">
        {filteredItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* User & Logout */}
      <div className="border-t p-3">
        {user && !collapsed && (
          <div className="flex items-center gap-2 mb-2 px-2">
            <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-400 text-sm font-bold">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-gray-500 capitalize">{user.role}</p>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut size={20} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
