import React, { useEffect, useState } from 'react';
import { getProvider } from '../../core/provider';
import { Announcement } from '../../core/types';

const AppHome: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    getProvider().getAnnouncements().then(setAnnouncements);
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-blue-600 rounded-xl p-8 text-white shadow-lg">
        <h2 className="text-3xl font-bold mb-2">Chào mừng quay trở lại!</h2>
        <p className="opacity-90">Cập nhật thông tin mới nhất từ lớp học.</p>
      </div>

      <div>
        <h3 className="text-xl font-bold text-slate-800 mb-4">Thông báo mới nhất</h3>
        <div className="grid gap-4">
            {announcements.map(ann => (
                <div key={ann.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-2">
                         <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full uppercase">Thông báo</span>
                         <span className="text-sm text-slate-400">{new Date(ann.date).toLocaleDateString()}</span>
                    </div>
                    <h4 className="text-lg font-bold text-slate-800 mb-2">{ann.title}</h4>
                    <p className="text-slate-600">{ann.content}</p>
                    <div className="mt-4 pt-4 border-t border-slate-50 text-sm text-slate-500">
                        Đăng bởi: {ann.author}
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default AppHome;
