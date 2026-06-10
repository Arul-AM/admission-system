import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Navbar from '../components/shared/Navbar';

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true); setError('');
    try {
      const res = await api.post('/auth/login', data);
      login(res.data.user, res.data.token);
      const role = res.data.user.role;
      navigate(role === 'admin' ? '/admin' : '/staff/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <Navbar />
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12">
        <div className="w-full max-w-md fade-in">
          <div className="card p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">CEG</span>
              </div>
              <h1 className="font-display text-2xl font-bold text-slate-800 dark:text-white">Staff / Admin Login</h1>
              <p className="text-sm text-slate-500 mt-1">University Admission Portal</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="label">Username</label>
                <input {...register('username', { required: 'Username is required' })}
                  className="input" placeholder="admin or staff01..." />
                {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
              </div>
              <div>
                <label className="label">Password</label>
                <input type="password" {...register('password', { required: 'Password is required' })}
                  className="input" placeholder="••••••••" />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Signing in...</span> : 'Sign In'}
              </button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-6">
              Student?{' '}
              <Link to="/student-login" className="text-blue-600 hover:underline font-medium">Login here</Link>
            </p>
          </div>
         
        </div>
      </div>
    </div>
  );
}
