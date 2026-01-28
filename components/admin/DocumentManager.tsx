import React, { useEffect, useState } from 'react';
import { getProvider } from '../../core/provider';
import { ClassDocument, ClassInfo } from '../../core/types';
import { Plus, Edit, Trash2, FileText, ExternalLink } from 'lucide-react';

const DocumentManager: React.FC = () => {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [documents, setDocuments] = useState<ClassDocument[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDoc, setCurrentDoc] = useState<Partial<ClassDocument>>({});

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
    const list = await getProvider().getDocuments(selectedClassId);
    setDocuments(list);
  };

  const handleSave = async () => {
    if (!currentDoc.title || !currentDoc.url || !selectedClassId) return alert('Nhập tiêu đề và đường dẫn.');
    
    const payload = {
        ...currentDoc,
        classId: selectedClassId,
        category: currentDoc.category || 'Chung',
        createdAt: currentDoc.createdAt || new Date().toISOString()
    } as ClassDocument;

    if (currentDoc.id) {
        await getProvider().updateDocument(payload);
    } else {
        await getProvider().addDocument(payload);
    }
    setIsModalOpen(false);
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Xóa tài liệu này?')) {
        await getProvider().deleteDocument(id);
        loadData();
    }
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
          onClick={() => { setCurrentDoc({ category: 'Nội quy' }); setIsModalOpen(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <Plus size={18} /> Thêm tài liệu
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map(doc => (
            <div key={doc.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-start gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                    <FileText size={24} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-xs text-slate-400 mb-1 uppercase font-bold">{doc.category}</div>
                    <h4 className="font-bold text-slate-800 truncate mb-1" title={doc.title}>{doc.title}</h4>
                    <a href={doc.url} target="_blank" rel="noreferrer" className="text-blue-500 text-xs flex items-center gap-1 hover:underline mb-2">
                        {doc.url} <ExternalLink size={10}/>
                    </a>
                    <div className="flex gap-2 justify-end pt-2 border-t border-slate-50">
                        <button onClick={() => { setCurrentDoc(doc); setIsModalOpen(true); }} className="text-slate-400 hover:text-blue-600"><Edit size={16}/></button>
                        <button onClick={() => handleDelete(doc.id)} className="text-slate-400 hover:text-red-600"><Trash2 size={16}/></button>
                    </div>
                </div>
            </div>
        ))}
        {documents.length === 0 && <div className="col-span-full p-8 text-center text-slate-400 bg-white rounded-xl border border-slate-100 border-dashed">Chưa có tài liệu nào.</div>}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl w-full max-w-md">
                <h3 className="text-xl font-bold mb-4">{currentDoc.id ? 'Sửa tài liệu' : 'Thêm tài liệu mới'}</h3>
                <div className="space-y-4">
                    <input className="w-full border p-2 rounded" placeholder="Tên tài liệu" value={currentDoc.title || ''} onChange={e => setCurrentDoc({...currentDoc, title: e.target.value})}/>
                    <input className="w-full border p-2 rounded" placeholder="Đường dẫn (URL)" value={currentDoc.url || ''} onChange={e => setCurrentDoc({...currentDoc, url: e.target.value})}/>
                    
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Danh mục</label>
                        <input list="categories" className="w-full border p-2 rounded" value={currentDoc.category || ''} onChange={e => setCurrentDoc({...currentDoc, category: e.target.value})} placeholder="Chọn hoặc nhập mới..."/>
                        <datalist id="categories">
                            <option value="Nội quy"/>
                            <option value="Kế hoạch"/>
                            <option value="Biểu mẫu"/>
                            <option value="Học tập"/>
                        </datalist>
                    </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                    <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">Hủy</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Lưu tài liệu</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default DocumentManager;