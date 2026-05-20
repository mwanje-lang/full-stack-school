export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
}

export type UserRole = 'admin' | 'teacher' | 'student' | 'parent' | 'accountant';

export interface Student {
  id: string;
  admissionNo: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  classId: string;
  className?: string;
  sectionId?: string;
  parentId?: string;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  address?: string;
  avatar?: string;
  healthInfo?: string;
  isActive: boolean;
  enrollmentDate: string;
  createdAt: string;
}

export interface Staff {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  department?: string;
  designation?: string;
  salary?: number;
  joinDate: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Class {
  id: string;
  name: string;
  section?: string;
  teacherId?: string;
  teacherName?: string;
  capacity: number;
  currentStrength: number;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  classId: string;
  teacherId?: string;
  teacherName?: string;
}

export interface Attendance {
  id: string;
  userId: string;
  userName?: string;
  type: 'student' | 'staff';
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  checkInTime?: string;
  checkOutTime?: string;
  method: 'manual' | 'biometric' | 'idcard';
}

export interface Exam {
  id: string;
  name: string;
  classId: string;
  subjectId: string;
  subjectName?: string;
  date: string;
  totalMarks: number;
  passingMarks: number;
  term: string;
}

export interface Grade {
  id: string;
  studentId: string;
  studentName?: string;
  examId: string;
  subjectId: string;
  subjectName?: string;
  marksObtained: number;
  totalMarks: number;
  grade?: string;
  remarks?: string;
}

export interface Fee {
  id: string;
  studentId: string;
  studentName?: string;
  feeStructureId: string;
  description: string;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  dueDate: string;
  status: 'paid' | 'partial' | 'unpaid' | 'overdue';
  payments: FeePayment[];
}

export interface FeePayment {
  id: string;
  feeId: string;
  amount: number;
  paymentDate: string;
  method: 'cash' | 'bank' | 'online' | 'cheque';
  receiptNo: string;
  remarks?: string;
}

export interface FeeStructure {
  id: string;
  name: string;
  classId: string;
  className?: string;
  amount: number;
  term: string;
  dueDate: string;
  description?: string;
}

export interface Timetable {
  id: string;
  classId: string;
  subjectId: string;
  subjectName?: string;
  teacherId: string;
  teacherName?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room?: string;
}

export interface LibraryBook {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  category: string;
  totalCopies: number;
  availableCopies: number;
  isEbook: boolean;
  ebookUrl?: string;
}

export interface BookBorrowing {
  id: string;
  bookId: string;
  bookTitle?: string;
  userId: string;
  userName?: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'borrowed' | 'returned' | 'overdue';
  fine?: number;
}

export interface Transport {
  id: string;
  routeName: string;
  vehicleNo: string;
  vehicleType: string;
  driverName: string;
  driverPhone: string;
  capacity: number;
  currentOccupancy: number;
  gpsTrackerId?: string;
  stops: TransportStop[];
}

export interface TransportStop {
  id: string;
  routeId: string;
  stopName: string;
  arrivalTime: string;
  latitude?: number;
  longitude?: number;
  order: number;
}

export interface Hostel {
  id: string;
  name: string;
  type: 'boys' | 'girls' | 'mixed';
  totalRooms: number;
  occupiedRooms: number;
  warden?: string;
}

export interface HostelRoom {
  id: string;
  hostelId: string;
  roomNumber: string;
  capacity: number;
  currentOccupancy: number;
  allocations: HostelAllocation[];
}

export interface HostelAllocation {
  id: string;
  roomId: string;
  studentId: string;
  studentName?: string;
  startDate: string;
  endDate?: string;
}

export interface HealthRecord {
  id: string;
  studentId: string;
  studentName?: string;
  condition: string;
  description: string;
  date: string;
  treatment?: string;
  doctor?: string;
  followUpDate?: string;
}

export interface DisciplineRecord {
  id: string;
  studentId: string;
  studentName?: string;
  violation: string;
  description: string;
  date: string;
  action: string;
  reportedBy: string;
  status: 'pending' | 'resolved' | 'escalated';
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  endDate?: string;
  location?: string;
  type: 'academic' | 'sports' | 'cultural' | 'meeting' | 'holiday' | 'exam' | 'other';
  isAllDay: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  senderName?: string;
  receiverId: string;
  receiverName?: string;
  subject: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  category: string;
  uploadedBy: string;
  uploadedByName?: string;
  fileUrl: string;
  fileSize: number;
  createdAt: string;
}

export interface Visitor {
  id: string;
  name: string;
  phone: string;
  purpose: string;
  visitingPerson: string;
  checkIn: string;
  checkOut?: string;
  idType?: string;
  idNumber?: string;
  status: 'checked_in' | 'checked_out';
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  location?: string;
  supplier?: string;
  reorderLevel: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export interface AccountingEntry {
  id: string;
  date: string;
  description: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  reference?: string;
  paymentMethod?: string;
  status: 'pending' | 'completed' | 'cancelled';
  createdBy: string;
}

export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalStaff: number;
  totalClasses: number;
  totalRevenue: number;
  totalExpenses: number;
  attendanceRate: number;
  feeCollectionRate: number;
  recentActivities: Activity[];
  upcomingEvents: Event[];
  notifications: Notification[];
}

export interface Activity {
  id: string;
  action: string;
  description: string;
  userId: string;
  userName?: string;
  timestamp: string;
}

export interface SchoolSettings {
  id: string;
  schoolName: string;
  schoolLogo?: string;
  schoolBadge?: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  currency: string;
  language: string;
  timezone: string;
  currentTerm: string;
  currentYear: string;
}

export interface ReportCard {
  student: Student;
  school: SchoolSettings;
  term: string;
  year: string;
  grades: Grade[];
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  rank?: number;
  teacherRemarks?: string;
  principalRemarks?: string;
  attendance: { present: number; absent: number; total: number };
}

export interface SearchResult {
  type: 'student' | 'staff' | 'class' | 'fee' | 'book' | 'event' | 'document';
  id: string;
  title: string;
  subtitle: string;
  link: string;
}
