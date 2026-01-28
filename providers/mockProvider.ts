import { DataProvider } from '../core/dataProvider';
import { 
  ClassInfo, Student, Parent, Attendance, Behavior, 
  Announcement, ClassDocument, Task, TaskReply, Thread, Message, 
  Report, DashboardStats, ReportSummary, User, Question
} from '../core/types';

const STORAGE_KEY_PREFIX = 'cls_mgr_';

const generateId = () => Math.random().toString(36).substr(2, 9);
const getStore = <T>(key: string): T[] => {
  const data = localStorage.getItem(STORAGE_KEY_PREFIX + key);
  return data ? JSON.parse(data) : [];
};
const setStore = <T>(key: string, data: T[]) => {
  localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(data));
};

export class MockProvider implements DataProvider {
  async init(): Promise<void> {
    if (!localStorage.getItem(STORAGE_KEY_PREFIX + 'classes')) {
      this.seedData();
    }
  }

  private seedData() {
    // Auth Seed
    const users: User[] = [
      { id: 'u1', username: 'admin', password: '123', fullName: 'Cô Giáo Thảo', role: 'admin' },
      { id: 'u2', username: 'ph', password: '123', fullName: 'PH Nguyễn Văn Tèo', role: 'app', relatedId: 's1' }
    ];

    const classes: ClassInfo[] = [
      { id: 'c1', className: '5A1', schoolYear: '2023-2024', homeroomTeacher: 'Cô Giáo Thảo', note: 'Lớp chọn' },
      { id: 'c2', className: '5A2', schoolYear: '2023-2024', homeroomTeacher: 'Thầy Ba', note: '' }
    ];

    const students: Student[] = [
        { id: 's1', code: 'HS001', fullName: 'Nguyễn Văn Tèo', gender: 'Nam', dob: '2015-05-20', classId: 'c1', address: 'Hà Nội', status: 'Đang học' },
        { id: 's2', code: 'HS002', fullName: 'Trần Thị Tí', gender: 'Nữ', dob: '2015-08-15', classId: 'c1', address: 'Hà Nội', status: 'Đang học' },
    ];

    const parents: Parent[] = [
        { id: 'p1', fullName: 'Nguyễn Văn A (PH)', phone: '0901234567', email: 'pha@email.com', relationship: 'Bố', studentId: 's1' },
    ];

    const announcements: Announcement[] = [
        { id: 'a1', classId: 'c1', title: 'Họp phụ huynh đầu năm', content: 'Kính mời quý phụ huynh...', createdAt: new Date().toISOString(), author: 'Cô Giáo Thảo', target: 'parents', pinned: true },
        { id: 'a2', classId: 'c1', title: 'Lịch thi học kỳ 1', content: 'Lịch thi chi tiết...', createdAt: new Date(Date.now() - 86400000).toISOString(), author: 'Cô Giáo Thảo', target: 'all', pinned: false }
    ];

    const documents: ClassDocument[] = [
        { id: 'd1', classId: 'c1', title: 'Nội quy lớp học', url: '#', category: 'Nội quy', createdAt: new Date().toISOString() },
        { id: 'd2', classId: 'c1', title: 'Thời khóa biểu HK1', url: '#', category: 'Kế hoạch', createdAt: new Date().toISOString() }
    ];
    
    const tasks: Task[] = [
        { id: 't1', classId: 'c1', title: 'Nộp tiền bảo hiểm', description: 'Hạn cuối nộp tiền BHYT', dueDate: '2023-12-31', requireReply: true, createdAt: new Date().toISOString() },
        { id: 't2', classId: 'c1', title: 'Bài tập toán cuối tuần', description: 'Làm bài 1-5 SGK trang 40', dueDate: new Date(Date.now() - 86400000).toISOString().split('T')[0], requireReply: false, createdAt: new Date().toISOString() }
    ];

    const threads: Thread[] = [
      { id: 'th1', threadKey: 's1', participantsJson: '["Cô Giáo Thảo", "Nguyễn Văn Tèo"]', lastMessageAt: new Date().toISOString() }
    ];
    const messages: Message[] = [
      { id: 'm1', threadId: 'th1', fromRole: 'TEACHER', content: 'Chào phụ huynh, em Tèo dạo này học rất tốt.', createdAt: new Date(Date.now() - 1000000).toISOString() },
      { id: 'm2', threadId: 'th1', fromRole: 'PARENT', content: 'Cảm ơn cô, gia đình sẽ đôn đốc thêm.', createdAt: new Date(Date.now() - 500000).toISOString() }
    ];

    const questions: Question[] = [
        { id: 'q1', content: 'Thủ đô của Việt Nam là gì?', options: ['Hồ Chí Minh', 'Đà Nẵng', 'Hà Nội', 'Hải Phòng'], correctIndex: 2 },
        { id: 'q2', content: '5 x 5 bằng bao nhiêu?', options: ['20', '25', '30', '35'], correctIndex: 1 },
        { id: 'q3', content: 'Con vật nào sau đây đẻ trứng?', options: ['Mèo', 'Chó', 'Gà', 'Bò'], correctIndex: 2 },
        { id: 'q4', content: 'Lá cờ Việt Nam có ngôi sao màu gì?', options: ['Xanh', 'Đỏ', 'Vàng', 'Trắng'], correctIndex: 2 },
        { id: 'q5', content: 'Nước nào lớn nhất thế giới?', options: ['Mỹ', 'Trung Quốc', 'Nga', 'Canada'], correctIndex: 2 },
    ];

    localStorage.setItem(STORAGE_KEY_PREFIX + 'users', JSON.stringify(users));
    localStorage.setItem(STORAGE_KEY_PREFIX + 'classes', JSON.stringify(classes));
    localStorage.setItem(STORAGE_KEY_PREFIX + 'parents', JSON.stringify(parents));
    localStorage.setItem(STORAGE_KEY_PREFIX + 'students', JSON.stringify(students));
    localStorage.setItem(STORAGE_KEY_PREFIX + 'announcements', JSON.stringify(announcements));
    localStorage.setItem(STORAGE_KEY_PREFIX + 'documents', JSON.stringify(documents));
    localStorage.setItem(STORAGE_KEY_PREFIX + 'tasks', JSON.stringify(tasks));
    localStorage.setItem(STORAGE_KEY_PREFIX + 'task_replies', JSON.stringify([]));
    localStorage.setItem(STORAGE_KEY_PREFIX + 'threads', JSON.stringify(threads));
    localStorage.setItem(STORAGE_KEY_PREFIX + 'messages', JSON.stringify(messages));
    localStorage.setItem(STORAGE_KEY_PREFIX + 'behaviors', JSON.stringify([]));
    localStorage.setItem(STORAGE_KEY_PREFIX + 'attendance', JSON.stringify([]));
    localStorage.setItem(STORAGE_KEY_PREFIX + 'questions', JSON.stringify(questions));
  }

