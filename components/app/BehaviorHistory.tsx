import React, { useEffect, useState } from 'react';
import { getProvider } from '../../core/provider';
import { Behavior, Student } from '../../core/types';
import { Star, Flag, Clock } from 'lucide-react';

const BehaviorHistory: React.FC = () => {
  const [behaviors, setBehaviors] = useState<Behavior[]>([]);
  const [student, setStudent] = useState<Student | null>(null);

  useEffect(() => {
    // Mock user login - get first student
    getProvider().getStudents().then(list => {
        if(list.length > 0) {
            setStudent(list[0]);
            getProvider().getBehaviors(list[0].id).then(setBehaviors);
        }
    });
  }, []);

  const stats = {
      praise: behaviors.filter(b => b.type === 'PRAISE').reduce((sum, b) => sum + b.points, 0),
      warnCount: behaviors.filter(b => b.type === 'WARN').length
  };

  if (!student) return <div className="p-8 text-center">Đang tải...</div>;

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 className="text-2xl font-bold text-slate-800">Góc học tập & Rèn luyện</h2>
            <p className="text-slate-500">Học sinh: <span className="font-bold text-blue-600">{student.fullName}</span></p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-xl border border-yellow-100">
              <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-yellow-200 text-yellow-700 rounded-lg"><Star size={20}/></div>
                  <span className="text-yellow-800 font-medium">Điểm thi đua</span>
              </div>
              <div className="text-3xl font-bold text-yellow-700">+{stats.praise}</div>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-pink-50 p-6 rounded-xl border border-red-100">
              <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-red-200 text-red-700 rounded-lg"><Flag size={20}/></div>
                  <span className="text-red-800 font-medium">Số lần nhắc nhở</span>
              </div>
              <div className="text-3xl font-bold text-red-700">{stats.warnCount}</div>
          </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-100 font-bold text-slate-700 flex items-center gap-2">
              <Clock size={18} /> Nhật ký hoạt động
          </div>
          <div className="divide-y divide-slate-100">
              {behaviors.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">Chưa có ghi nhận nào.</div>
              ) : behaviors.map(b => (
                  <div key={b.id} className="p-4 flex gap-4">
                      <div className="flex-shrink-0 mt-1">
                          {b.type === 'PRAISE' ? (
                              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                  <Star size={20} fill="currentColor" />
                              </div>
                          ) : (
                              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                  <Flag size={20} fill="currentColor" />
                              </div>
                          )}
                      </div>
                      <div className="flex-1">
                          <div className="flex justify-between items-start">
                              <h4 className="font-bold text-slate-800">{b.content}</h4>
                              <span className={`font-bold text-sm ${b.type === 'PRAISE' ? 'text-green-600' : 'text-red-600'}`}>
                                  {b.type === 'PRAISE' ? '+' : '-'}{b.points} điểm
                              </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1">{new Date(b.date).toLocaleDateString('vi-VN', {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'})}</p>
                      </div>
                  </div>
              ))}
          </div>
      </div>
    </div>
  );
};

export default BehaviorHistory;