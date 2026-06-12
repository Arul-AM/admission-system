import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Navbar from '../components/shared/Navbar';

const STAGE_NAMES = ['Registered', 'Document Verification', 'Certificate Verification', 'Online Verification', 'Photo Capture', 'Admission Completion', 'Completed'];

function FloatingShapes() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const COLORS = [
      'rgba(99, 102, 241, 0.55)',   // indigo
      'rgba(139, 92, 246, 0.50)',   // purple
      'rgba(59, 130, 246, 0.50)',   // blue
      'rgba(234, 179, 8, 0.35)',    // amber
      'rgba(236, 72, 153, 0.35)',   // pink
    ];

    const shapes = Array.from({ length: 18 }, (_, i) => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight + window.innerHeight * 0.2,
      size: 22 + Math.random() * 38,
      speed: 0.25 + Math.random() * 0.55,
      drift: (Math.random() - 0.5) * 0.35,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.012,
      color: COLORS[i % COLORS.length],
      // 0 = square, 1 = circle, 2 = triangle
      type: i % 3,
      opacity: 0.15 + Math.random() * 0.45,
    }));

    const drawRoundedRect = (x, y, size, radius, rotation) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      const r = Math.min(radius, size / 2);
      const s = size / 2;
      ctx.beginPath();
      ctx.moveTo(-s + r, -s);
      ctx.lineTo(s - r, -s);
      ctx.quadraticCurveTo(s, -s, s, -s + r);
      ctx.lineTo(s, s - r);
      ctx.quadraticCurveTo(s, s, s - r, s);
      ctx.lineTo(-s + r, s);
      ctx.quadraticCurveTo(-s, s, -s, s - r);
      ctx.lineTo(-s, -s + r);
      ctx.quadraticCurveTo(-s, -s, -s + r, -s);
      ctx.closePath();
      ctx.restore();
    };

    const drawTriangle = (x, y, size, rotation) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      const s = size / 2;
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.lineTo(s, s);
      ctx.lineTo(-s, s);
      ctx.closePath();
      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      shapes.forEach(shape => {
        shape.y -= shape.speed;
        shape.x += shape.drift;
        shape.rotation += shape.rotSpeed;

        // Reset when off screen top
        if (shape.y < -shape.size * 2) {
          shape.y = canvas.height + shape.size;
          shape.x = Math.random() * canvas.width;
        }
        // Wrap horizontally
        if (shape.x < -shape.size) shape.x = canvas.width + shape.size;
        if (shape.x > canvas.width + shape.size) shape.x = -shape.size;

        ctx.globalAlpha = shape.opacity;
        ctx.strokeStyle = shape.color;
        ctx.lineWidth = 1.5;
        ctx.fillStyle = shape.color.replace(/[\d.]+\)$/, '0.08)');

        if (shape.type === 0) {
          // Rounded square
          drawRoundedRect(shape.x, shape.y, shape.size, shape.size * 0.22, shape.rotation);
          ctx.fill();
          ctx.stroke();
        } else if (shape.type === 1) {
          // Circle
          ctx.beginPath();
          ctx.arc(shape.x, shape.y, shape.size / 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        } else {
          // Triangle
          drawTriangle(shape.x, shape.y, shape.size, shape.rotation);
          ctx.fill();
          ctx.stroke();
        }

        ctx.globalAlpha = 1;
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

export default function StaffDashboard() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [advancing, setAdvancing] = useState(null);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');

  const staffStage = user?.stage;

  const loadStudents = () => {
    setLoading(true);
    api.get(`/students?stage=${staffStage}`)
      .then(res => setStudents(res.data.students || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadStudents(); }, [staffStage]);

  const advanceStudent = async (studentId, studentName) => {
    setAdvancing(studentId);
    try {
      const res = await api.post(`/students/${studentId}/advance`, {});
      setMessage(`✅ ${studentName} moved to ${res.data.currentStage} — ${STAGE_NAMES[res.data.currentStage]}`);
      loadStudents();
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setMessage(`❌ ${err.response?.data?.message || 'Failed to advance student'}`);
      setTimeout(() => setMessage(''), 4000);
    } finally { setAdvancing(null); }
  };

  const filtered = students.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.applicationNumber?.toLowerCase().includes(search.toLowerCase()) ||
    s.token?.toLowerCase().includes(search.toLowerCase())
  );

  // Shared glass style
  const glass = (extra = {}) => ({
    background: 'rgba(10, 17, 40, 0.68)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(99, 130, 255, 0.16)',
    borderRadius: '16px',
    ...extra,
  });

  return (
    <div style={{ minHeight: '100vh', background: '#080f1e', position: 'relative', overflow: 'hidden' }}>
      <FloatingShapes />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <Navbar />

        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1rem' }}>
          <div className="fade-in">

            {/* Header card */}
            <div style={{
              ...glass(),
              padding: '1.5rem',
              marginBottom: '1.25rem',
              background: 'rgba(15, 23, 50, 0.80)',
              borderColor: 'rgba(99, 130, 255, 0.22)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <p style={{ fontSize: 12, color: '#64748b', marginBottom: 2 }}>Staff Dashboard</p>
                  <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>{user?.name}</h1>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                    <span style={{
                      background: 'rgba(59,130,246,0.2)', color: '#60a5fa',
                      border: '1px solid rgba(59,130,246,0.3)',
                      borderRadius: 6, fontSize: 11, fontWeight: 600, padding: '2px 8px',
                    }}>
                      Stage {staffStage}
                    </span>
                    <span style={{ fontSize: 13, color: '#94a3b8' }}>{STAGE_NAMES[staffStage]}</span>
                  </div>
                </div>
                <div style={{
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12, padding: '12px 20px', textAlign: 'center',
                }}>
                  <p style={{ fontSize: 11, color: '#64748b', marginBottom: 2 }}>Students Pending</p>
                  <p style={{ fontSize: 30, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>{students.length}</p>
                </div>
              </div>
            </div>

            {/* Message */}
            {message && (
              <div style={{
                padding: '12px 16px',
                borderRadius: 12,
                marginBottom: '1rem',
                fontSize: 13,
                fontWeight: 500,
                background: message.startsWith('✅') ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                border: `1px solid ${message.startsWith('✅') ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                color: message.startsWith('✅') ? '#6ee7b7' : '#fca5a5',
              }}>
                {message}
              </div>
            )}

            {/* Access info */}
            <div style={{
              ...glass({ padding: '12px 16px', marginBottom: '1.25rem' }),
              background: 'rgba(59,130,246,0.08)',
              borderColor: 'rgba(59,130,246,0.2)',
            }}>
              <p style={{ fontSize: 13, color: '#93c5fd', margin: 0 }}>
                <strong>🔒 Your Access:</strong> You can only view and process students at{' '}
                <strong>Stage {staffStage} — {STAGE_NAMES[staffStage]}</strong>. Students are strictly sequential and cannot skip stages.
              </p>
            </div>

            {/* Search */}
            <div style={{ marginBottom: '1rem' }}>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="🔍 Search by name, application number, or token..."
                style={{
                  width: '100%',
                  maxWidth: 420,
                  padding: '10px 14px',
                  background: 'rgba(15, 23, 50, 0.70)',
                  border: '1px solid rgba(99,130,255,0.2)',
                  borderRadius: 10,
                  color: '#f1f5f9',
                  fontSize: 14,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Table card */}
            <div style={{ ...glass({ overflow: 'hidden' }) }}>
              <div style={{
                padding: '14px 20px',
                borderBottom: '1px solid rgba(99,130,255,0.12)',
              }}>
                <h2 style={{ fontSize: 15, fontWeight: 600, color: '#f1f5f9', margin: 0 }}>
                  Students at Stage {staffStage} — {STAGE_NAMES[staffStage]}
                </h2>
              </div>

              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3rem' }}>
                  <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>🎯</div>
                  <p style={{ color: '#64748b', fontSize: 14 }}>No students pending at this stage.</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: 'rgba(15,23,50,0.60)' }}>
                        {['Name', 'App. No.', 'Token', 'Dept', 'Round', 'Mobile', 'Action'].map(h => (
                          <th key={h} style={{
                            textAlign: 'left', padding: '10px 16px',
                            color: '#64748b', fontWeight: 500, fontSize: 12,
                            whiteSpace: 'nowrap',
                          }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((s, idx) => (
                        <tr
                          key={s.uid}
                          style={{
                            borderTop: '1px solid rgba(99,130,255,0.08)',
                            background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
                          }}
                        >
                          <td style={{ padding: '10px 16px', color: '#f1f5f9', fontWeight: 500 }}>{s.name}</td>
                          <td style={{ padding: '10px 16px', color: '#94a3b8', fontFamily: 'monospace', fontSize: 11 }}>{s.applicationNumber}</td>
                          <td style={{ padding: '10px 16px' }}>
                            <span style={{
                              background: 'rgba(59,130,246,0.15)',
                              color: '#60a5fa',
                              border: '1px solid rgba(59,130,246,0.25)',
                              borderRadius: 6,
                              padding: '2px 8px',
                              fontFamily: 'monospace',
                              fontSize: 11,
                            }}>{s.token}</span>
                          </td>
                          <td style={{ padding: '10px 16px', color: '#cbd5e1' }}>{s.department}</td>
                          <td style={{ padding: '10px 16px', color: '#94a3b8', fontSize: 12 }}>{s.round}</td>
                          <td style={{ padding: '10px 16px', color: '#94a3b8' }}>{s.mobile}</td>
                          <td style={{ padding: '10px 16px' }}>
                            <button
                              onClick={() => advanceStudent(s.uid, s.name)}
                              disabled={advancing === s.uid}
                              style={{
                                padding: '6px 12px',
                                background: advancing === s.uid
                                  ? 'rgba(37,99,235,0.4)'
                                  : 'linear-gradient(135deg, #1d4ed8, #4f46e5)',
                                border: 'none',
                                borderRadius: 8,
                                color: '#fff',
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: advancing === s.uid ? 'not-allowed' : 'pointer',
                                whiteSpace: 'nowrap',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 5,
                                boxShadow: '0 2px 8px rgba(79,70,229,0.3)',
                              }}
                            >
                              {advancing === s.uid ? (
                                <>
                                  <span style={{
                                    width: 12, height: 12,
                                    border: '2px solid rgba(255,255,255,0.4)',
                                    borderTopColor: '#fff',
                                    borderRadius: '50%',
                                    display: 'inline-block',
                                    animation: 'spin 0.7s linear infinite',
                                  }} />
                                  Processing
                                </>
                              ) : `Move to Stage ${staffStage + 1} →`}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
