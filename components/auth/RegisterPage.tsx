import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getProvider } from '../../core/provider';
import { useAuth } from '../../contexts/AuthContext';
import { School, User, Lock, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'admin' | 'app'>('app');
  const [studentCode, setStudentCode] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
        let relatedId = undefined;
        
        // If registering as Parent/Student, verify Code
        if (role === 'app') {
            if(!studentCode) throw new Error('Vui lòng nhập Mã học sinh');
            const student = await getProvider().getStudentByCode(studentCode);
            if (!student) {
                throw new Error('Không tìm thấy học sinh với mã này');
            }
            relatedId = student.id;
        }

        const newUser = await getProvider().register({
            id: '',
            username,
            password,
            fullName,
            role,
            relatedId
        });

        if (newUser) {
            login(newUser);
            if (newUser.role === 'admin') navigate('/admin');
            else navigate('/app');
        }
    } catch (err: any) {
      setError(err.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md border border-slate-100">
        <div className="flex flex-col items-center mb-6">
            <h1 className="text-2xl font-bold text-slate-800">Đăng ký tài khoản</h1>
            <p className="text-slate-500">Tham gia lớp học ngay hôm nay</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
            {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center font-medium">{error}</div>}
            
            <div className="grid grid-cols-2 gap-3">
                 <button
                    type="button"
                    onClick={() => setRole('app')}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition ${role === 'app' ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                 >
                    <UserCheck size={24}/>
                    <span className="text-xs">Phụ huynh/HS</span>
                 </button>
                 <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition ${role === 'admin' ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                 >
                    <ShieldCheck size={24}/>
                    <span className="text-xs">Giáo viên</span>
                 </button>
            </div>

            <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Họ và tên hiển thị</label>
                <input 
                    className="w-full border border-slate-200 px-4 py-2.5 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="VD: Nguyễn Văn A"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Tên đăng nhập</label>
                <input 
                    className="w-full border border-slate-200 px-4 py-2.5 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Mật khẩu</label>
                <input 
                    type="password"
                    className="w-full border border-slate-200 px-4 py-2.5 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                />
            </div>

            {role === 'app' && (
                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                    <label className="block text-sm font-bold text-yellow-800 mb-1">Mã Học sinh (Để liên kết)</label>
                    <input 
                        className="w-full border border-yellow-200 px-4 py-2 rounded-lg focus:outline-none focus:border-yellow-500 text-sm"
                        placeholder="VD: HS001"
                        value={studentCode}
                        onChange={e => setStudentCode(e.target.value)}
                    />
                    <p className="text-[10px] text-yellow-600 mt-1">Dùng mã <b>HS001</b> hoặc <b>HS002</b> để thử nghiệm</p>
                </div>
            )}

            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition flex justify-center items-center gap-2 mt-2 disabled:opacity-70"
            >
                {loading ? 'Đang xử lý...' : <>Đăng ký ngay <ArrowRight size={18}/></>}
            </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
            Đã có tài khoản? <Link to="/login" className="text-blue-600 font-bold hover:underline">Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;