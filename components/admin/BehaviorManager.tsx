import React, { useEffect, useState } from 'react';
import { getProvider } from '../../core/provider';
import { Student, ClassInfo, Behavior } from '../../core/types';
import { Plus, Edit, Trash2, Star, AlertTriangle, ThumbsUp, ThumbsDown } from 'lucide-react';

const BehaviorManager: React.FC = () => {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  
  const [behaviors, setBehaviors] = useState<Behavior[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBehavior, setCurrentBehavior] = useState<Partial<Behavior>>({});

  // 1. Load Classes
  useEffect(() => {
    getProvider().getClasses().then(res => {
        setClasses(res);
        if (res.length > 0) setSelectedClassId(res[0].id);
    });
  }, []);

  // 2. Load Students when Class changes
  useEffect(() => {
    if (selectedClassId) {
        getProvider().getStudents(selectedClassId).then(list => {
            setStudents(list);
            // Optional: Auto select first student or keep blank for "All" (if supported)
            // For adding, we need a student. For viewing, "All" is nice.
            // Let's reset student selection to force choice or allow filter by class later
            setSelectedStudentId(''); 
        });
    }
  }, [selectedClassId]);

  // 3. Load Behaviors when Student (or Class - feature extension) changes
  useEffect(() => {
      loadBehaviors();
  }, [selectedStudentId]);

  const loadBehaviors = async () => {
      // If student selected, filter by student. If not, we could show all for class (need provider support or filter client side)
      // For simplicity matching the requirement "select Student", we show list when student selected
      if (selectedStudentId) {
          const res = await getProvider().getBehaviors(selectedStudentId);
          setBehaviors(res);
      } else {
          setBehaviors([]);
      }
  };

  const handleSave = async () => {
    if (!currentBehavior.content || !currentBehavior.points || !selectedStudentId) {
        return alert('Vui lòng nhập nội dung, điểm và chọn học sinh.');
    }
    
    const payload = {
        ...currentBehavior,
        studentId: selectedStudentId,
        date: currentBehavior.date || new Date().toISOString().split('T')[0],
        type: currentBehavior.type || 'PRAISE'
    } as Behavior;

    if (currentBehavior.id) {
        await getProvider().updateBehavior(payload);
    } else {
        await getProvider().addBehavior(payload);
    }
    setIsModalOpen(false);
    loadBehaviors();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Xóa ghi nhận này?')) {
        await getProvider().deleteBehavior(id);
        loadBehaviors();
    }
  };

  const openAddModal = () => {
      if(!selectedStudentId) return alert('Vui lòng chọn học sinh trước khi thêm.');
      setCurrentBehavior({ type: 'PRAISE', points: 1, date: new Date().toISOString().split('T')[0] });
      setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Lớp</label>
                <select 
                    className="border p-2 rounded-lg bg-slate-50 min-w-[150px]"
                    value={selectedClassId}
                    onChange={e => setSelectedClassId(e.target.value)}
                >
                    {classes.map(c => <option key={c.id} value={c.id}>{c.className}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Học sinh</label>
                <select 
                    className="border p-2 rounded-lg bg-slate-50 min-w-[200px]"
                    value={selectedStudentId}
                    onChange={e => setSelectedStudentId(e.target.value)}
                >
                    <option value="">-- Chọn học sinh --</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.fullName} - {s.code}</option>)}
                </select>
            </div>
        </div>
        <button 
            onClick={openAddModal}
            disabled={!selectedStudentId}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition disabled:opacity-50"
        >
            <Plus size={18} /> Ghi nhận
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {!selectedStudentId ? (
            <div className="p-12 text-center text-slate-400">Vui lòng chọn học sinh để xem lịch sử nề nếp.</div>
        ) : behaviors.length === 0 ? (
            <div className="p-12 text-center text-slate-400">Chưa có ghi nhận nào cho học sinh này.</div>
        ) : (
            <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-sm uppercase">
                    <tr>
                        <th className="p-4 border-b">Ngày</th>
                        <th className="p-4 border-b">Loại</th>
                        <th className="p-4 border-b">Nội dung</th>
                        <th className="p-4 border-b text-center">Điểm</th>
                        <th className="p-4 border-b text-right">Thao tác</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {behaviors.map(b => (
                        <tr key={b.id} className="hover:bg-slate-50">
                            <td className="p-4 text-slate-600 w-32">{new Date(b.date).toLocaleDateString()}</td>
                            <td className="p-4 w-32">
                                <span className={`flex items-center gap-1 text-sm font-bold px-2 py-1 rounded-full w-fit ${
                                    b.type === 'PRAISE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                    {b.type === 'PRAISE' ? <ThumbsUp size={14}/> : <ThumbsDown size={14}/>}
                                    {b.type === 'PRAISE' ? 'Khen' : 'Nhắc'}
                                </span>
                            </td>
                            <td className="p-4 font-medium text-slate-800">{b.content}</td>
                            <td className={`p-4 text-center font-bold ${b.type === 'PRAISE' ? 'text-green-600' : 'text-red-600'}`}>
                                {b.type === 'PRAISE' ? '+' : '-'}{b.points}
                            </td>
                            <td className="p-4 text-right">
                                <button onClick={() => { setCurrentBehavior(b); setIsModalOpen(true); }} className="text-blue-500 hover:text-blue-700 mr-3">
                                    <Edit size={18} />
                                </button>
                                <button onClick={() => handleDelete(b.id)} className="text-red-500 hover:text-red-700">
                                    <Trash2 size={18} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl w-full max-w-md">
                <h3 className="text-xl font-bold mb-4">{currentBehavior.id ? 'Sửa ghi nhận' : 'Thêm ghi nhận mới'}</h3>
                
                <div className="flex gap-2 mb-4">
                    <button 
                        className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 font-bold transition ${currentBehavior.type === 'PRAISE' ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-500'}`}
                        onClick={() => setCurrentBehavior({...currentBehavior, type: 'PRAISE'})}
                    >
                        <ThumbsUp size={18} /> Khen ngợi
                    </button>
                    <button 
                        className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 font-bold transition ${currentBehavior.type === 'WARN' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-500'}`}
                        onClick={() => setCurrentBehavior({...currentBehavior, type: 'WARN'})}
                    >
                        <ThumbsDown size={18} /> Nhắc nhở
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-xs text-slate-500 block mb-1">Ngày ghi nhận</label>
                        <input type="date" className="w-full border p-2 rounded" value={currentBehavior.date || ''} onChange={e => setCurrentBehavior({...currentBehavior, date: e.target.value})}/>
                    </div>
                    <div>
                        <label className="text-xs text-slate-500 block mb-1">Nội dung / Lý do</label>
                        <textarea className="w-full border p-2 rounded h-24" placeholder="Nhập nội dung..." value={currentBehavior.content || ''} onChange={e => setCurrentBehavior({...currentBehavior, content: e.target.value})}/>
                    </div>
                    <div>
                        <label className="text-xs text-slate-500 block mb-1">Số điểm {currentBehavior.type === 'PRAISE' ? 'cộng' : 'trừ'}</label>
                        <input type="number" min="1" className="w-full border p-2 rounded" value={currentBehavior.points || ''} onChange={e => setCurrentBehavior({...currentBehavior, points: parseInt(e.target.value) || 0})}/>
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

export default BehaviorManager;