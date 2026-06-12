import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Navbar from '../components/shared/Navbar';

function Aurora() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const blobs = [
      { x: 0.25, y: 0.35, rx: 0.55, ry: 0.30, hue: 185, speed: 0.00018, phase: 0.0 },
      { x: 0.65, y: 0.25, rx: 0.45, ry: 0.25, hue: 200, speed: 0.00022, phase: 1.2 },
      { x: 0.50, y: 0.55, rx: 0.60, ry: 0.22, hue: 220, speed: 0.00015, phase: 2.5 },
      { x: 0.80, y: 0.45, rx: 0.40, ry: 0.28, hue: 170, speed: 0.00020, phase: 0.8 },
    ];

    let t = 0;

    const animate = (ts) => {
      t = ts;
      const W = canvas.width;
      const H = canvas.height;

      // Deep dark base
      ctx.fillStyle = '#060d18';
      ctx.fillRect(0, 0, W, H);

      blobs.forEach(b => {
        const cx = (b.x + Math.sin(t * b.speed + b.phase) * 0.12) * W;
        const cy = (b.y + Math.cos(t * b.speed * 1.3 + b.phase) * 0.10) * H;
        const rx = b.rx * W;
        const ry = b.ry * H;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(1, ry / rx);

        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
        const hShift = Math.sin(t * b.speed * 0.7 + b.phase) * 18;
        g.addColorStop(0,   `hsla(${b.hue + hShift}, 70%, 48%, 0.30)`);
        g.addColorStop(0.4, `hsla(${b.hue + hShift}, 65%, 38%, 0.16)`);
        g.addColorStop(1,   `hsla(${b.hue + hShift}, 60%, 28%, 0.00)`);

        ctx.beginPath();
        ctx.arc(0, 0, rx, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
        ctx.restore();
      });

      // Subtle horizontal shimmer bands
      for (let i = 0; i < 3; i++) {
        const yBand = (0.2 + i * 0.22 + Math.sin(t * 0.00012 + i * 1.4) * 0.06) * canvas.height;
        const gBand = ctx.createLinearGradient(0, yBand - 60, 0, yBand + 60);
        gBand.addColorStop(0,   'rgba(80,180,200,0.00)');
        gBand.addColorStop(0.5, `rgba(80,180,200,${0.04 + 0.03 * Math.abs(Math.sin(t * 0.00015 + i))})`);
        gBand.addColorStop(1,   'rgba(80,180,200,0.00)');
        ctx.fillStyle = gBand;
        ctx.fillRect(0, yBand - 60, canvas.width, 120);
      }

      animationId = requestAnimationFrame(animate);
    };

    resize();
    animationId = requestAnimationFrame(animate);
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

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    background: 'rgba(20, 35, 55, 0.75)',
    border: '1px solid rgba(80, 180, 200, 0.22)',
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
    <div style={{ minHeight: '100vh', background: '#060d18', position: 'relative', overflow: 'hidden' }}>
      <Aurora />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
          <div style={{ width: '100%', maxWidth: '420px' }}>

            {/* Glass card */}
            <div style={{
              background: 'rgba(8, 18, 38, 0.68)',
              backdropFilter: 'blur(22px)',
              WebkitBackdropFilter: 'blur(22px)',
              border: '1px solid rgba(80, 180, 200, 0.18)',
              borderRadius: '20px',
              padding: '2.5rem 2rem',
              boxShadow: '0 8px 48px rgba(0,0,0,0.55), 0 0 80px rgba(40,140,160,0.08)',
            }}>

              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>🎓</div>
                <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#f1f5f9', margin: 0 }}>
                  Student Login
                </h1>
                <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                  Enter your application details to continue
                </p>
              </div>

              {/* Error */}
              {error && (
                <div style={{
                  marginBottom: '1rem',
                  padding: '10px 14px',
                  background: 'rgba(239,68,68,0.14)',
                  border: '1px solid rgba(239,68,68,0.28)',
                  borderRadius: '10px',
                  fontSize: '13px',
                  color: '#fca5a5',
                }}>
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)}>
                <div style={{ marginBottom: '1.1rem' }}>
                  <label style={labelStyle}>Application Number</label>
                  <input
                    {...register('applicationNumber', { required: 'Application number is required' })}
                    style={inputStyle}
                    placeholder="e.g. 26000"
                  />
                  {errors.applicationNumber && (
                    <p style={{ color: '#f87171', fontSize: '12px', marginTop: '4px' }}>
                      {errors.applicationNumber.message}
                    </p>
                  )}
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={labelStyle}>Registered Mobile Number</label>
                  <input
                    {...register('mobile', {
                      required: 'Mobile number is required',
                      pattern: { value: /^[6-9]\d{9}$/, message: 'Enter valid 10-digit mobile number' },
                    })}
                    style={inputStyle}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                  />
                  {errors.mobile && (
                    <p style={{ color: '#f87171', fontSize: '12px', marginTop: '4px' }}>
                      {errors.mobile.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: loading
                      ? 'rgba(20,100,120,0.5)'
                      : 'linear-gradient(135deg, #0e7490, #0369a1)',
                    border: 'none',
                    borderRadius: '10px',
                    color: '#fff',
                    fontWeight: '600',
                    fontSize: '15px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 18px rgba(14,116,144,0.40)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'opacity 0.2s',
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
                      Checking...
                    </>
                  ) : 'View My Status'}
                </button>
              </form>

              {/* Note */}
              <div style={{
                marginTop: '1.25rem',
                padding: '12px 14px',
                background: 'rgba(14,116,144,0.12)',
                border: '1px solid rgba(14,116,144,0.25)',
                borderRadius: '10px',
              }}>
                <p style={{ fontSize: '12px', color: '#67e8f9', margin: 0 }}>
                  <strong>Note:</strong> Use the Application Number and Mobile Number you provided during registration.
                </p>
              </div>

              <p style={{ textAlign: 'center', fontSize: '13px', color: '#64748b', marginTop: '1.25rem' }}>
                New student?{' '}
                <Link to="/register" style={{ color: '#22d3ee', fontWeight: '500', textDecoration: 'none' }}>
                  Register here
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