  // --- Auth ---
  async login(username: string, pass: string): Promise<User | null> {
      const users = getStore<User>('users');
      const user = users.find(u => u.username === username && u.password === pass);
      if (user) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { password, ...safeUser } = user;
          return safeUser as User;
      }
      return null;
  }

  async register(user: User): Promise<User> {
      const users = getStore<User>('users');
      if (users.find(u => u.username === user.username)) {
          throw new Error('Tên đăng nhập đã tồn tại');
      }
      const newUser = { ...user, id: generateId() };
      users.push(newUser);
      setStore('users', users);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...safeUser } = newUser;
      return safeUser as User;
  }

  async getUserByUsername(username: string): Promise<User | null> {
      const users = getStore<User>('users');
      return users.find(u => u.username === username) || null;
  }

  // --- Dashboard ---
  async getDashboardStats(): Promise<DashboardStats> {
    const students = await this.getStudents();
    const announcements = await this.getAnnouncements();
    const attendance = getStore<Attendance>('attendance');
    const behaviors = getStore<Behavior>('behaviors');
    const tasks = getStore<Task>('tasks');
    
    const weeklyRate = attendance.length > 0 
      ? (attendance.filter(a => a.status === 'PRESENT').length / attendance.length) * 100 
      : 100;

    const totalPraisePoints = behaviors
        .filter(b => b.type === 'PRAISE')
        .reduce((sum, b) => sum + (b.points || 0), 0);
    
    const totalWarnings = behaviors.filter(b => b.type === 'WARN').length;

    return {
      totalStudents: students.length,
      weeklyAttendanceRate: Math.round(weeklyRate),
      newAnnouncements: announcements.length,
      pendingTasks: tasks.length,
      totalPraisePoints,
      totalWarnings
    };
  }

  // --- Basic CRUDs (Classes, Students, Parents) ---
  async getClasses(): Promise<ClassInfo[]> { return getStore<ClassInfo>('classes'); }
  async addClass(info: ClassInfo): Promise<void> { const l = getStore<ClassInfo>('classes'); l.push({...info, id: generateId()}); setStore('classes', l); }
  async updateClass(info: ClassInfo): Promise<void> { const l = getStore<ClassInfo>('classes'); const i = l.findIndex(x => x.id === info.id); if(i!==-1) {l[i]=info; setStore('classes', l);} }
  async removeClass(id: string): Promise<void> { setStore('classes', getStore<ClassInfo>('classes').filter(x => x.id !== id)); }

  async getStudents(classId?: string): Promise<Student[]> { 
    const l = getStore<Student>('students'); 
    return classId ? l.filter(s => s.classId === classId) : l; 
  }
  async addStudent(s: Student): Promise<void> { const l = getStore<Student>('students'); l.push({...s, id: s.id || generateId()}); setStore('students', l); }
  async updateStudent(s: Student): Promise<void> { const l = getStore<Student>('students'); const i = l.findIndex(x => x.id === s.id); if(i!==-1) {l[i]=s; setStore('students', l);} }
  async removeStudent(id: string): Promise<void> { setStore('students', getStore<Student>('students').filter(x => x.id !== id)); }
  async getStudentByCode(code: string): Promise<Student | null> {
      const l = getStore<Student>('students');
      return l.find(s => s.code === code) || null;
  }

  async getParents(studentId?: string): Promise<Parent[]> { 
    const l = getStore<Parent>('parents'); 
    return studentId ? l.filter(p => p.studentId === studentId) : l; 
  }
  async addParent(p: Parent): Promise<void> { const l = getStore<Parent>('parents'); l.push({...p, id: generateId()}); setStore('parents', l); }
  async updateParent(p: Parent): Promise<void> { const l = getStore<Parent>('parents'); const i = l.findIndex(x => x.id === p.id); if(i!==-1) {l[i]=p; setStore('parents', l);} }
  async removeParent(id: string): Promise<void> { setStore('parents', getStore<Parent>('parents').filter(x => x.id !== id)); }

  // --- Attendance ---
  async getAttendanceByClassDate(classId: string, date: string): Promise<Attendance[]> {
    return getStore<Attendance>('attendance').filter(a => a.classId === classId && a.date === date);
  }
  async markAttendance(classId: string, date: string, items: Attendance[]): Promise<void> {
    let list = getStore<Attendance>('attendance').filter(a => !(a.classId === classId && a.date === date));
    list.push(...items.map(i => ({...i, id: i.id || generateId(), classId, date})));
    setStore('attendance', list);
  }
  async listAttendanceByStudent(studentId: string, month: number, year: number): Promise<Attendance[]> {
    return getStore<Attendance>('attendance').filter(a => {
        const d = new Date(a.date);
        return a.studentId === studentId && (d.getMonth() + 1) === month && d.getFullYear() === year;
    });
  }
  async getAttendanceByRange(classId: string, startDate: string, endDate: string): Promise<Attendance[]> {
    return getStore<Attendance>('attendance').filter(a => 
      a.classId === classId && a.date >= startDate && a.date <= endDate
    );
  }

  // --- Behavior ---
  async getBehaviors(studentId?: string): Promise<Behavior[]> {
    const list = getStore<Behavior>('behaviors');
    const res = studentId ? list.filter(b => b.studentId === studentId) : list;
    return res.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  async addBehavior(b: Behavior): Promise<void> { const l = getStore<Behavior>('behaviors'); l.push({...b, id: generateId()}); setStore('behaviors', l); }
  async updateBehavior(b: Behavior): Promise<void> { const l = getStore<Behavior>('behaviors'); const i = l.findIndex(x => x.id === b.id); if(i!==-1) {l[i]=b; setStore('behaviors', l);} }
  async deleteBehavior(id: string): Promise<void> { setStore('behaviors', getStore<Behavior>('behaviors').filter(x => x.id !== id)); }
  async getBehaviorsByClassRange(classId: string, startDate: string, endDate: string): Promise<Behavior[]> {
      const students = await this.getStudents(classId);
      const studentIds = students.map(s => s.id);
      return getStore<Behavior>('behaviors').filter(b => 
          studentIds.includes(b.studentId) && b.date >= startDate && b.date <= endDate
      );
  }

  // --- Announcements ---
  async getAnnouncements(classId?: string): Promise<Announcement[]> {
    const list = getStore<Announcement>('announcements');
    const filtered = classId ? list.filter(a => a.classId === classId) : list;
    return filtered.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }
  async addAnnouncement(a: Announcement): Promise<void> { const l = getStore<Announcement>('announcements'); l.push({...a, id: generateId()}); setStore('announcements', l); }
  async updateAnnouncement(a: Announcement): Promise<void> { const l = getStore<Announcement>('announcements'); const i = l.findIndex(x => x.id === a.id); if(i!==-1) {l[i]=a; setStore('announcements', l);} }
  async deleteAnnouncement(id: string): Promise<void> { setStore('announcements', getStore<Announcement>('announcements').filter(x => x.id !== id)); }

  // --- Documents ---
  async getDocuments(classId?: string): Promise<ClassDocument[]> {
    const list = getStore<ClassDocument>('documents');
    return classId ? list.filter(d => d.classId === classId) : list;
  }
  async addDocument(d: ClassDocument): Promise<void> { const l = getStore<ClassDocument>('documents'); l.push({...d, id: generateId()}); setStore('documents', l); }
  async updateDocument(d: ClassDocument): Promise<void> { const l = getStore<ClassDocument>('documents'); const i = l.findIndex(x => x.id === d.id); if(i!==-1) {l[i]=d; setStore('documents', l);} }
  async deleteDocument(id: string): Promise<void> { setStore('documents', getStore<ClassDocument>('documents').filter(x => x.id !== id)); }

  // --- Tasks ---
  async getTasks(classId?: string): Promise<Task[]> {
    const list = getStore<Task>('tasks');
    const filtered = classId ? list.filter(t => t.classId === classId) : list;
    return filtered.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  async addTask(t: Task): Promise<void> { const l = getStore<Task>('tasks'); l.push({...t, id: generateId()}); setStore('tasks', l); }
  async updateTask(t: Task): Promise<void> { const l = getStore<Task>('tasks'); const i = l.findIndex(x => x.id === t.id); if(i!==-1) {l[i]=t; setStore('tasks', l);} }
  async deleteTask(id: string): Promise<void> { setStore('tasks', getStore<Task>('tasks').filter(x => x.id !== id)); }

  async getTaskReplies(taskId: string): Promise<TaskReply[]> {
    return getStore<TaskReply>('task_replies').filter(r => r.taskId === taskId);
  }
  async submitTaskReply(reply: TaskReply): Promise<void> {
    const l = getStore<TaskReply>('task_replies');
    const existingIdx = l.findIndex(r => r.taskId === reply.taskId && r.studentId === reply.studentId);
    if(existingIdx !== -1) {
        l[existingIdx] = {...reply, id: l[existingIdx].id};
    } else {
        l.push({...reply, id: generateId()});
    }
    setStore('task_replies', l);
  }

  // --- Messaging ---
  async getThreads(classId?: string): Promise<Thread[]> {
    const threads = getStore<Thread>('threads');
    return threads.sort((a,b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
  }

  async getThreadByStudent(studentId: string): Promise<Thread | null> {
      const threads = getStore<Thread>('threads');
      return threads.find(t => t.threadKey === studentId) || null;
  }

  async createThread(thread: Thread): Promise<Thread> {
      const threads = getStore<Thread>('threads');
      const newThread = {...thread, id: generateId()};
      threads.push(newThread);
      setStore('threads', threads);
      return newThread;
  }

  async getMessages(threadId: string): Promise<Message[]> {
      const messages = getStore<Message>('messages');
      return messages.filter(m => m.threadId === threadId).sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async sendMessage(message: Message): Promise<void> {
      const messages = getStore<Message>('messages');
      messages.push({...message, id: generateId()});
      setStore('messages', messages);

      const threads = getStore<Thread>('threads');
      const threadIdx = threads.findIndex(t => t.id === message.threadId);
      if(threadIdx !== -1) {
          threads[threadIdx].lastMessageAt = message.createdAt;
          setStore('threads', threads);
      }
  }

  // --- Question Bank ---
  async getQuestions(): Promise<Question[]> {
      return getStore<Question>('questions');
  }
  async addQuestion(q: Question): Promise<void> {
      const l = getStore<Question>('questions');
      l.push({...q, id: generateId()});
      setStore('questions', l);
  }
  async updateQuestion(q: Question): Promise<void> {
      const l = getStore<Question>('questions');
      const i = l.findIndex(x => x.id === q.id);
      if(i!==-1) { l[i] = q; setStore('questions', l); }
  }
  async deleteQuestion(id: string): Promise<void> {
      setStore('questions', getStore<Question>('questions').filter(x => x.id !== id));
  }

  // --- Reports ---
  async getReport(classId: string, period: 'weekly' | 'monthly', startDate: string, endDate: string): Promise<Report> {
      // 1. Data Fetching
      const students = await this.getStudents(classId);
      const atts = await this.getAttendanceByRange(classId, startDate, endDate);
      const behaviors = await this.getBehaviorsByClassRange(classId, startDate, endDate);
      const allTasks = await this.getTasks(classId);
      // Filter tasks due in range
      const tasksInRange = allTasks.filter(t => t.dueDate >= startDate && t.dueDate <= endDate);
      const allReplies = getStore<TaskReply>('task_replies');
      // Filter replies for tasks of this class created in range
      const relevantReplies = allReplies.filter(r => {
          const task = allTasks.find(t => t.id === r.taskId);
          return task && r.createdAt >= startDate && r.createdAt <= endDate;
      });

      // 2. Calculations
      const attendanceRate = atts.length > 0 
          ? (atts.filter(a => a.status === 'PRESENT').length / atts.length) * 100 
          : 0;
      
      const absentCount = atts.filter(a => a.status === 'ABSENT').length;
      const lateCount = atts.filter(a => a.status === 'LATE').length;

      // Top Praised/Warned
      const scoreMap: Record<string, { praise: number; warn: number; points: number }> = {};
      students.forEach(s => scoreMap[s.id] = { praise: 0, warn: 0, points: 0 });
      
      behaviors.forEach(b => {
          if (scoreMap[b.studentId]) {
              if (b.type === 'PRAISE') scoreMap[b.studentId].praise++;
              else scoreMap[b.studentId].warn++;
              scoreMap[b.studentId].points += (b.type === 'PRAISE' ? b.points : -b.points);
          }
      });

      const topPraised = Object.entries(scoreMap)
          .sort(([,a], [,b]) => b.points - a.points)
          .slice(0, 3)
          .map(([sid, val]) => ({
              studentName: students.find(s => s.id === sid)?.fullName || 'Unknown',
              count: val.praise,
              points: val.points
          }))
          .filter(x => x.count > 0);

      const topWarned = Object.entries(scoreMap)
          .sort(([,a], [,b]) => b.warn - a.warn)
          .slice(0, 3)
          .map(([sid, val]) => ({
              studentName: students.find(s => s.id === sid)?.fullName || 'Unknown',
              count: val.warn
          }))
          .filter(x => x.count > 0);

      const summary: ReportSummary = {
          attendanceRate: Math.round(attendanceRate),
          absentCount,
          lateCount,
          topPraised,
          topWarned,
          tasksDueCount: tasksInRange.length,
          repliesCount: relevantReplies.length
      };

      return {
          period,
          startDate,
          endDate,
          summary
      };
  }
}