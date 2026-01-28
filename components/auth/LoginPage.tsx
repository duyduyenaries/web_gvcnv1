import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getProvider } from '../../core/provider';
import { useAuth } from '../../contexts/AuthContext';
import { School, User, Lock, ArrowRight } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await getProvider().login(username, password);
      if (user) {
        login(user);
        if (user.role === 'admin') navigate('/admin');
        else navigate('/app');
      } else {
        setError('Sai tên đăng nhập hoặc mật khẩu');
      }
    } catch (err) {
      setError('Đã có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md border border-slate-100">
        <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
                <School size={32} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Lớp Chủ Nhiệm</h1>
            <p className="text-slate-500">Đăng nhập để tiếp tục</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
            {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center font-medium">{error}</div>}
            
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Tên đăng nhập</label>
                <div className="relative">
                    <User className="absolute left-3 top-3 text-slate-400" size={18}/>
                    <input 
                        className="w-full border border-slate-200 pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:border-blue-500 transition"
                        placeholder="Nhập tên đăng nhập"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        required
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Mật khẩu</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-3 text-slate-400" size={18}/>
                    <input 
                        type="password"
                        className="w-full border border-slate-200 pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:border-blue-500 transition"
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                </div>
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition flex justify-center items-center gap-2 disabled:opacity-70"
            >
                {loading ? 'Đang xử lý...' : <>Đăng nhập <ArrowRight size={18}/></>}
            </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
            Chưa có tài khoản? <Link to="/register" className="text-blue-600 font-bold hover:underline">Đăng ký ngay</Link>
        </div>
        
        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
             <div className="text-xs text-slate-400 uppercase font-bold mb-2">Tài khoản mẫu</div>
             <div className="text-xs text-slate-500">
                 GV: <b>admin</b> / <b>123</b> <br/>
                 PH: <b>ph</b> / <b>123</b>
             </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;