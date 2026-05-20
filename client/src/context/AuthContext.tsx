import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('sms_token');
    const savedUser = localStorage.getItem('sms_user');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('sms_token');
        localStorage.removeItem('sms_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('sms_token', res.token);
    localStorage.setItem('sms_user', JSON.stringify(res.user));
    setUser(res.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('sms_token');
    localStorage.removeItem('sms_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function hasPermission(role: UserRole, module: string): boolean {
  const permissions: Record<UserRole, string[]> = {
    admin: ['*'],
    teacher: ['dashboard', 'attendance', 'academics', 'exams', 'grades', 'timetable', 'assignments', 'messages', 'profile', 'library'],
    student: ['dashboard', 'results', 'assignments', 'timetable', 'fees', 'messages', 'profile', 'library'],
    parent: ['dashboard', 'results', 'fees', 'attendance', 'messages', 'profile', 'events'],
    accountant: ['dashboard', 'fees', 'accounting', 'payroll', 'reports', 'profile', 'inventory'],
  };
  const allowed = permissions[role];
  return allowed.includes('*') || allowed.includes(module);
}
