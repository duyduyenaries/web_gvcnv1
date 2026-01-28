import React, { useEffect, useState } from 'react';
import { getProvider } from '../../core/provider';
import { Question } from '../../core/types';
import { Plus, Edit, Trash2, CheckCircle } from 'lucide-react';

const QuestionBank: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [currentQuestion, setCurrentQuestion] = useState<Partial<Question>>({
      options: ['', '', '', ''],
      correctIndex: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const list = await getProvider().getQuestions();
    setQuestions(list);
  };

  const handleOptionChange = (index: number, value: string) => {
      const newOptions = [...(currentQuestion.options || [])];
      newOptions[index] = value;
      setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  const handleSave = async () => {
    if (!currentQuestion.content || currentQuestion.options?.some(o => !o.trim())) {
        return alert('Vui lòng nhập nội dung câu hỏi và đầy đủ 4 đáp án.');
    }
    
    if (currentQuestion.id) {
        await getProvider().updateQuestion(currentQuestion as Question);
    } else {
        await getProvider().addQuestion(currentQuestion as Question);
    }
    setIsModalOpen(false);
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Xóa câu hỏi này?')) {
        await getProvider().deleteQuestion(id);
        loadData();
    }
  };

  const openAddModal = () => {
      setCurrentQuestion({ content: '', options: ['', '', '', ''], correctIndex: 0 });
      setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-2xl font-bold text-slate-800">Ngân hàng câu hỏi</h2>
            <p className="text-slate-500">Quản lý câu hỏi cho trò chơi "Game tốc độ"</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <Plus size={18} /> Thêm câu hỏi
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-sm uppercase">
            <tr>
              <th className="p-4 border-b w-12">#</th>
              <th className="p-4 border-b">Nội dung câu hỏi</th>
              <th className="p-4 border-b">Đáp án đúng</th>
              <th className="p-4 border-b text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {questions.map((q, idx) => (
              <tr key={q.id} className="hover:bg-slate-50">
                <td className="p-4 text-slate-400 font-mono text-sm">{idx + 1}</td>
                <td className="p-4">
                    <div className="font-bold text-slate-800 mb-1">{q.content}</div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-slate-500">
                        {q.options.map((opt, i) => (
                            <span key={i} className={i === q.correctIndex ? 'text-green-600 font-bold' : ''}>
                                {String.fromCharCode(65+i)}. {opt}
                            </span>
                        ))}
                    </div>
                </td>
                <td className="p-4 text-green-600 font-bold">
                    {String.fromCharCode(65+q.correctIndex)}. {q.options[q.correctIndex]}
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => { setCurrentQuestion(q); setIsModalOpen(true); }} className="text-blue-500 hover:text-blue-700 mr-3">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => handleDelete(q.id)} className="text-red-500 hover:text-red-700">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {questions.length === 0 && (
                <tr><td colSpan={4} className="p-8 text-center text-slate-400">Chưa có câu hỏi nào.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-bold mb-4">{currentQuestion.id ? 'Sửa câu hỏi' : 'Thêm câu hỏi mới'}</h3>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Nội dung câu hỏi</label>
                        <textarea 
                            className="w-full border p-3 rounded-lg focus:outline-none focus:border-blue-500" 
                            rows={3}
                            placeholder="Nhập câu hỏi..." 
                            value={currentQuestion.content || ''} 
                            onChange={e => setCurrentQuestion({...currentQuestion, content: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Các phương án (Chọn đáp án đúng)</label>
                        <div className="space-y-3">
                            {currentQuestion.options?.map((opt, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <input 
                                        type="radio" 
                                        name="correctAnswer" 
                                        checked={currentQuestion.correctIndex === idx}
                                        onChange={() => setCurrentQuestion({...currentQuestion, correctIndex: idx})}
                                        className="w-5 h-5 text-blue-600 cursor-pointer"
                                    />
                                    <span className="font-bold text-slate-400 w-6">{String.fromCharCode(65+idx)}.</span>
                                    <input 
                                        className={`flex-1 border p-2 rounded-lg text-sm ${currentQuestion.correctIndex === idx ? 'border-green-500 ring-1 ring-green-500 bg-green-50' : ''}`}
                                        placeholder={`Đáp án ${idx + 1}`}
                                        value={opt}
                                        onChange={e => handleOptionChange(idx, e.target.value)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100">
                    <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Hủy</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold flex items-center gap-2">
                        <CheckCircle size={18}/> Lưu câu hỏi
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default QuestionBank;