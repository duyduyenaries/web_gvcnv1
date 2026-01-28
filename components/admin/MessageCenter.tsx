import React, { useEffect, useState, useRef } from 'react';
import { getProvider } from '../../core/provider';
import { Student, ClassInfo, Thread, Message } from '../../core/types';
import { Search, Send, User, MessageCircle } from 'lucide-react';

const MessageCenter: React.FC = () => {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [activeThread, setActiveThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getProvider().getClasses().then(res => {
        setClasses(res);
        if (res.length > 0) setSelectedClassId(res[0].id);
    });
  }, []);

  useEffect(() => {
    if (selectedClassId) {
        getProvider().getStudents(selectedClassId).then(setStudents);
        setSelectedStudent(null);
        setActiveThread(null);
        setMessages([]);
    }
  }, [selectedClassId]);

  useEffect(() => {
      if (selectedStudent) {
          loadThread(selectedStudent.id);
      }
  }, [selectedStudent]);

  useEffect(() => {
      scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadThread = async (studentId: string) => {
      const thread = await getProvider().getThreadByStudent(studentId);
      setActiveThread(thread);
      if (thread) {
          const msgs = await getProvider().getMessages(thread.id);
          setMessages(msgs);
      } else {
          setMessages([]);
      }
  };

  const handleSend = async () => {
      if (!inputText.trim() || !selectedStudent) return;
      
      let threadId = activeThread?.id;

      // Create thread if not exists
      if (!threadId) {
          const newThread: Thread = {
              id: '',
              threadKey: selectedStudent.id,
              participantsJson: JSON.stringify(['GVCN', selectedStudent.fullName]),
              lastMessageAt: new Date().toISOString()
          };
          const created = await getProvider().createThread(newThread);
          setActiveThread(created);
          threadId = created.id;
      }

      const msg: Message = {
          id: '',
          threadId: threadId!,
          fromRole: 'TEACHER',
          content: inputText,
          createdAt: new Date().toISOString()
      };

      await getProvider().sendMessage(msg);
      setMessages(prev => [...prev, msg]);
      setInputText('');
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        {/* Sidebar */}
        <div className="w-1/3 border-r border-slate-100 flex flex-col bg-slate-50">
            <div className="p-4 border-b border-slate-200">
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Lớp học</label>
                <select 
                    className="w-full border p-2 rounded-lg bg-white"
                    value={selectedClassId}
                    onChange={e => setSelectedClassId(e.target.value)}
                >
                    {classes.map(c => <option key={c.id} value={c.id}>{c.className}</option>)}
                </select>
                <div className="mt-3 relative">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={16}/>
                    <input className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm" placeholder="Tìm học sinh..."/>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto">
                {students.map(s => (
                    <div 
                        key={s.id} 
                        onClick={() => setSelectedStudent(s)}
                        className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-white transition flex items-center gap-3 ${selectedStudent?.id === s.id ? 'bg-white border-l-4 border-l-blue-500' : ''}`}
                    >
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                            {s.fullName.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-slate-700 truncate">{s.fullName}</h4>
                            <p className="text-xs text-slate-400">{s.code}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
            {selectedStudent ? (
                <>
                    <div className="h-16 border-b border-slate-100 flex items-center px-6 justify-between bg-white">
                        <div className="flex items-center gap-3">
                            <h3 className="font-bold text-lg text-slate-800">{selectedStudent.fullName}</h3>
                            <span className="text-sm text-slate-400">({selectedStudent.code})</span>
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                        {messages.length === 0 ? (
                            <div className="text-center text-slate-400 mt-10">Chưa có tin nhắn nào. Bắt đầu trò chuyện!</div>
                        ) : (
                            <div className="space-y-4">
                                {messages.map(m => {
                                    const isMe = m.fromRole === 'TEACHER';
                                    return (
                                        <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none'}`}>
                                                <p>{m.content}</p>
                                                <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-blue-200' : 'text-slate-400'}`}>
                                                    {new Date(m.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-white border-t border-slate-100">
                        <div className="flex gap-2">
                            <input 
                                className="flex-1 border p-3 rounded-xl focus:outline-none focus:border-blue-500"
                                placeholder="Nhập tin nhắn..."
                                value={inputText}
                                onChange={e => setInputText(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSend()}
                            />
                            <button onClick={handleSend} className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700">
                                <Send size={20} />
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
                    <MessageCircle size={64} className="mb-4 opacity-50"/>
                    <p className="text-lg">Chọn một học sinh để nhắn tin</p>
                </div>
            )}
        </div>
    </div>
  );
};

export default MessageCenter;