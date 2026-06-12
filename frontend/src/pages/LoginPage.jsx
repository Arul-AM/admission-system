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
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const waves = [
      { amplitude: 40, frequency: 0.010, speed: 0.016, yOffset: 0.55, color: 'rgba(25, 35, 90, 0.90)' },
      { amplitude: 32, frequency: 0.014, speed: 0.022, yOffset: 0.65, color: 'rgba(50, 55, 145, 0.75)' },
      { amplitude: 24, frequency: 0.018, speed: 0.028, yOffset: 0.74, color: 'rgba(75, 50, 165, 0.65)' },
      { amplitude: 18, frequency: 0.023, speed: 0.036, yOffset: 0.82, color: 'rgba(45, 85, 190, 0.55)' },
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
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
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

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    background: 'rgba(30, 41, 59, 0.75)',
    border: '1px solid rgba(100, 140, 255, 0.25)',
    borderRadius: '10px',
    color: '#f1f5f9',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '13px',
    fontWeight: '500',
    color: '#94a3b8',
    marginBottom: '6px',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#080f1e', position: 'relative', overflow: 'hidden' }}>
      {/* Animated waves */}
      <LayeredWaves />

      {/* Page content above canvas */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />

        {/* Centered login card */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
          <div style={{ width: '100%', maxWidth: '420px' }}>
            {/* Glass card */}
            <div style={{
              background: 'rgba(10, 17, 35, 0.72)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(100, 140, 255, 0.18)',
              borderRadius: '20px',
              padding: '2.5rem 2rem',
              boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
            }}>

              {/* Logo + heading */}
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{
                  width: 64, height: 64,
                  background: 'linear-gradient(135deg, #1d4ed8, #4f46e5)',
                  borderRadius: '16px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1rem',
                  boxShadow: '0 4px 20px rgba(79,70,229,0.4)',
                }}>
                  <span style={{ color: '#fff', fontWeight: '700', fontSize: '18px' }}>CEG</span>
                </div>
                <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#f1f5f9', margin: 0 }}>
                  Staff / Admin Login
                </h1>
                <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                  University Admission Portal
                </p>
              </div>

              {/* Error */}
              {error && (
                <div style={{
                  marginBottom: '1rem',
                  padding: '10px 14px',
                  background: 'rgba(239,68,68,0.15)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: '10px',
                  fontSize: '13px',
                  color: '#fca5a5',
                }}>
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)}>
                {/* Username */}
                <div style={{ marginBottom: '1.1rem' }}>
                  <label style={labelStyle}>Username</label>
                  <input
                    {...register('username', { required: 'Username is required' })}
                    style={inputStyle}
                    placeholder="admin or staff01..."
                  />
                  {errors.username && (
                    <p style={{ color: '#f87171', fontSize: '12px', marginTop: '4px' }}>
                      {errors.username.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={labelStyle}>Password</label>
                  <input
                    type="password"
                    {...register('password', { required: 'Password is required' })}
                    style={inputStyle}
                    placeholder="••••••••"
                  />
                  {errors.password && (
                    <p style={{ color: '#f87171', fontSize: '12px', marginTop: '4px' }}>
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: loading
                      ? 'rgba(37,99,235,0.5)'
                      : 'linear-gradient(135deg, #1d4ed8, #4f46e5)',
                    border: 'none',
                    borderRadius: '10px',
                    color: '#fff',
                    fontWeight: '600',
                    fontSize: '15px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 15px rgba(79,70,229,0.35)',
                    transition: 'opacity 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  {loading ? (
                    <>
                      <span style={{
                        width: 16, height: 16,
                        border: '2px solid rgba(255,255,255,0.4)',
                        borderTopColor: '#fff',
                        borderRadius: '50%',
                        display: 'inline-block',
                        animation: 'spin 0.7s linear infinite',
                      }} />
                      Signing in...
                    </>
                  ) : 'Sign In'}
                </button>
              </form>

              <p style={{ textAlign: 'center', fontSize: '13px', color: '#64748b', marginTop: '1.5rem' }}>
                Student?{' '}
                <Link to="/student-login" style={{ color: '#60a5fa', fontWeight: '500', textDecoration: 'none' }}>
                  Login here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
