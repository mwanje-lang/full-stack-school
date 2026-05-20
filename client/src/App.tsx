import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import StudentsPage from './pages/StudentsPage';
import StaffPage from './pages/StaffPage';
import AttendancePage from './pages/AttendancePage';
import AcademicsPage from './pages/AcademicsPage';
import TimetablePage from './pages/TimetablePage';
import ExamsPage from './pages/ExamsPage';
import ReportCardsPage from './pages/ReportCardsPage';
import FeesPage from './pages/FeesPage';
import AccountingPage from './pages/AccountingPage';
import AccountingAIPage from './pages/AccountingAIPage';
import PayrollPage from './pages/PayrollPage';
import MessagesPage from './pages/MessagesPage';
import NotificationsPage from './pages/NotificationsPage';
import LibraryPage from './pages/LibraryPage';
import TransportPage from './pages/TransportPage';
import HostelPage from './pages/HostelPage';
import HealthPage from './pages/HealthPage';
import DisciplinePage from './pages/DisciplinePage';
import EventsPage from './pages/EventsPage';
import DocumentsPage from './pages/DocumentsPage';
import VisitorsPage from './pages/VisitorsPage';
import InventoryPage from './pages/InventoryPage';
import ReportsPage from './pages/ReportsPage';
import UsersPage from './pages/UsersPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<Layout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/students" element={<StudentsPage />} />
              <Route path="/staff" element={<StaffPage />} />
              <Route path="/attendance" element={<AttendancePage />} />
              <Route path="/academics" element={<AcademicsPage />} />
              <Route path="/timetable" element={<TimetablePage />} />
              <Route path="/exams" element={<ExamsPage />} />
              <Route path="/report-cards" element={<ReportCardsPage />} />
              <Route path="/fees" element={<FeesPage />} />
              <Route path="/accounting" element={<AccountingPage />} />
              <Route path="/accounting-ai" element={<AccountingAIPage />} />
              <Route path="/payroll" element={<PayrollPage />} />
              <Route path="/messages" element={<MessagesPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/library" element={<LibraryPage />} />
              <Route path="/transport" element={<TransportPage />} />
              <Route path="/hostel" element={<HostelPage />} />
              <Route path="/health" element={<HealthPage />} />
              <Route path="/discipline" element={<DisciplinePage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/documents" element={<DocumentsPage />} />
              <Route path="/visitors" element={<VisitorsPage />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/profile" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
