import React, { useEffect, useState } from 'react';
import { getProvider } from '../../core/provider';
import { ClassDocument } from '../../core/types';
import { FileText, Download, Folder } from 'lucide-react';

const DocumentList: React.FC = () => {
  const [documents, setDocuments] = useState<ClassDocument[]>([]);

  useEffect(() => {
    getProvider().getClasses().then(async (classes) => {
        if (classes.length > 0) {
            const list = await getProvider().getDocuments(classes[0].id);
            setDocuments(list);
        }
    });
  }, []);

  // Group by category
  const groupedDocs = documents.reduce((acc, doc) => {
      if (!acc[doc.category]) acc[doc.category] = [];
      acc[doc.category].push(doc);
      return acc;
  }, {} as Record<string, ClassDocument[]>);

  return (
    <div className="space-y-6">
        <div>
            <h2 className="text-2xl font-bold text-slate-800">Kho tài liệu</h2>
            <p className="text-slate-500">Biểu mẫu, nội quy và tài liệu học tập</p>
        </div>

        {Object.keys(groupedDocs).length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center text-slate-400 bg-white rounded-xl border border-slate-100">
                <Folder size={48} className="mb-4 opacity-20"/>
                <p>Thư mục trống.</p>
            </div>
        ) : Object.entries(groupedDocs).map(([category, docs]: [string, ClassDocument[]]) => (
            <div key={category}>
                <h3 className="text-lg font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <Folder className="text-blue-500" size={20} fill="currentColor" fillOpacity={0.2}/> 
                    {category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {docs.map(doc => (
                        <div key={doc.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between group hover:border-blue-200 transition">
                            <div className="flex items-center gap-4 overflow-hidden">
                                <div className="p-3 bg-slate-50 text-slate-500 rounded-lg group-hover:bg-blue-50 group-hover:text-blue-600 transition">
                                    <FileText size={24} />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-bold text-slate-800 truncate" title={doc.title}>{doc.title}</h4>
                                    <div className="text-xs text-slate-400">{new Date(doc.createdAt).toLocaleDateString()}</div>
                                </div>
                            </div>
                            <a 
                                href={doc.url} 
                                target="_blank" 
                                rel="noreferrer"
                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded-full transition"
                                title="Mở / Tải về"
                            >
                                <Download size={20} />
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        ))}
    </div>
  );
};

export default DocumentList;