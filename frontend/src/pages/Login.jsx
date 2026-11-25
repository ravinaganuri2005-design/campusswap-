import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeftRight, Lock, Mail, AlertCircle, ArrowRight, UserCheck } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        'Invalid email or password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Demo@123');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        
        {/* Logo & Heading */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-slate-900">
              Campus<span className="text-emerald-600">Swap</span>
            </span>
          </Link>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Student Login</h2>
          <p className="text-xs text-slate-500">
            Sign in with your registered college email account.
          </p>
        </div>

        {/* Demo Fast Login Picker for Judges */}
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-emerald-800 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              Demo Accounts for Judges
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold">1-Click Auto-Fill</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('rahul.sharma@iitd.ac.in')}
              className="p-1.5 rounded-lg bg-white border border-emerald-200 text-left hover:bg-emerald-100/50 transition-colors"
            >
              <p className="font-bold text-slate-900 truncate">Rahul (IIT Delhi)</p>
              <p className="text-[10px] text-slate-400">Seller of Books/Calc</p>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('priya.patel@nitt.edu')}
              className="p-1.5 rounded-lg bg-white border border-emerald-200 text-left hover:bg-emerald-100/50 transition-colors"
            >
              <p className="font-bold text-slate-900 truncate">Priya (NIT Trichy)</p>
              <p className="text-[10px] text-slate-400">Drawing Kit / Swap</p>
            </button>
          </div>
        </div>

        {/* Main Login Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                College Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@college.edu or name@iitd.ac.in"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center gap-2 text-xs text-rose-700">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-70"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to CampusSwap'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              New to CampusSwap?{' '}
              <Link to="/register" className="font-bold text-emerald-600 hover:text-emerald-700">
                Create an account
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
