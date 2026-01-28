// Các thực thể cơ bản (Entities)

export interface User {
  id: string;
  username: string;
  password?: string; // Optional when returning to UI
  fullName: string;
  role: 'admin' | 'app'; // admin = Teacher, app = Parent/Student
  relatedId?: string; // Link to Student ID if role is 'app'
}

export interface ClassInfo {
  id: string;
  className: string;
  schoolYear: string;
  homeroomTeacher: string;
  note?: string;
}

export interface Parent {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  relationship: 'Bố' | 'Mẹ' | 'Ông' | 'Bà' | 'Khác';
  studentId: string; // Link to Student
}

export interface Student {
  id: string;
  code: string;
  fullName: string;
  classId: string; // Link to ClassInfo
  gender: 'Nam' | 'Nữ';
  dob: string; // Date of birth YYYY-MM-DD
  address: string;
  status: 'Đang học' | 'Đã nghỉ' | 'Chuyển trường';
  parentId?: string; // Optional legacy link
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE';

export interface Attendance {
  id: string;
  classId: string; // Added class context
  studentId: string;
  date: string; // ISO Date YYYY-MM-DD
  status: AttendanceStatus;
  note?: string;
}

export type BehaviorType = 'PRAISE' | 'WARN';

export interface Behavior {
  id: string;
  studentId: string;
  date: string;
  type: BehaviorType;
  content: string;
  points: number; // e.g., +1, -1, -5
}

export interface Announcement {
  id: string;
  classId: string;
  title: string;
  content: string;
  createdAt: string; // ISO String
  author: string;
  target: 'all' | 'parents' | 'students';
  pinned: boolean; // New field
}

export interface ClassDocument {
  id: string;
  classId: string;
  title: string;
  url: string;
  category: string; // Nội quy, Kế hoạch, Biểu mẫu...
  createdAt: string;
}

export interface Task {
  id: string;
  classId: string;
  title: string;
  description: string;
  dueDate: string; // ISO Date YYYY-MM-DD or DateTime
  requireReply: boolean;
  createdAt: string;
}

export interface TaskReply {
  id: string;
  taskId: string;
  studentId: string;
  replyText: string;
  attachmentsJson: string; // JSON string of string[] (urls)
  createdAt: string;
}

export interface Thread {
  id: string;
  threadKey: string; // Usually studentId or classId
  participantsJson: string; // JSON string of names e.g. ["GVCN", "Phụ huynh em Tèo"]
  lastMessageAt: string;
}

export type MessageRole = 'TEACHER' | 'PARENT' | 'STUDENT';

export interface Message {
  id: string;
  threadId: string;
  fromRole: MessageRole;
  content: string;
  createdAt: string;
}

export interface Question {
  id: string;
  content: string;
  options: string[]; // Array of 4 strings
  correctIndex: number; // 0, 1, 2, 3
}

export interface ReportSummary {
  attendanceRate: number;
  absentCount: number;
  lateCount: number;
  topPraised: { studentName: string; count: number; points: number }[];
  topWarned: { studentName: string; count: number }[];
  tasksDueCount: number;
  repliesCount: number;
}

export interface Report {
  period: 'weekly' | 'monthly';
  startDate: string;
  endDate: string;
  summary: ReportSummary;
}

export interface DashboardStats {
  totalStudents: number;
  weeklyAttendanceRate: number;
  newAnnouncements: number;
  pendingTasks: number;
  totalPraisePoints: number;
  totalWarnings: number;
}