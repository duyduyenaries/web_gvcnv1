import React, { useEffect, useState } from 'react';
import { getProvider } from '../../core/provider';
import { Task, ClassInfo, Student, TaskReply } from '../../core/types';
import { Plus, Edit, Trash2, ClipboardList, Eye, ArrowLeft, ExternalLink, CheckCircle, XCircle } from 'lucide-react';

const TaskManager: React.FC = () => {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [tasks, setTasks] = useState<Task[]>([]);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Partial<Task>>({});

  // Monitoring State
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [replies, setReplies] = useState<TaskReply[]>([]);

  useEffect(() => {
    getProvider().getClasses().then(res => {
        setClasses(res);
        if (res.length > 0) setSelectedClassId(res[0].id);
    });
  }, []);

  useEffect(() => {
    if (selectedClassId) loadTasks();
  }, [selectedClassId]);

  useEffect(() => {
    if (viewingTask) loadMonitorData();
  }, [viewingTask]);

  const loadTasks = async () => {
    const list = await getProvider().getTasks(selectedClassId);
    setTasks(list);
  };

  const loadMonitorData = async () => {
      if(!viewingTask) return;
      const [stu, rep] = await Promise.all([
          getProvider().getStudents(selectedClassId),
          getProvider().getTaskReplies(viewingTask.id)
      ]);
      setStudents(stu);
      setReplies(rep);
  };

  const handleSave = async () => {
    if (!currentTask.title || !currentTask.dueDate || !selectedClassId) return alert('Nhập tiêu đề và hạn hoàn thành.');
    
    const payload = {
        ...currentTask,
        classId: selectedClassId,
        createdAt: currentTask.createdAt || new Date().toISOString(),
        requireReply: currentTask.requireReply || false,
        description: currentTask.description || ''
    } as Task;

    if (currentTask.id) {
        await getProvider().updateTask(payload);
    } else {
        await getProvider().addTask(payload);
    }
    setIsModalOpen(false);
    loadTasks();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Xóa nhắc việc này?')) {
        await getProvider().deleteTask(id);
        loadTasks();
    }
  };

  const parseAttachments = (json: string) => {
      try { return JSON.parse(json) as string[]; } catch { return []; }
  };

  // --- RENDER DETAIL VIEW (MONITORING) ---
  if (viewingTask) {
      return (
          <div className="space-y-6">
              <button onClick={() => setViewingTask(null)} className="flex items-center gap-2 text-slate-500 hover:text-blue-600">
                  <ArrowLeft size={18}/> Quay lại danh sách
              </button>
              
              <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                  <div className="flex justify-between">
                      <h2 className="text-2xl font-bold text-slate-800">{viewingTask.title}</h2>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${viewingTask.requireReply ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                          {viewingTask.requireReply ? 'Yêu cầu phản hồi' : 'Chỉ xem'}
                      </span>
                  </div>
                  <p className="text-slate-600 mt-2">{viewingTask.description}</p>
                  <div className="text-sm text-slate-400 mt-2">Hạn: {new Date(viewingTask.dueDate).toLocaleDateString()}</div>
              </div>

              {viewingTask.requireReply ? (
                  <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                      <table className="w-full text-left">
                          <thead className="bg-slate-50 text-slate-500 text-sm uppercase">
                              <tr>
                                  <th className="p-4 border-b">Học sinh</th>
                                  <th className="p-4 border-b text-center">Trạng thái</th>
                                  <th className="p-4 border-b">Nội dung phản hồi</th>
                                  <th className="p-4 border-b">Đính kèm</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                              {students.map(s => {
                                  const reply = replies.find(r => r.studentId === s.id);
                                  const attachments = reply ? parseAttachments(reply.attachmentsJson) : [];
                                  return (
                                      <tr key={s.id} className="hover:bg-slate-50">
                                          <td className="p-4 font-medium">{s.fullName} <div className="text-xs text-slate-400">{s.code}</div></td>
                                          <td className="p-4 text-center">
                                              {reply ? 
                                                  <span className="inline-flex items-center gap-1 text-green-600 font-bold text-sm"><CheckCircle size={16}/> Đã nộp</span> : 
                                                  <span className="inline-flex items-center gap-1 text-slate-400 text-sm"><XCircle size={16}/> Chưa nộp</span>
                                              }
                                          </td>
                                          <td className="p-4 text-slate-700">{reply?.replyText || '-'}</td>
                                          <td className="p-4">
                                              <div className="flex flex-col gap-1">
                                                  {attachments.map((link, i) => (
                                                      <a key={i} href={link} target="_blank" rel="noreferrer" className="text-blue-500 text-xs flex items-center gap-1 hover:underline">
                                                          Link {i+1} <ExternalLink size={10}/>
                                                      </a>
                                                  ))}
                                              </div>
                                          </td>
                                      </tr>
                                  );
                              })}
                          </tbody>
                      </table>
                  </div>
              ) : (
                  <div className="p-12 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
                      Việc này không yêu cầu phụ huynh/học sinh phản hồi.
                  </div>
              )}
          </div>
      );
  }

  // --- RENDER LIST VIEW ---
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Chọn Lớp</label>
            <select 
                className="border p-2 rounded-lg bg-white min-w-[200px]"
                value={selectedClassId}
                onChange={e => setSelectedClassId(e.target.value)}
            >
                {classes.map(c => <option key={c.id} value={c.id}>{c.className}</option>)}
            </select>
        </div>
        <button 
          onClick={() => { setCurrentTask({ requireReply: true, dueDate: new Date().toISOString().split('T')[0] }); setIsModalOpen(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <Plus size={18} /> Giao việc / Bài tập
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {tasks.map(task => (
            <div key={task.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                        <ClipboardList size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-800 text-lg">{task.title}</h4>
                        <p className="text-slate-500 text-sm line-clamp-1">{task.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs">
                             <span className="font-medium text-slate-600">Hạn: {new Date(task.dueDate).toLocaleDateString()}</span>
                             {task.requireReply && <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded font-bold">Yêu cầu phản hồi</span>}
                        </div>
                    </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto justify-end">
                    <button onClick={() => setViewingTask(task)} className="px-3 py-2 bg-slate-100 text-slate-600 rounded hover:bg-slate-200 flex items-center gap-2 text-sm font-medium">
                        <Eye size={16}/> Xem chi tiết
                    </button>
                    <button onClick={() => { setCurrentTask(task); setIsModalOpen(true); }} className="p-2 text-slate-400 hover:bg-slate-50 hover:text-blue-600 rounded">
                        <Edit size={18}/>
                    </button>
                    <button onClick={() => handleDelete(task.id)} className="p-2 text-slate-400 hover:bg-slate-50 hover:text-red-600 rounded">
                        <Trash2 size={18}/>
                    </button>
                </div>
            </div>
        ))}
        {tasks.length === 0 && <div className="p-12 text-center text-slate-400">Chưa có nhiệm vụ nào.</div>}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl w-full max-w-lg">
                <h3 className="text-xl font-bold mb-4">{currentTask.id ? 'Sửa nhiệm vụ' : 'Giao việc mới'}</h3>
                <div className="space-y-4">
                    <input className="w-full border p-2 rounded font-bold" placeholder="Tiêu đề (VD: Bài tập toán, Nộp BHYT)" value={currentTask.title || ''} onChange={e => setCurrentTask({...currentTask, title: e.target.value})}/>
                    <textarea className="w-full border p-2 rounded h-24" placeholder="Mô tả chi tiết..." value={currentTask.description || ''} onChange={e => setCurrentTask({...currentTask, description: e.target.value})}/>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Hạn hoàn thành</label>
                            <input type="date" className="w-full border p-2 rounded" value={currentTask.dueDate || ''} onChange={e => setCurrentTask({...currentTask, dueDate: e.target.value})}/>
                        </div>
                        <div className="flex items-center gap-2 pt-6">
                            <input type="checkbox" id="reqReply" checked={currentTask.requireReply} onChange={e => setCurrentTask({...currentTask, requireReply: e.target.checked})} className="w-5 h-5 text-blue-600"/>
                            <label htmlFor="reqReply" className="text-slate-700 font-medium cursor-pointer">Yêu cầu phản hồi</label>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                    <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">Hủy</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Lưu</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default TaskManager;