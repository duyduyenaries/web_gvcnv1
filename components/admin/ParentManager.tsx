import React, { useEffect, useState } from 'react';
import { getProvider } from '../../core/provider';
import { Parent, Student } from '../../core/types';
import { Plus, Edit, Trash2, Link as LinkIcon } from 'lucide-react';

const ParentManager: React.FC = () => {
  const [parents, setParents] = useState<Parent[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentParent, setCurrentParent] = useState<Partial<Parent>>({});

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const pList = await getProvider().getParents();
    const sList = await getProvider().getStudents();
    setParents(pList);
    setStudents(sList);
  };

  const handleSave = async () => {
    if (!currentParent.fullName || !currentParent.studentId) return alert('Nhập tên và chọn học sinh con.');
    
    if (currentParent.id) {
        await getProvider().updateParent(currentParent as Parent);
    } else {
        await getProvider().addParent(currentParent as Parent);
    }
    setIsModalOpen(false);
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Xóa phụ huynh này?')) {
        await getProvider().removeParent(id);
        loadData();
    }
  };

  const getStudentName = (id: string) => students.find(s => s.id === id)?.fullName || 'Không xác định';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Quản lý Phụ huynh</h2>
        <button 
          onClick={() => { setCurrentParent({}); setIsModalOpen(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <Plus size={18} /> Thêm phụ huynh
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-sm uppercase">
            <tr>
              <th className="p-4 border-b">Họ tên</th>
              <th className="p-4 border-b">Điện thoại / Email</th>
              <th className="p-4 border-b">Quan hệ</th>
              <th className="p-4 border-b">Học sinh (Con)</th>
              <th className="p-4 border-b text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {parents.map(p => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="p-4 font-bold text-slate-700">{p.fullName}</td>
                <td className="p-4 text-slate-600">
                    <div className="text-sm">{p.phone}</div>
                    <div className="text-xs text-slate-400">{p.email}</div>
                </td>
                <td className="p-4 text-slate-600">{p.relationship}</td>
                <td className="p-4 text-blue-600 font-medium">
                    <div className="flex items-center gap-1">
                        <LinkIcon size={14}/> {getStudentName(p.studentId)}
                    </div>
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => { setCurrentParent(p); setIsModalOpen(true); }} className="text-blue-500 hover:text-blue-700 mr-3">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-700">
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
                <h3 className="text-xl font-bold mb-4">{currentParent.id ? 'Sửa thông tin' : 'Thêm phụ huynh'}</h3>
                <div className="space-y-4">
                    <input className="w-full border p-2 rounded" placeholder="Họ và tên" value={currentParent.fullName || ''} onChange={e => setCurrentParent({...currentParent, fullName: e.target.value})}/>
                    <input className="w-full border p-2 rounded" placeholder="Số điện thoại" value={currentParent.phone || ''} onChange={e => setCurrentParent({...currentParent, phone: e.target.value})}/>
                    <input className="w-full border p-2 rounded" placeholder="Email" value={currentParent.email || ''} onChange={e => setCurrentParent({...currentParent, email: e.target.value})}/>
                    <div className="grid grid-cols-2 gap-4">
                         <select className="border p-2 rounded" value={currentParent.relationship || 'Bố'} onChange={e => setCurrentParent({...currentParent, relationship: e.target.value as any})}>
                            <option value="Bố">Bố</option>
                            <option value="Mẹ">Mẹ</option>
                            <option value="Ông">Ông</option>
                            <option value="Bà">Bà</option>
                            <option value="Khác">Khác</option>
                        </select>
                        <select className="border p-2 rounded" value={currentParent.studentId || ''} onChange={e => setCurrentParent({...currentParent, studentId: e.target.value})}>
                            <option value="">-- Chọn HS --</option>
                            {students.map(s => <option key={s.id} value={s.id}>{s.fullName}</option>)}
                        </select>
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

export default ParentManager;
