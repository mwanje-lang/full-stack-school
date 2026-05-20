# School Management System (SMS)

Enterprise-grade School Management System built as a Progressive Web App (PWA).

## Features

- **User Management & Roles** - Admin, Teacher, Student, Parent, Accountant with custom permissions
- **Student & Staff Management** - Full CRUD with image upload, HR system
- **Attendance Tracking** - Biometric/ID card integration, manual entry
- **Academics** - Classes, subjects, curriculum, timetable management
- **Exams & Gradebook** - Exam creation, marks entry, grade calculation
- **Report Cards** - Generate, print, email/WhatsApp bulk share
- **Fee Management** - Fee structures, payments, balance tracking, defaulter alerts
- **Accounting** - Income/expense tracking, bookkeeping, multi-currency
- **Accounting AI** - Anomaly detection, AI bank feeds, financial forecasting
- **Payroll** - Staff salary management
- **Library** - Books, borrowing, e-books, overdue tracking
- **Transport** - Routes, drivers, GPS tracking (open API endpoint)
- **Hostel** - Dormitory & room allocation management
- **Health Records** - Sick bay, counseling services
- **Discipline Tracking** - Violations, actions, escalation
- **Events & Calendar** - School events, meetings, holidays
- **Document Storage** - Secure file management
- **Visitor Management** - Entry/exit logs
- **Inventory** - School store & asset management
- **Reports & Analytics** - Custom report builder with charts
- **Messaging** - Internal chat system
- **Notifications** - Fee alerts, overdue books, health alerts
- **Smart Search** - Global search across all modules

## Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS + Vite
- **Backend**: Express.js + TypeScript
- **Database**: SQLite (via better-sqlite3)
- **PWA**: Service worker with offline caching
- **Charts**: Recharts

## Quick Start

```bash
# Install dependencies
npm install
cd client && npm install
cd ../server && npm install

# Development
cd .. && npm run dev

# Build for production
npm run build
```

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@school.com | admin123 |
| Teacher | teacher@school.com | teacher123 |
| Parent | parent@school.com | parent123 |
| Student | student@school.com | student123 |
| Accountant | accountant@school.com | accountant123 |

## API Endpoints

### Open Endpoints (for device integration)
- `POST /api/gps/update` - GPS tracker data
- `POST /api/biometric/checkin` - Biometric check-in

### All other endpoints require JWT authentication via `Authorization: Bearer <token>` header.

## Architecture

- Mobile-first responsive design
- Sidebar navigation with icons per module
- Persistent global smart search bar
- Dark/light mode support
- Popup forms for quick data entry
- Offline-capable via service workers
- Role-based access control
