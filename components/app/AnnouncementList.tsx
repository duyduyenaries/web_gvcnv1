import React, { useEffect, useState } from 'react';
import { getProvider } from '../../core/provider';
import { Announcement } from '../../core/types';
import { Pin, Bell } from 'lucide-react';

const AnnouncementList: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    // Mock: Get for first available class or user's class
    getProvider().getClasses().then(async (classes) => {
        if (classes.length > 0) {
            const list = await getProvider().getAnnouncements(classes[0].id);
            setAnnouncements(list);
        }
    });
  }, []);

  return (
    <div className="space-y-6">
        <div>
            <h2 className="text-2xl font-bold text-slate-800">Bảng tin lớp học</h2>
            <p className="text-slate-500">Cập nhật tin tức mới nhất từ giáo viên</p>
        </div>

        <div className="grid gap-4">
            {announcements.map(ann => (
                <div key={ann.id} className={`bg-white p-6 rounded-xl shadow-sm border transition ${ann.pinned ? 'border-yellow-200 bg-yellow-50' : 'border-slate-100 hover:shadow-md'}`}>
                    <div className="flex justify-between items-start mb-3">
                         <div className="flex items-center gap-2">
                             {ann.pinned && <div className="px-2 py-1 bg-yellow-200 text-yellow-800 text-xs font-bold rounded flex items-center gap-1"><Pin size={12} fill="currentColor"/> GHIM</div>}
                             <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase ${ann.pinned ? 'bg-white text-slate-600' : 'bg-blue-100 text-blue-700'}`}>
                                 {ann.target === 'all' ? 'Chung' : ann.target === 'parents' ? 'Phụ huynh' : 'Học sinh'}
                             </span>
                         </div>
                         <span className="text-sm text-slate-400">{new Date(ann.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h4 className="text-lg font-bold text-slate-800 mb-2">{ann.title}</h4>
                    <p className="text-slate-700 whitespace-pre-wrap">{ann.content}</p>
                    <div className="mt-4 pt-4 border-t border-black/5 text-sm text-slate-500 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold">GV</div>
                        Đăng bởi: {ann.author}
                    </div>
                </div>
            ))}
            {announcements.length === 0 && (
                <div className="p-12 text-center flex flex-col items-center text-slate-400">
                    <Bell size={48} className="mb-4 opacity-20"/>
                    <p>Hiện chưa có thông báo nào.</p>
                </div>
            )}
        </div>
    </div>
  );
};

export default AnnouncementList;