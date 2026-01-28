import React, { useEffect, useState } from 'react';
import { getProvider } from '../../core/provider';
import { ClassInfo } from '../../core/types';
import { Plus, Edit, Trash2 } from 'lucide-react';

const ClassManager: React.FC = () => {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentClass, setCurrentClass] = useState<Partial<ClassInfo>>({});

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const list = await getProvider().getClasses();
    setClasses(list);
  };

  const handleSave = async () => {
    if (!currentClass.className || !currentClass.schoolYear) return alert('Vui lòng nhập tên lớp và năm học');
    
    if (currentClass.id) {
        await getProvider().updateClass(currentClass as ClassInfo);
    } else {
        await getProvider().addClass(currentClass as ClassInfo);
    }
    setIsModalOpen(false);
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Xóa lớp này sẽ ảnh hưởng đến danh sách HS. Tiếp tục?')) {
        await getProvider().removeClass(id);
        loadData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Quản lý Lớp học</h2>
        <button 
          onClick={() => { setCurrentClass({}); setIsModalOpen(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <Plus size={18} /> Thêm lớp mới
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-sm uppercase">
            <tr>
              <th className="p-4 border-b">Tên lớp</th>
              <th className="p-4 border-b">Năm học</th>
              <th className="p-4 border-b">GVCN</th>
              <th className="p-4 border-b">Ghi chú</th>
              <th className="p-4 border-b text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {classes.map(c => (
              <tr key={c.id} className="hover:bg-slate-50">
                <td className="p-4 font-bold text-slate-700">{c.className}</td>
                <td className="p-4 text-slate-600">{c.schoolYear}</td>
                <td className="p-4 text-slate-600">{c.homeroomTeacher}</td>
                <td className="p-4 text-slate-500 italic">{c.note}</td>
                <td className="p-4 text-right">
                  <button onClick={() => { setCurrentClass(c); setIsModalOpen(true); }} className="text-blue-500 hover:text-blue-700 mr-3">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="text-red-500 hover:text-red-700">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl w-full max-w-md">
                <h3 className="text-xl font-bold mb-4">{currentClass.id ? 'Sửa lớp' : 'Thêm lớp mới'}</h3>
                <div className="space-y-4">
                    <input className="w-full border p-2 rounded" placeholder="Tên lớp (VD: 5A1)" value={currentClass.className || ''} onChange={e => setCurrentClass({...currentClass, className: e.target.value})}/>
                    <input className="w-full border p-2 rounded" placeholder="Năm học (VD: 2023-2024)" value={currentClass.schoolYear || ''} onChange={e => setCurrentClass({...currentClass, schoolYear: e.target.value})}/>
                    <input className="w-full border p-2 rounded" placeholder="Giáo viên chủ nhiệm" value={currentClass.homeroomTeacher || ''} onChange={e => setCurrentClass({...currentClass, homeroomTeacher: e.target.value})}/>
                    <textarea className="w-full border p-2 rounded" placeholder="Ghi chú" value={currentClass.note || ''} onChange={e => setCurrentClass({...currentClass, note: e.target.value})}/>
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

export default ClassManager;
