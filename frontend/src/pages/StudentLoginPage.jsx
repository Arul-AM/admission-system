import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Navbar from '../components/shared/Navbar';

export default function StudentLoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true); setError('');
    try {
      const res = await api.post('/auth/student-login', data);
      login(res.data.user, res.data.token);
      navigate('/student/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your details.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <Navbar />
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12">
        <div className="w-full max-w-md fade-in">
          <div className="card p-8">
            <div className="text-center mb-8">
              <div className="text-4xl mb-3">🎓</div>
              <h1 className="font-display text-2xl font-bold text-slate-800 dark:text-white">Student Login</h1>
              <p className="text-sm text-slate-500 mt-1">Enter your application details to continue</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="label">Application Number</label>
                <input {...register('applicationNumber', { required: 'Application number is required' })}
                  className="input" placeholder="e.g. 26000" />
                {errors.applicationNumber && <p className="text-red-500 text-xs mt-1">{errors.applicationNumber.message}</p>}
              </div>
              <div>
                <label className="label">Registered Mobile Number</label>
                <input {...register('mobile', { required: 'Mobile number is required', pattern: { value: /^[6-9]\d{9}$/, message: 'Enter valid 10-digit mobile number' } })}
                  className="input" placeholder="10-digit mobile number" maxLength={10} />
                {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile.message}</p>}
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Checking...</span> : 'View My Status'}
              </button>
            </form>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                <strong>Note:</strong> Use the Application Number and Mobile Number you provided during registration.
              </p>
            </div>

            <p className="text-center text-sm text-slate-500 mt-4">
              New student?{' '}
              <Link to="/register" className="text-blue-600 hover:underline font-medium">Register here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
