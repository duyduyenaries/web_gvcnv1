import React, { ReactNode } from 'react';
import { Home, Users, Calendar, BarChart2, MessageSquare, Menu, FileText, School, UserPlus, Clock, Star, Bell, Folder, ClipboardList, PieChart, LogOut, HelpCircle, Gamepad2 } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: ReactNode;
  role: 'admin' | 'app';
}

const Layout: React.FC<LayoutProps> = ({ children, role }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminLinks = [
    { to: '/admin', label: 'Tổng quan', icon: Home },
    { to: '/admin/classes', label: 'Lớp học', icon: School },
    { to: '/admin/reports', label: 'Báo cáo', icon: PieChart },
    { to: '/admin/announcements', label: 'Thông báo', icon: Bell },
    { to: '/admin/tasks', label: 'Nhắc việc', icon: ClipboardList },
    { to: '/admin/documents', label: 'Tài liệu', icon: Folder },
    { to: '/admin/students', label: 'Học sinh', icon: Users },
    { to: '/admin/attendance', label: 'Điểm danh', icon: Calendar },
    { to: '/admin/behavior', label: 'Nề nếp', icon: Star },
    { to: '/admin/questions', label: 'Ngân hàng câu hỏi', icon: HelpCircle },
    { to: '/admin/parents', label: 'Phụ huynh', icon: UserPlus },
  ];

  const appLinks = [
    { to: '/app', label: 'Trang chủ', icon: Home },
    { to: '/app/announcements', label: 'Bảng tin', icon: Bell },
    { to: '/app/tasks', label: 'Bài tập & Việc', icon: ClipboardList },
    { to: '/app/documents', label: 'Kho tài liệu', icon: Folder },
    { to: '/app/attendance', label: 'Chuyên cần', icon: Clock },
    { to: '/app/behavior', label: 'Góc học tập', icon: Star },
    { to: '/app/game', label: 'Game tốc độ', icon: Gamepad2 },
    { to: '/app/schedule', label: 'Thời khóa biểu', icon: Calendar },
    { to: '/app/messages', label: 'Tin nhắn', icon: MessageSquare },
  ];

  const links = role === 'admin' ? adminLinks : appLinks;

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800">
      {/* Sidebar for Desktop */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center justify-center border-b border-slate-100">
          <h1 className="text-xl font-bold text-blue-600">Lớp Chủ Nhiệm</h1>
        </div>
        <nav className="p-4 space-y-2 overflow-y-auto max-h-[calc(100vh-8rem)]">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-50 text-slate-600'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Icon size={20} />
                <span className="font-medium">{link.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 w-full p-4 border-t border-slate-100 bg-white">
            <div className="flex items-center gap-3 mb-4 px-2">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                    {user?.fullName?.charAt(0) || 'U'}
                </div>
                <div className="overflow-hidden">
                    <p className="text-sm font-bold text-slate-700 truncate">{user?.fullName}</p>
                    <p className="text-xs text-slate-400">{role === 'admin' ? 'Giáo viên' : 'Phụ huynh'}</p>
                </div>
            </div>
            <button 
                onClick={handleLogout} 
                className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 w-full px-2 font-medium"
            >
                <LogOut size={16}/> Đăng xuất
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8">
          <button 
            className="md:hidden p-2 text-slate-600"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-4">
             <span className="text-sm font-medium text-slate-500">
                {role === 'admin' ? 'Khu vực Giáo viên' : 'Khu vực Gia đình'}
             </span>
             <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${role === 'admin' ? 'bg-blue-600' : 'bg-green-600'}`}>
                {role === 'admin' ? 'GV' : 'PH'}
             </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-auto p-4 md:p-8">
            {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;