import React, { useEffect, useState } from 'react';
import { getProvider } from '../../core/provider';
import { Task, TaskReply, Student } from '../../core/types';
import { ClipboardList, AlertTriangle, CheckCircle, Upload, Link as LinkIcon, Plus, Trash2, Send } from 'lucide-react';

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [replies, setReplies] = useState<TaskReply[]>([]);
  const [student, setStudent] = useState<Student | null>(null);

  // Form State
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [links, setLinks] = useState<string[]>(['']);

  useEffect(() => {
    // Login mockup
    getProvider().getStudents().then(async (list) => {
        if (list.length > 0) {
            const currentStudent = list[0];
            setStudent(currentStudent);
            
            // Load Tasks
            const tList = await getProvider().getTasks(currentStudent.classId);
            setTasks(tList);

            // Load all replies for this student's tasks (Inefficient in real app, better verify per task or batch)
            const allReplies: TaskReply[] = [];
            for (const t of tList) {
                const reps = await getProvider().getTaskReplies(t.id);
                const myRep = reps.find(r => r.studentId === currentStudent.id);
                if(myRep) allReplies.push(myRep);
            }
            setReplies(allReplies);
        }
    });
  }, []);

  const getReply = (taskId: string) => replies.find(r => r.taskId === taskId);

  const isOverdue = (task: Task) => {
      const today = new Date().toISOString().split('T')[0];
      return task.dueDate < today && !getReply(task.id);
  };

  const handleSubmit = async (taskId: string) => {
      if(!student) return;
      
      const validLinks = links.filter(l => l.trim() !== '');
      const reply: TaskReply = {
          id: '',
          taskId,
          studentId: student.id,
          replyText,
          attachmentsJson: JSON.stringify(validLinks),
          createdAt: new Date().toISOString()
      };
      
      await getProvider().submitTaskReply(reply);
      
      // Update local state
      const newReplies = [...replies.filter(r => r.taskId !== taskId), reply];
      setReplies(newReplies);
      setActiveTaskId(null);
      setReplyText('');
      setLinks(['']);
      alert('Đã gửi phản hồi thành công!');
  };

  if(!student) return <div>Đang tải...</div>;

  return (
    <div className="space-y-6">
        <div>
            <h2 className="text-2xl font-bold text-slate-800">Bài tập & Nhắc việc</h2>
            <p className="text-slate-500">Theo dõi hạn nộp bài và các nhiệm vụ cần làm</p>
        </div>

        <div className="space-y-4">
            {tasks.map(task => {
                const reply = getReply(task.id);
                const overdue = isOverdue(task);
                const isOpen = activeTaskId === task.id;

                return (
                    <div key={task.id} className={`bg-white rounded-xl shadow-sm border overflow-hidden ${overdue ? 'border-red-200' : 'border-slate-100'}`}>
                         <div className="p-6">
                            <div className="flex justify-between items-start">
                                <div className="flex gap-4">
                                    <div className={`p-3 rounded-lg h-fit ${reply ? 'bg-green-50 text-green-600' : overdue ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                                        <ClipboardList size={24}/>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-lg mb-1">{task.title}</h4>
                                        <p className="text-slate-600 mb-2">{task.description}</p>
                                        <div className="flex items-center gap-4 text-sm">
                                            <span className={`${overdue ? 'text-red-600 font-bold' : 'text-slate-500'}`}>
                                                Hạn: {new Date(task.dueDate).toLocaleDateString()}
                                            </span>
                                            {overdue && <span className="flex items-center gap-1 text-red-600 text-xs font-bold bg-red-50 px-2 py-0.5 rounded"><AlertTriangle size={12}/> Quá hạn</span>}
                                        </div>
                                    </div>
                                </div>
                                
                                {reply ? (
                                    <div className="flex flex-col items-end">
                                        <span className="flex items-center gap-1 text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full text-sm">
                                            <CheckCircle size={16}/> Đã hoàn thành
                                        </span>
                                    </div>
                                ) : task.requireReply ? (
                                    <button 
                                        onClick={() => setActiveTaskId(isOpen ? null : task.id)}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition"
                                    >
                                        {isOpen ? 'Đóng' : 'Nộp bài / Phản hồi'}
                                    </button>
                                ) : (
                                    <span className="text-slate-400 text-sm italic">Chỉ xem</span>
                                )}
                            </div>
                         </div>

                         {/* REPLY FORM */}
                         {isOpen && !reply && (
                             <div className="bg-slate-50 p-6 border-t border-slate-100">
                                 <h5 className="font-bold text-slate-700 mb-3 flex items-center gap-2"><Upload size={18}/> Gửi phản hồi của bạn</h5>
                                 <div className="space-y-3">
                                     <textarea 
                                        className="w-full border p-3 rounded-lg focus:outline-none focus:border-blue-500"
                                        placeholder="Nhập nội dung phản hồi..."
                                        rows={3}
                                        value={replyText}
                                        onChange={e => setReplyText(e.target.value)}
                                     />
                                     
                                     <div className="space-y-2">
                                         <label className="text-xs font-bold text-slate-500 uppercase">Đính kèm liên kết (Ảnh/Video/Drive)</label>
                                         {links.map((link, idx) => (
                                             <div key={idx} className="flex gap-2">
                                                 <div className="relative flex-1">
                                                     <LinkIcon className="absolute left-3 top-2.5 text-slate-400" size={16}/>
                                                     <input 
                                                        className="w-full border pl-9 pr-3 py-2 rounded-lg text-sm"
                                                        placeholder="https://..."
                                                        value={link}
                                                        onChange={e => {
                                                            const newLinks = [...links];
                                                            newLinks[idx] = e.target.value;
                                                            setLinks(newLinks);
                                                        }}
                                                     />
                                                 </div>
                                                 {links.length > 1 && (
                                                     <button onClick={() => setLinks(links.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-600"><Trash2 size={18}/></button>
                                                 )}
                                             </div>
                                         ))}
                                         <button onClick={() => setLinks([...links, ''])} className="text-blue-600 text-sm font-medium flex items-center gap-1 hover:underline">
                                             <Plus size={14}/> Thêm liên kết
                                         </button>
                                     </div>

                                     <div className="flex justify-end pt-2">
                                         <button onClick={() => handleSubmit(task.id)} className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-green-700">
                                             <Send size={18}/> Gửi đi
                                         </button>
                                     </div>
                                 </div>
                             </div>
                         )}

                         {/* VIEW REPLY (READ-ONLY) */}
                         {reply && (
                             <div className="bg-slate-50 p-6 border-t border-slate-100 text-sm">
                                 <p className="font-bold text-slate-700 mb-1">Nội dung đã gửi:</p>
                                 <p className="text-slate-600 mb-2">{reply.replyText}</p>
                                 <div className="flex flex-wrap gap-2">
                                     {(() => {
                                         try {
                                             return (JSON.parse(reply.attachmentsJson) as string[]).map((l, i) => (
                                                 <a key={i} href={l} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline bg-blue-50 px-2 py-1 rounded border border-blue-100 flex items-center gap-1">
                                                     <LinkIcon size={12}/> Link đính kèm {i+1}
                                                 </a>
                                             ));
                                         } catch { return null; }
                                     })()}
                                 </div>
                             </div>
                         )}
                    </div>
                );
            })}
            {tasks.length === 0 && (
                <div className="p-12 text-center text-slate-400">Không có bài tập hay nhắc nhở nào.</div>
            )}
        </div>
    </div>
  );
};

export default TaskList;