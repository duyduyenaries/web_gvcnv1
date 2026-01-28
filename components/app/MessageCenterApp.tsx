import React, { useEffect, useState, useRef } from 'react';
import { getProvider } from '../../core/provider';
import { Student, Thread, Message } from '../../core/types';
import { Send, User } from 'lucide-react';

const MessageCenterApp: React.FC = () => {
  const [student, setStudent] = useState<Student | null>(null);
  const [activeThread, setActiveThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Mock login: get first student
    getProvider().getStudents().then(list => {
        if (list.length > 0) {
            setStudent(list[0]);
        }
    });
  }, []);

  useEffect(() => {
      if (student) loadThread(student.id);
  }, [student]);

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
      }
  };

  const handleSend = async () => {
      if (!inputText.trim() || !student) return;
      
      let threadId = activeThread?.id;

      // Create thread if not exists
      if (!threadId) {
          const newThread: Thread = {
              id: '',
              threadKey: student.id,
              participantsJson: JSON.stringify(['GVCN', student.fullName]),
              lastMessageAt: new Date().toISOString()
          };
          const created = await getProvider().createThread(newThread);
          setActiveThread(created);
          threadId = created.id;
      }

      const msg: Message = {
          id: '',
          threadId: threadId!,
          fromRole: 'STUDENT', // Or PARENT, simplistic for now
          content: inputText,
          createdAt: new Date().toISOString()
      };

      await getProvider().sendMessage(msg);
      setMessages(prev => [...prev, msg]);
      setInputText('');
  };

  if (!student) return <div className="p-8 text-center">Đang tải...</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="h-16 border-b border-slate-100 flex items-center px-6 bg-slate-50 justify-between">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center">
                    <User size={20}/>
                </div>
                <div>
                    <h3 className="font-bold text-slate-800">Giáo viên chủ nhiệm</h3>
                    <p className="text-xs text-slate-500 text-green-600 font-medium">Trực tuyến</p>
                </div>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
            {messages.length === 0 ? (
                <div className="text-center text-slate-400 mt-10">
                    <p>Hãy gửi tin nhắn để bắt đầu trò chuyện với giáo viên.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {messages.map(m => {
                        const isMe = m.fromRole !== 'TEACHER';
                        return (
                            <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-slate-100 text-slate-700 rounded-bl-none'}`}>
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
                    className="flex-1 border p-3 rounded-xl focus:outline-none focus:border-blue-500 bg-slate-50"
                    placeholder="Nhập tin nhắn..."
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                />
                <button onClick={handleSend} className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition shadow-sm">
                    <Send size={20} />
                </button>
            </div>
        </div>
    </div>
  );
};

export default MessageCenterApp;