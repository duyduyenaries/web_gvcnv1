import React, { useEffect, useState } from 'react';
import { getProvider } from '../../core/provider';
import { Attendance, AttendanceStatus, Student } from '../../core/types';
import { Calendar, Check, X, Clock } from 'lucide-react';

const AttendanceHistory: React.FC = () => {
  const [records, setRecords] = useState<Attendance[]>([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [student, setStudent] = useState<Student | null>(null);

  // Mock: Assume current user is linked to first student found
  useEffect(() => {
    getProvider().getStudents().then(list => {
        if(list.length > 0) setStudent(list[0]);
    });
  }, []);

  useEffect(() => {
    if (student) {
        getProvider().listAttendanceByStudent(student.id, month, year).then(setRecords);
    }
  }, [student, month, year]);

  const stats = {
    present: records.filter(r => r.status === 'PRESENT').length,
    absent: records.filter(r => r.status === 'ABSENT').length,
    late: records.filter(r => r.status === 'LATE').length,
  };

  const getStatusIcon = (status: AttendanceStatus) => {
    if (status === 'PRESENT') return <Check size={16} className="text-green-600" />;
    if (status === 'ABSENT') return <X size={16} className="text-red-600" />;
    return <Clock size={16} className="text-orange-600" />;
  };

  const getStatusText = (status: AttendanceStatus) => {
    if (status === 'PRESENT') return 'Có mặt';
    if (status === 'ABSENT') return 'Vắng mặt';
    return 'Đi muộn';
  };

  if (!student) return <div className="p-8 text-center">Đang tải thông tin học sinh...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 className="text-2xl font-bold text-slate-800">Lịch sử chuyên cần</h2>
            <p className="text-slate-500">Học sinh: <span className="font-bold text-blue-600">{student.fullName}</span></p>
        </div>
        <div className="flex gap-2">
            <select 
                className="border p-2 rounded-lg bg-white"
                value={month}
                onChange={e => setMonth(parseInt(e.target.value))}
            >
                {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                    <option key={m} value={m}>Tháng {m}</option>
                ))}
            </select>
            <select 
                className="border p-2 rounded-lg bg-white"
                value={year}
                onChange={e => setYear(parseInt(e.target.value))}
            >
                <option value={2023}>2023</option>
                <option value={2024}>2024</option>
                <option value={2025}>2025</option>
            </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 p-4 rounded-xl border border-green-100 text-center">
            <div className="text-green-600 text-2xl font-bold">{stats.present}</div>
            <div className="text-green-800 text-sm">Có mặt</div>
        </div>
        <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-center">
            <div className="text-red-600 text-2xl font-bold">{stats.absent}</div>
            <div className="text-red-800 text-sm">Vắng mặt</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 text-center">
            <div className="text-orange-600 text-2xl font-bold">{stats.late}</div>
            <div className="text-orange-800 text-sm">Đi muộn</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
         <div className="p-4 bg-slate-50 border-b border-slate-100 font-medium flex items-center gap-2">
            <Calendar size={18} /> Chi tiết điểm danh
         </div>
         {records.length === 0 ? (
             <div className="p-8 text-center text-slate-400">Không có dữ liệu trong tháng này.</div>
         ) : (
             <div className="divide-y divide-slate-100">
                 {records.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(r => (
                     <div key={r.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                         <div>
                             <div className="font-bold text-slate-700">{new Date(r.date).toLocaleDateString('vi-VN', {weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric'})}</div>
                             {r.note && <div className="text-xs text-slate-500 mt-1 italic">Ghi chú: {r.note}</div>}
                         </div>
                         <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold border ${
                             r.status === 'PRESENT' ? 'bg-green-50 border-green-100 text-green-700' :
                             r.status === 'ABSENT' ? 'bg-red-50 border-red-100 text-red-700' :
                             'bg-orange-50 border-orange-100 text-orange-700'
                         }`}>
                             {getStatusIcon(r.status)}
                             {getStatusText(r.status)}
                         </div>
                     </div>
                 ))}
             </div>
         )}
      </div>
    </div>
  );
};

export default AttendanceHistory;