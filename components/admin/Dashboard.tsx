import React, { useEffect, useState } from 'react';
import { getProvider } from '../../core/provider';
import { DashboardStats } from '../../core/types';
import { Users, Calendar, AlertCircle, CheckSquare, Star, Flag } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    getProvider().getDashboardStats().then(setStats);
  }, []);

  if (!stats) return <div className="p-8 text-center text-slate-500">Đang tải dữ liệu...</div>;

  const cards = [
    { title: 'Tổng số học sinh', value: stats.totalStudents, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Chuyên cần tuần này', value: `${stats.weeklyAttendanceRate}%`, icon: Calendar, color: 'text-green-600', bg: 'bg-green-50' },
    { title: 'Thông báo mới', value: stats.newAnnouncements, icon: AlertCircle, color: 'text-purple-600', bg: 'bg-purple-50' },
    { title: 'Việc cần xử lý', value: stats.pendingTasks, icon: CheckSquare, color: 'text-orange-600', bg: 'bg-orange-50' },
    { title: 'Tổng điểm thi đua', value: stats.totalPraisePoints, icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { title: 'Số lần nhắc nhở', value: stats.totalWarnings, icon: Flag, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Tổng quan lớp học</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, idx) => {
           const Icon = card.icon;
           return (
            <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
                <div className={`p-3 rounded-lg ${card.bg} ${card.color}`}>
                    <Icon size={24} />
                </div>
                <div>
                    <p className="text-sm text-slate-500">{card.title}</p>
                    <h3 className="text-2xl font-bold text-slate-800">{card.value}</h3>
                </div>
            </div>
           );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
             <h3 className="font-bold text-lg mb-4 text-slate-700">Lối tắt thao tác</h3>
             <div className="grid grid-cols-2 gap-4">
                 <button className="p-4 bg-slate-50 rounded-lg text-slate-600 hover:bg-slate-100 text-sm font-medium">Điểm danh nhanh</button>
                 <button className="p-4 bg-slate-50 rounded-lg text-slate-600 hover:bg-slate-100 text-sm font-medium">Thêm học sinh</button>
                 <button className="p-4 bg-slate-50 rounded-lg text-slate-600 hover:bg-slate-100 text-sm font-medium">Gửi thông báo</button>
                 <button className="p-4 bg-slate-50 rounded-lg text-slate-600 hover:bg-slate-100 text-sm font-medium">Báo cáo tuần</button>
             </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-center items-center text-slate-400">
             <Calendar size={48} className="mb-2 opacity-50"/>
             <p>Chưa có sự kiện sắp tới</p>
          </div>
      </div>
    </div>
  );
};

export default Dashboard;