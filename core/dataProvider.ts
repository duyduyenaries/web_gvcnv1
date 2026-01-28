import { 
  ClassInfo, Student, Parent, Attendance, Behavior, 
  Announcement, ClassDocument, Task, TaskReply, Thread, Message, 
  Report, DashboardStats, User, Question
} from './types';

export interface DataProvider {
  init(): Promise<void>;

  // Auth
  login(username: string, password: string): Promise<User | null>;
  register(user: User): Promise<User>;
  getUserByUsername(username: string): Promise<User | null>;

  // Dashboard
  getDashboardStats(): Promise<DashboardStats>;

  // Class CRUD
  getClasses(): Promise<ClassInfo[]>;
  addClass(info: ClassInfo): Promise<void>;
  updateClass(info: ClassInfo): Promise<void>;
  removeClass(id: string): Promise<void>;

  // Student CRUD
  getStudents(classId?: string): Promise<Student[]>;
  addStudent(student: Student): Promise<void>;
  updateStudent(student: Student): Promise<void>;
  removeStudent(id: string): Promise<void>;
  getStudentByCode(code: string): Promise<Student | null>; // Helper for registration

  // Parent CRUD
  getParents(studentId?: string): Promise<Parent[]>;
  addParent(parent: Parent): Promise<void>;
  updateParent(parent: Parent): Promise<void>;
  removeParent(id: string): Promise<void>;

  // Attendance
  getAttendanceByClassDate(classId: string, date: string): Promise<Attendance[]>;
  markAttendance(classId: string, date: string, items: Attendance[]): Promise<void>; 
  listAttendanceByStudent(studentId: string, month: number, year: number): Promise<Attendance[]>;
  // For Reports/Export
  getAttendanceByRange(classId: string, startDate: string, endDate: string): Promise<Attendance[]>;

  // Behavior
  getBehaviors(studentId?: string): Promise<Behavior[]>;
  addBehavior(behavior: Behavior): Promise<void>;
  updateBehavior(behavior: Behavior): Promise<void>;
  deleteBehavior(id: string): Promise<void>;
  // For Reports/Export
  getBehaviorsByClassRange(classId: string, startDate: string, endDate: string): Promise<Behavior[]>;

  // Announcements
  getAnnouncements(classId?: string): Promise<Announcement[]>;
  addAnnouncement(announcement: Announcement): Promise<void>;
  updateAnnouncement(announcement: Announcement): Promise<void>;
  deleteAnnouncement(id: string): Promise<void>;

  // Documents
  getDocuments(classId?: string): Promise<ClassDocument[]>;
  addDocument(doc: ClassDocument): Promise<void>;
  updateDocument(doc: ClassDocument): Promise<void>;
  deleteDocument(id: string): Promise<void>;

  // Tasks
  getTasks(classId?: string): Promise<Task[]>;
  addTask(task: Task): Promise<void>;
  updateTask(task: Task): Promise<void>;
  deleteTask(id: string): Promise<void>;
  
  // Task Replies
  getTaskReplies(taskId: string): Promise<TaskReply[]>;
  submitTaskReply(reply: TaskReply): Promise<void>;

  // Messaging
  getThreads(classId?: string): Promise<Thread[]>;
  getThreadByStudent(studentId: string): Promise<Thread | null>;
  createThread(thread: Thread): Promise<Thread>;
  getMessages(threadId: string): Promise<Message[]>;
  sendMessage(message: Message): Promise<void>;

  // Question Bank
  getQuestions(): Promise<Question[]>;
  addQuestion(question: Question): Promise<void>;
  updateQuestion(question: Question): Promise<void>;
  deleteQuestion(id: string): Promise<void>;

  // Reports
  getReport(classId: string, period: 'weekly' | 'monthly', startDate: string, endDate: string): Promise<Report>;
}