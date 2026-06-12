import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Navbar from '../components/shared/Navbar';

function LayeredWaves() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    const waves = [
      { amplitude: 38, frequency: 0.012, speed: 0.018, yOffset: 0.62, color: 'rgba(30, 40, 100, 0.85)' },
      { amplitude: 30, frequency: 0.016, speed: 0.024, yOffset: 0.70, color: 'rgba(50, 60, 150, 0.70)' },
      { amplitude: 22, frequency: 0.020, speed: 0.030, yOffset: 0.78, color: 'rgba(70, 50, 160, 0.60)' },
      { amplitude: 16, frequency: 0.025, speed: 0.038, yOffset: 0.85, color: 'rgba(40, 80, 180, 0.50)' },
    ];

    let t = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 1;

      waves.forEach((wave, i) => {
        ctx.beginPath();
        ctx.moveTo(0, canvas.height);

        for (let x = 0; x <= canvas.width; x += 2) {
          const y =
            wave.yOffset * canvas.height +
            Math.sin(x * wave.frequency + t * wave.speed) * wave.amplitude +
            Math.sin(x * wave.frequency * 0.6 + t * wave.speed * 0.8 + i) * wave.amplitude * 0.4;
          ctx.lineTo(x, y);
        }

        ctx.lineTo(canvas.width, canvas.height);
        ctx.closePath();
        ctx.fillStyle = wave.color;
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };

    resize();
    animate();

    const handleResize = () => resize();
    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}

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
    <div
      className="min-h-screen"
      style={{ background: '#080f1e', position: 'relative', overflow: 'hidden' }}
    >
      {/* Layered waves canvas */}
      <LayeredWaves />

      {/* Content */}
      <div className="relative" style={{ zIndex: 1 }}>
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12">
          <div className="w-full max-w-md fade-in">
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.70)',
                backdropFilter: 'blur(18px)',
                WebkitBackdropFilter: 'blur(18px)',
                border: '1px solid rgba(100, 140, 255, 0.18)',
                borderRadius: '20px',
                padding: '2rem',
              }}
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">CEG</span>
                </div>
                <h1 className="font-display text-2xl font-bold text-white">Staff / Admin Login</h1>
                <p className="text-sm text-slate-400 mt-1">University Admission Portal</p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-900/30 border border-red-700/40 rounded-xl text-sm text-red-400">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label className="label text-slate-300">Username</label>
                  <input
                    {...register('username', { required: 'Username is required' })}
                    className="input"
                    style={{ background: 'rgba(30,41,59,0.7)', borderColor: 'rgba(100,140,255,0.2)', color: '#fff' }}
                    placeholder="admin or staff01..."
                  />
                  {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username.message}</p>}
                </div>
                <div>
                  <label className="label text-slate-300">Password</label>
                  <input
                    type="password"
                    {...register('password', { required: 'Password is required' })}
                    className="input"
                    style={{ background: 'rgba(30,41,59,0.7)', borderColor: 'rgba(100,140,255,0.2)', color: '#fff' }}
                    placeholder="••••••••"
                  />
                  {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Signing in...
                    </span>
                  ) : 'Sign In'}
                </button>
              </form>

              <p className="text-center text-sm text-slate-400 mt-6">
                Student?{' '}
                <Link to="/student-login" className="text-blue-400 hover:underline font-medium">Login here</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
