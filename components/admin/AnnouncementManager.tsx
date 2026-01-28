import React, { useEffect, useState } from 'react';
import { getProvider } from '../../core/provider';
import { Announcement, ClassInfo } from '../../core/types';
import { Plus, Edit, Trash2, Pin, PinOff, Search } from 'lucide-react';

const AnnouncementManager: React.FC = () => {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAnn, setCurrentAnn] = useState<Partial<Announcement>>({});

  useEffect(() => {
    getProvider().getClasses().then(res => {
        setClasses(res);
        if (res.length > 0) setSelectedClassId(res[0].id);
    });
  }, []);

  useEffect(() => {
    if (selectedClassId) loadData();
  }, [selectedClassId]);

  const loadData = async () => {
    const list = await getProvider().getAnnouncements(selectedClassId);
    setAnnouncements(list);
  };

  const handleSave = async () => {
    if (!currentAnn.title || !currentAnn.content || !selectedClassId) return alert('Thiếu thông tin bắt buộc.');
    
    const payload = {
        ...currentAnn,
        classId: selectedClassId,
        createdAt: currentAnn.createdAt || new Date().toISOString(),
        author: currentAnn.author || 'GVCN',
        pinned: currentAnn.pinned || false,
        target: currentAnn.target || 'all'
    } as Announcement;

    if (currentAnn.id) {
        await getProvider().updateAnnouncement(payload);
    } else {
        await getProvider().addAnnouncement(payload);
    }
    setIsModalOpen(false);
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Xóa thông báo này?')) {
        await getProvider().deleteAnnouncement(id);
        loadData();
    }
  };

  const togglePin = async (ann: Announcement) => {
      await getProvider().updateAnnouncement({...ann, pinned: !ann.pinned});
      loadData();
  };

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
          onClick={() => { setCurrentAnn({ target: 'all', pinned: false }); setIsModalOpen(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <Plus size={18} /> Tạo thông báo
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-sm uppercase">
            <tr>
              <th className="p-4 border-b w-12 text-center"><Pin size={16}/></th>
              <th className="p-4 border-b">Tiêu đề / Nội dung</th>
              <th className="p-4 border-b">Đối tượng</th>
              <th className="p-4 border-b">Ngày đăng</th>
              <th className="p-4 border-b text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {announcements.map(a => (
              <tr key={a.id} className={`hover:bg-slate-50 ${a.pinned ? 'bg-yellow-50' : ''}`}>
                <td className="p-4 text-center">
                    <button onClick={() => togglePin(a)} className={`hover:scale-110 transition ${a.pinned ? 'text-yellow-600' : 'text-slate-300'}`}>
                        {a.pinned ? <Pin size={18} fill="currentColor"/> : <Pin size={18}/>}
                    </button>
                </td>
                <td className="p-4">
                    <div className="font-bold text-slate-800">{a.title}</div>
                    <div className="text-sm text-slate-500 line-clamp-1">{a.content}</div>
                </td>
                <td className="p-4 text-slate-600">
                    <span className="px-2 py-1 bg-slate-100 rounded text-xs uppercase font-bold">
                        {a.target === 'all' ? 'Tất cả' : a.target === 'parents' ? 'Phụ huynh' : 'Học sinh'}
                    </span>
                </td>
                <td className="p-4 text-slate-600 text-sm">
                    {new Date(a.createdAt).toLocaleDateString('vi-VN')}
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => { setCurrentAnn(a); setIsModalOpen(true); }} className="text-blue-500 hover:text-blue-700 mr-3">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => handleDelete(a.id)} className="text-red-500 hover:text-red-700">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {announcements.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-slate-400">Chưa có thông báo nào.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl w-full max-w-lg">
                <h3 className="text-xl font-bold mb-4">{currentAnn.id ? 'Sửa thông báo' : 'Tạo thông báo mới'}</h3>
                <div className="space-y-4">
                    <input className="w-full border p-2 rounded font-bold" placeholder="Tiêu đề thông báo" value={currentAnn.title || ''} onChange={e => setCurrentAnn({...currentAnn, title: e.target.value})}/>
                    <textarea className="w-full border p-2 rounded h-32" placeholder="Nội dung chi tiết..." value={currentAnn.content || ''} onChange={e => setCurrentAnn({...currentAnn, content: e.target.value})}/>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Gửi tới</label>
                            <select className="w-full border p-2 rounded" value={currentAnn.target} onChange={e => setCurrentAnn({...currentAnn, target: e.target.value as any})}>
                                <option value="all">Tất cả</option>
                                <option value="parents">Chỉ Phụ huynh</option>
                                <option value="students">Chỉ Học sinh</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2 pt-6">
                            <input type="checkbox" id="pinned" checked={currentAnn.pinned} onChange={e => setCurrentAnn({...currentAnn, pinned: e.target.checked})} className="w-5 h-5 text-blue-600"/>
                            <label htmlFor="pinned" className="text-slate-700 font-medium cursor-pointer">Ghim lên đầu trang</label>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                    <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">Hủy</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Đăng thông báo</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementManager;