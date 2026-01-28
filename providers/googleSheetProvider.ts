
import { DataProvider } from '../core/dataProvider';
import { 
  ClassInfo, Student, Parent, Attendance, Behavior, 
  Announcement, ClassDocument, Task, TaskReply, Thread, Message, 
  Report, DashboardStats, User, Question
} from '../core/types';

const API_URL = 'https://script.google.com/macros/s/AKfycbyTeDvL45o1EijvJSmWSTvKLz4v7HPj1oF2z9hdDP7WujfjM5VjtAlpTV5BJchA-HMn/exec';

export class GoogleSheetProvider implements DataProvider {
  private async apiCall(action: string, payload: any = {}) {
    const response = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({ action, payload }),
    });
    const result = await response.json();
    if (!result.ok) throw new Error(result.error || 'API Error');
    return result.data;
  }

  async init(): Promise<void> {
    // Backend handles setupDatabase, we just check connectivity
    console.log("Connected to Google Sheets API");
  }

  // --- Auth ---
  async login(username: string, password: string): Promise<User | null> {
    return this.apiCall('login', { username, password });
  }

  async register(user: User): Promise<User> {
    return this.apiCall('create', { tab: 'users', data: user });
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const users = await this.apiCall('list', { tab: 'users', field: 'username', value: username });
    return users.length > 0 ? users[0] : null;
  }

  // --- Dashboard ---
  async getDashboardStats(): Promise<DashboardStats> {
    // Simplistic dashboard logic - could be moved to backend for efficiency
    const [students, ann, tasks, behaviors] = await Promise.all([
      this.getStudents(),
      this.getAnnouncements(),
      this.apiCall('getAll', { tab: 'tasks' }),
      this.apiCall('getAll', { tab: 'behavior' })
    ]);

    return {
      totalStudents: students.length,
      weeklyAttendanceRate: 95, // Hardcoded for now or fetch from backend
      newAnnouncements: ann.length,
      pendingTasks: tasks.length,
      totalPraisePoints: behaviors.filter((b: any) => b.type === 'PRAISE').reduce((sum: number, b: any) => sum + (Number(b.points) || 0), 0),
      totalWarnings: behaviors.filter((b: any) => b.type === 'WARN').length
    };
  }

  // --- CRUDs ---
  async getClasses(): Promise<ClassInfo[]> { return this.apiCall('getAll', { tab: 'classes' }); }
  async addClass(info: ClassInfo): Promise<void> { await this.apiCall('create', { tab: 'classes', data: info }); }
  async updateClass(info: ClassInfo): Promise<void> { await this.apiCall('update', { tab: 'classes', id: info.id, data: info }); }
  async removeClass(id: string): Promise<void> { await this.apiCall('delete', { tab: 'classes', id }); }

  async getStudents(classId?: string): Promise<Student[]> { 
    return this.apiCall('list', { tab: 'students', field: classId ? 'classId' : '', value: classId || '' }); 
  }
  async addStudent(s: Student): Promise<void> { await this.apiCall('create', { tab: 'students', data: s }); }
  async updateStudent(s: Student): Promise<void> { await this.apiCall('update', { tab: 'students', id: s.id, data: s }); }
  async removeStudent(id: string): Promise<void> { await this.apiCall('delete', { tab: 'students', id }); }
  async getStudentByCode(code: string): Promise<Student | null> {
    const list = await this.apiCall('list', { tab: 'students', field: 'code', value: code });
    return list.length > 0 ? list[0] : null;
  }

  async getParents(studentId?: string): Promise<Parent[]> {
    return this.apiCall('list', { tab: 'parents', field: studentId ? 'studentId' : '', value: studentId || '' });
  }
  async addParent(p: Parent): Promise<void> { await this.apiCall('create', { tab: 'parents', data: p }); }
  async updateParent(p: Parent): Promise<void> { await this.apiCall('update', { tab: 'parents', id: p.id, data: p }); }
  async removeParent(id: string): Promise<void> { await this.apiCall('delete', { tab: 'parents', id }); }

  // --- Attendance ---
  async getAttendanceByClassDate(classId: string, date: string): Promise<Attendance[]> {
    const list = await this.apiCall('getAll', { tab: 'attendance' });
    return list.filter((a: any) => a.classId === classId && a.date.substring(0, 10) === date.substring(0, 10));
  }
  async markAttendance(classId: string, date: string, items: Attendance[]): Promise<void> {
    // Delete existing records for that day first to avoid duplicates
    const existing = await this.getAttendanceByClassDate(classId, date);
    for (const record of existing) {
        await this.apiCall('delete', { tab: 'attendance', id: record.id });
    }
    // Add new ones
    for (const item of items) {
        await this.apiCall('create', { tab: 'attendance', data: item });
    }
  }
  async listAttendanceByStudent(studentId: string, month: number, year: number): Promise<Attendance[]> {
    const list = await this.apiCall('list', { tab: 'attendance', field: 'studentId', value: studentId });
    return list.filter((a: any) => {
        const d = new Date(a.date);
        return (d.getMonth() + 1) === month && d.getFullYear() === year;
    });
  }
  async getAttendanceByRange(classId: string, startDate: string, endDate: string): Promise<Attendance[]> {
    const list = await this.apiCall('getAll', { tab: 'attendance' });
    return list.filter((a: any) => a.classId === classId && a.date >= startDate && a.date <= endDate);
  }

  // --- Behavior ---
  async getBehaviors(studentId?: string): Promise<Behavior[]> {
    return this.apiCall('list', { tab: 'behavior', field: studentId ? 'studentId' : '', value: studentId || '' });
  }
  async addBehavior(b: Behavior): Promise<void> { await this.apiCall('create', { tab: 'behavior', data: b }); }
  async updateBehavior(b: Behavior): Promise<void> { await this.apiCall('update', { tab: 'behavior', id: b.id, data: b }); }
  async deleteBehavior(id: string): Promise<void> { await this.apiCall('delete', { tab: 'behavior', id }); }
  async getBehaviorsByClassRange(classId: string, startDate: string, endDate: string): Promise<Behavior[]> {
      const students = await this.getStudents(classId);
      const studentIds = students.map(s => s.id);
      const all = await this.apiCall('getAll', { tab: 'behavior' });
      return all.filter((b: any) => studentIds.includes(b.studentId) && b.date >= startDate && b.date <= endDate);
  }

  // --- Announcements ---
  async getAnnouncements(classId?: string): Promise<Announcement[]> {
    return this.apiCall('list', { tab: 'announcements', field: classId ? 'classId' : '', value: classId || '' });
  }
  async addAnnouncement(a: Announcement): Promise<void> { await this.apiCall('create', { tab: 'announcements', data: a }); }
  async updateAnnouncement(a: Announcement): Promise<void> { await this.apiCall('update', { tab: 'announcements', id: a.id, data: a }); }
  async deleteAnnouncement(id: string): Promise<void> { await this.apiCall('delete', { tab: 'announcements', id }); }

  // --- Documents ---
  async getDocuments(classId?: string): Promise<ClassDocument[]> {
    return this.apiCall('list', { tab: 'documents', field: classId ? 'classId' : '', value: classId || '' });
  }
  async addDocument(d: ClassDocument): Promise<void> { await this.apiCall('create', { tab: 'documents', data: d }); }
  async updateDocument(d: ClassDocument): Promise<void> { await this.apiCall('update', { tab: 'documents', id: d.id, data: d }); }
  async deleteDocument(id: string): Promise<void> { await this.apiCall('delete', { tab: 'documents', id }); }

  // --- Tasks ---
  async getTasks(classId?: string): Promise<Task[]> {
    return this.apiCall('list', { tab: 'tasks', field: classId ? 'classId' : '', value: classId || '' });
  }
  async addTask(t: Task): Promise<void> { await this.apiCall('create', { tab: 'tasks', data: t }); }
  async updateTask(t: Task): Promise<void> { await this.apiCall('update', { tab: 'tasks', id: t.id, data: t }); }
  async deleteTask(id: string): Promise<void> { await this.apiCall('delete', { tab: 'tasks', id }); }

  async getTaskReplies(taskId: string): Promise<TaskReply[]> {
    return this.apiCall('list', { tab: 'taskReplies', field: 'taskId', value: taskId });
  }
  async submitTaskReply(reply: TaskReply): Promise<void> {
    await this.apiCall('create', { tab: 'taskReplies', data: reply });
  }

  // --- Messaging ---
  async getThreads(classId?: string): Promise<Thread[]> {
    return this.apiCall('getAll', { tab: 'messageThreads' });
  }
  async getThreadByStudent(studentId: string): Promise<Thread | null> {
    const list = await this.apiCall('list', { tab: 'messageThreads', field: 'threadKey', value: studentId });
    return list.length > 0 ? list[0] : null;
  }
  async createThread(thread: Thread): Promise<Thread> {
    return this.apiCall('create', { tab: 'messageThreads', data: thread });
  }
  async getMessages(threadId: string): Promise<Message[]> {
    return this.apiCall('list', { tab: 'messages', field: 'threadId', value: threadId });
  }
  async sendMessage(message: Message): Promise<void> {
    await this.apiCall('create', { tab: 'messages', data: message });
    await this.apiCall('update', { tab: 'messageThreads', id: message.threadId, data: { lastMessageAt: message.createdAt } });
  }

  // --- Questions ---
  async getQuestions(): Promise<Question[]> {
    const raw = await this.apiCall('getAll', { tab: 'questions' });
    return raw.map((q: any) => ({
        ...q,
        options: JSON.parse(q.optionsJson || '[]')
    }));
  }
  async addQuestion(q: Question): Promise<void> {
    const { options, ...rest } = q;
    await this.apiCall('create', { tab: 'questions', data: { ...rest, optionsJson: JSON.stringify(options) } });
  }
  async updateQuestion(q: Question): Promise<void> {
    const { options, ...rest } = q;
    await this.apiCall('update', { tab: 'questions', id: q.id, data: { ...rest, optionsJson: JSON.stringify(options) } });
  }
  async deleteQuestion(id: string): Promise<void> { await this.apiCall('delete', { tab: 'questions', id }); }

  // --- Reports ---
  async getReport(classId: string, period: 'weekly' | 'monthly', startDate: string, endDate: string): Promise<Report> {
    const summary = await this.apiCall('getReport', { classId, startDate, endDate });
    return {
        period,
        startDate,
        endDate,
        summary: {
            ...summary,
            topPraised: [], // Backend summary logic is basic, we can enhance later
            topWarned: [],
            tasksDueCount: summary.repliesCount || 0
        }
    };
  }
}
