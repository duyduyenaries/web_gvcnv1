import React, { useEffect, useState } from 'react';
import { getProvider } from '../../core/provider';
import { ClassInfo, Report, Student } from '../../core/types';
import { Download, Calendar, Users, Star, AlertTriangle, CheckSquare, MessageSquare } from 'lucide-react';

const Reports: React.FC = () => {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [mode, setMode] = useState<'weekly' | 'monthly'>('weekly');
  
  // Date State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [report, setReport] = useState<Report | null>(null);

  useEffect(() => {
    getProvider().getClasses().then(res => {
        setClasses(res);
        if (res.length > 0) setSelectedClassId(res[0].id);
    });
  }, []);

  useEffect(() => {
    if (selectedClassId) loadReport();
  }, [selectedClassId, mode, date]);

  const getRange = () => {
      const d = new Date(date);
      if (mode === 'weekly') {
          // Find Monday of the week
          const day = d.getDay();
          const diff = d.getDate() - day + (day === 0 ? -6 : 1);
          const start = new Date(d.setDate(diff));
          const end = new Date(d.setDate(diff + 6));
          return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
      } else {
          // First and Last day of month
          const start = new Date(d.getFullYear(), d.getMonth(), 1);
          const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
          return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
      }
  };

  const loadReport = async () => {
      const { start, end } = getRange();
      const data = await getProvider().getReport(selectedClassId, mode, start, end);
      setReport(data);
  };

  const downloadCSV = async (type: 'attendance' | 'behavior') => {
      const { start, end } = getRange();
      const students = await getProvider().getStudents(selectedClassId);
      
      let csvContent = "data:text/csv;charset=utf-8,";
      
      if (type === 'attendance') {
          const data = await getProvider().getAttendanceByRange(selectedClassId, start, end);
          csvContent += "Date,Code,Name,Status,Note\n";
          data.forEach(row => {
              const s = students.find(stu => stu.id === row.studentId);
              csvContent += `${row.date},${s?.code},${s?.fullName},${row.status},${row.note || ''}\n`;
          });
      } else {
          const data = await getProvider().getBehaviorsByClassRange(selectedClassId, start, end);
          csvContent += "Date,Code,Name,Type,Content,Points\n";
          data.forEach(row => {
              const s = students.find(stu => stu.id === row.studentId);
              csvContent += `${row.date},${s?.code},${s?.fullName},${row.type},${row.content},${row.points}\n`;
          });
      }

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${type}_report_${start}_${end}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto items-end">
            <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Lớp học</label>
                <select 
                    className="border p-2 rounded-lg bg-slate-50 min-w-[150px]"
                    value={selectedClassId}
                    onChange={e => setSelectedClassId(e.target.value)}
                >
                    {classes.map(c => <option key={c.id} value={c.id}>{c.className}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Loại báo cáo</label>
                <div className="flex bg-slate-100 rounded-lg p-1">
                    <button 
                        onClick={() => setMode('weekly')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${mode === 'weekly' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Theo Tuần
                    </button>
                    <button 
                        onClick={() => setMode('monthly')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${mode === 'monthly' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Theo Tháng
                    </button>
                </div>
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Thời gian</label>
                <input 
                    type={mode === 'weekly' ? 'date' : 'month'} // Simple switch for input type
                    className="border p-2 rounded-lg"
                    value={mode === 'weekly' ? date : date.substring(0, 7)}
                    onChange={e => setMode(mode === 'weekly' ? 'weekly' : 'monthly') || setDate(mode === 'weekly' ? e.target.value : e.target.value + '-01')}
                />
            </div>
        </div>
        <div className="flex gap-2">
            <button onClick={() => downloadCSV('attendance')} className="border border-slate-200 text-slate-600 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-50 text-sm font-medium">
                <Download size={16} /> CSV Chuyên cần
            </button>
            <button onClick={() => downloadCSV('behavior')} className="border border-slate-200 text-slate-600 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-50 text-sm font-medium">
                <Download size={16} /> CSV Nề nếp
            </button>
        </div>
      </div>

      {report && (
          <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
                      <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Calendar size={24}/></div>
                      <div>
                          <p className="text-sm text-slate-500">Tỉ lệ chuyên cần</p>
                          <h3 className="text-2xl font-bold text-slate-800">{report.summary.attendanceRate}%</h3>
                      </div>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
                      <div className="p-3 bg-red-50 text-red-600 rounded-lg"><Users size={24}/></div>
                      <div>
                          <p className="text-sm text-slate-500">Vắng / Trễ</p>
                          <h3 className="text-2xl font-bold text-slate-800">{report.summary.absentCount} <span className="text-sm text-slate-400 font-normal">/ {report.summary.lateCount}</span></h3>
                      </div>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
                      <div className="p-3 bg-orange-50 text-orange-600 rounded-lg"><CheckSquare size={24}/></div>
                      <div>
                          <p className="text-sm text-slate-500">Task đến hạn</p>
                          <h3 className="text-2xl font-bold text-slate-800">{report.summary.tasksDueCount}</h3>
                      </div>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
                      <div className="p-3 bg-purple-50 text-purple-600 rounded-lg"><MessageSquare size={24}/></div>
                      <div>
                          <p className="text-sm text-slate-500">Phụ huynh phản hồi</p>
                          <h3 className="text-2xl font-bold text-slate-800">{report.summary.repliesCount}</h3>
                      </div>
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                      <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                          <Star className="text-yellow-500" size={20} fill="currentColor"/> Top Khen ngợi
                      </h3>
                      {report.summary.topPraised.length === 0 ? <p className="text-slate-400 text-sm">Chưa có dữ liệu.</p> : (
                          <div className="space-y-3">
                              {report.summary.topPraised.map((s, i) => (
                                  <div key={i} className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                                      <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 rounded-full bg-yellow-200 text-yellow-700 flex items-center justify-center font-bold text-sm">#{i+1}</div>
                                          <span className="font-medium text-slate-700">{s.studentName}</span>
                                      </div>
                                      <div className="text-yellow-700 font-bold">+{s.points} đ</div>
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>
                  <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                      <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                          <AlertTriangle className="text-red-500" size={20}/> Cần nhắc nhở
                      </h3>
                      {report.summary.topWarned.length === 0 ? <p className="text-slate-400 text-sm">Lớp học rất ngoan! Không có nhắc nhở.</p> : (
                          <div className="space-y-3">
                              {report.summary.topWarned.map((s, i) => (
                                  <div key={i} className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-100">
                                      <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 rounded-full bg-red-200 text-red-700 flex items-center justify-center font-bold text-sm">#{i+1}</div>
                                          <span className="font-medium text-slate-700">{s.studentName}</span>
                                      </div>
                                      <div className="text-red-700 font-bold">{s.count} lần</div>
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Reports;