import React, { useState, useEffect } from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';
import { api } from '../services/api';
import type { Notification } from '../types';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', userId: '1', title: 'Fee Payment Received', message: 'John Doe paid $500 for Term 1 tuition', type: 'success', isRead: false, link: '/fees', createdAt: new Date().toISOString() },
    { id: '2', userId: '1', title: 'Late Fee Payment', message: 'Jane Smith has overdue fees of $300', type: 'warning', isRead: false, link: '/fees', createdAt: new Date().toISOString() },
    { id: '3', userId: '1', title: 'Library Book Overdue', message: 'Bob Wilson has not returned "Mathematics Vol 2"', type: 'error', isRead: true, link: '/library', createdAt: new Date().toISOString() },
    { id: '4', userId: '1', title: 'New Student Enrolled', message: 'Alice Johnson has been admitted to Class 9A', type: 'info', isRead: true, link: '/students', createdAt: new Date().toISOString() },
    { id: '5', userId: '1', title: 'Sick Bay Alert', message: 'Student Tom Brown has been in sick bay for 2 hours', type: 'warning', isRead: false, link: '/health', createdAt: new Date().toISOString() },
  ]);

  const typeColors: Record<string, string> = { info: 'bg-blue-100 text-blue-700 border-blue-200', warning: 'bg-amber-50 text-amber-700 border-amber-200', error: 'bg-red-50 text-red-700 border-red-200', success: 'bg-green-50 text-green-700 border-green-200' };
  const typeIcons: Record<string, string> = { info: 'bg-blue-500', warning: 'bg-amber-500', error: 'bg-red-500', success: 'bg-green-500' };

  const markRead = (id: string) => setNotifications(ns => ns.map(n => n.id === id ? { ...n, isRead: true } : n));
  const remove = (id: string) => setNotifications(ns => ns.filter(n => n.id !== id));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl"><Bell size={24} className="text-red-600" /></div>
          <div><h1 className="text-2xl font-bold">Notifications</h1><p className="text-sm text-gray-500">{notifications.filter(n => !n.isRead).length} unread</p></div>
        </div>
        <button onClick={() => setNotifications(ns => ns.map(n => ({ ...n, isRead: true })))} className="btn-secondary text-sm">Mark all as read</button>
      </div>

      <div className="space-y-3">
        {notifications.map(n => (
          <div key={n.id} className={`card flex items-start gap-4 ${!n.isRead ? 'ring-1 ring-primary-200 dark:ring-primary-800' : 'opacity-75'}`}>
            <div className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${typeIcons[n.type]}`} />
            <div className="flex-1">
              <p className="font-medium">{n.title}</p>
              <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>
              <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
            </div>
            <div className="flex gap-1">
              {!n.isRead && <button onClick={() => markRead(n.id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-green-600"><Check size={16} /></button>}
              <button onClick={() => remove(n.id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
