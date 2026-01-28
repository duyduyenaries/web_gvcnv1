import React, { useEffect, useState, useRef } from 'react';
import { getProvider } from '../../core/provider';
import { Student, ClassInfo } from '../../core/types';
import { Plus, Trash2, Edit, Search, Upload, FileSpreadsheet, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

const StudentList: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [filterClass, setFilterClass] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Partial<Student>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const provider = getProvider();
    const [stuList, clsList] = await Promise.all([
        provider.getStudents(),
        provider.getClasses()
    ]);
    setStudents(stuList);
    setClasses(clsList);
    // Auto select first class if none selected to make importing easier context
    if (clsList.length > 0 && !filterClass) setFilterClass(clsList[0].id); 
  };

  const handleSave = async () => {
    if (!editingStudent.fullName || !editingStudent.code || !editingStudent.classId) {
        return alert('Vui lòng nhập Mã, Tên và chọn Lớp.');
    }
    
    const payload = { ...editingStudent, status: editingStudent.status || 'Đang học' } as Student;

    if (editingStudent.id) {
        await getProvider().updateStudent(payload);
    } else {
        await getProvider().addStudent(payload);
    }
    setIsModalOpen(false);
    setEditingStudent({});
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn chắc chắn muốn xóa học sinh này?')) {
        await getProvider().removeStudent(id);
        loadData();
    }
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      if (!filterClass) {
          alert("Vui lòng chọn Lớp học ở bộ lọc trước để nhập danh sách vào lớp đó.");
          e.target.value = ''; // Reset input
          return;
      }

      const reader = new FileReader();
      reader.onload = async (evt) => {
          try {
              const bstr = evt.target?.result;
              const wb = XLSX.read(bstr, { type: 'binary' });
              const wsname = wb.SheetNames[0];
              const ws = wb.Sheets[wsname];
              const data = XLSX.utils.sheet_to_json(ws);

              if (data.length === 0) {
                  alert("File Excel không có dữ liệu.");
                  return;
              }

              let count = 0;
              for (const row of data as any[]) {
                  // Mapping columns: Assume headers like "Ma HS", "Ho Ten", "Gioi Tinh", "Ngay Sinh", "Dia Chi"
                  // Or generic A, B, C, D if no header. Let's try to detect keys loosely.
                  const code = row['Mã HS'] || row['Code'] || row['Ma HS'];
                  const fullName = row['Họ và tên'] || row['Full Name'] || row['Ho Ten'];
                  
                  if (code && fullName) {
                      const newStudent: Student = {
                          id: '', // Provider generates ID
                          classId: filterClass,
                          code: String(code),
                          fullName: String(fullName),
                          gender: (row['Giới tính'] || row['Gender'] || '').toString().toLowerCase().includes('nữ') ? 'Nữ' : 'Nam',
                          dob: row['Ngày sinh'] || row['DOB'] || '2015-01-01',
                          address: row['Địa chỉ'] || row['Address'] || '',
                          status: 'Đang học'
                      };
                      await getProvider().addStudent(newStudent);
                      count++;
                  }
              }
              alert(`Đã nhập thành công ${count} học sinh vào lớp.`);
              loadData();
          } catch (error) {
              console.error(error);
              alert("Lỗi khi đọc file. Vui lòng kiểm tra định dạng.");
          } finally {
              if (fileInputRef.current) fileInputRef.current.value = '';
          }
      };
      reader.readAsBinaryString(file);
  };

  const downloadTemplate = () => {
      const ws = XLSX.utils.json_to_sheet([
          { "Mã HS": "HS001", "Họ và tên": "Nguyễn Văn A", "Giới tính": "Nam", "Ngày sinh": "2015-05-20", "Địa chỉ": "Hà Nội" },
          { "Mã HS": "HS002", "Họ và tên": "Trần Thị B", "Giới tính": "Nữ", "Ngày sinh": "2015-08-15", "Địa chỉ": "Hà Nội" }
      ]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "DanhSachHocSinh");
      XLSX.writeFile(wb, "Mau_Nhap_Hoc_Sinh.xlsx");
  };

  const filteredStudents = students.filter(s => {
    const matchClass = filterClass ? s.classId === filterClass : true;
    const matchSearch = s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        s.code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchClass && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 className="text-2xl font-bold text-slate-800">Danh sách học sinh</h2>
            <p className="text-slate-500 text-sm">Quản lý hồ sơ học sinh theo lớp</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={downloadTemplate}
                className="bg-white border border-slate-200 text-slate-600 px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-50 transition text-sm font-medium"
                title="Tải file mẫu"
            >
                <Download size={18} /> File mẫu
            </button>
            <div className="relative">
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept=".xlsx, .xls" 
                    onChange={handleImportExcel}
                />
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition"
                >
                    <FileSpreadsheet size={18} /> Nhập Excel
                </button>
            </div>
            <button 
            onClick={() => { setEditingStudent({ gender: 'Nam', status: 'Đang học', classId: filterClass || classes[0]?.id }); setIsModalOpen(true); }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
            >
            <Plus size={18} /> Thêm mới
            </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <select 
            className="border p-2 rounded-lg bg-slate-50 min-w-[200px]"
            value={filterClass}
            onChange={e => setFilterClass(e.target.value)}
        >
            <option value="">-- Chọn lớp để lọc/nhập --</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.className} - {c.schoolYear}</option>)}
        </select>
        <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input 
                className="w-full pl-10 pr-4 py-2 border rounded-lg" 
                placeholder="Tìm kiếm theo tên, mã học sinh..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 text-slate-500 text-sm uppercase">
            <tr>
              <th className="p-4 border-b">Mã HS</th>
              <th className="p-4 border-b">Họ tên</th>
              <th className="p-4 border-b">Lớp</th>
              <th className="p-4 border-b">Ngày sinh</th>
              <th className="p-4 border-b">Trạng thái</th>
              <th className="p-4 border-b text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredStudents.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-slate-500">Không tìm thấy học sinh nào.</td></tr>
            ) : filteredStudents.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50">
                <td className="p-4 text-slate-600 font-mono text-sm">{s.code}</td>
                <td className="p-4 font-medium text-slate-800">
                    {s.fullName}
                    <div className="text-xs text-slate-400">{s.gender}</div>
                </td>
                <td className="p-4 text-slate-600">
                    {classes.find(c => c.id === s.classId)?.className || 'N/A'}
                </td>
                <td className="p-4 text-slate-600">{s.dob}</td>
                <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                        s.status === 'Đang học' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                        {s.status}
                    </span>
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => { setEditingStudent(s); setIsModalOpen(true); }} className="text-blue-500 hover:text-blue-700 mr-3">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:text-red-700">
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
            <div className="bg-white p-6 rounded-xl w-full max-w-lg">
                <h3 className="text-xl font-bold mb-4">{editingStudent.id ? 'Sửa thông tin' : 'Thêm học sinh mới'}</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-1">
                        <label className="text-xs text-slate-500 block mb-1">Mã Học sinh</label>
                        <input className="w-full border p-2 rounded" value={editingStudent.code || ''} onChange={e => setEditingStudent({...editingStudent, code: e.target.value})} />
                    </div>
                    <div className="col-span-1">
                        <label className="text-xs text-slate-500 block mb-1">Lớp</label>
                        <select className="w-full border p-2 rounded" value={editingStudent.classId || ''} onChange={e => setEditingStudent({...editingStudent, classId: e.target.value})}>
                            <option value="">-- Chọn lớp --</option>
                            {classes.map(c => <option key={c.id} value={c.id}>{c.className}</option>)}
                        </select>
                    </div>
                    <div className="col-span-2">
                        <label className="text-xs text-slate-500 block mb-1">Họ và tên</label>
                        <input className="w-full border p-2 rounded" value={editingStudent.fullName || ''} onChange={e => setEditingStudent({...editingStudent, fullName: e.target.value})} />
                    </div>
                    <div className="col-span-1">
                        <label className="text-xs text-slate-500 block mb-1">Giới tính</label>
                        <select className="w-full border p-2 rounded" value={editingStudent.gender || 'Nam'} onChange={e => setEditingStudent({...editingStudent, gender: e.target.value as 'Nam'|'Nữ'})}>
                            <option value="Nam">Nam</option>
                            <option value="Nữ">Nữ</option>
                        </select>
                    </div>
                    <div className="col-span-1">
                        <label className="text-xs text-slate-500 block mb-1">Ngày sinh</label>
                        <input type="date" className="w-full border p-2 rounded" value={editingStudent.dob || ''} onChange={e => setEditingStudent({...editingStudent, dob: e.target.value})} />
                    </div>
                    <div className="col-span-2">
                        <label className="text-xs text-slate-500 block mb-1">Địa chỉ</label>
                        <input className="w-full border p-2 rounded" value={editingStudent.address || ''} onChange={e => setEditingStudent({...editingStudent, address: e.target.value})} />
                    </div>
                    <div className="col-span-2">
                        <label className="text-xs text-slate-500 block mb-1">Trạng thái</label>
                        <select className="w-full border p-2 rounded" value={editingStudent.status || 'Đang học'} onChange={e => setEditingStudent({...editingStudent, status: e.target.value as any})}>
                            <option value="Đang học">Đang học</option>
                            <option value="Đã nghỉ">Đã nghỉ</option>
                            <option value="Chuyển trường">Chuyển trường</option>
                        </select>
                    </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                    <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">Hủy</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Lưu thông tin</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default StudentList;