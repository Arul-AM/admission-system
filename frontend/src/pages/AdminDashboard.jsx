import { useEffect, useState, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import AdminSidebar from '../components/shared/AdminSidebar';
import { useTheme } from '../context/ThemeContext';

const STAGE_NAMES = { 0: 'Registered', 1: 'Doc Verify', 2: 'Cert Verify', 3: 'Online Verify', 4: 'Photo', 5: 'Completion', 6: 'Completed' };

function ParticleNetwork() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;
    const NODE_COUNT = 60;
    const CONNECTION_DIST = 150;
    const nodes = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    const initNodes = () => {
      nodes.length = 0;
      for (let i = 0; i < NODE_COUNT; i++) {
        nodes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          radius: 1.5 + Math.random() * 2,
          pulse: Math.random() * Math.PI * 2,
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      nodes.forEach(n => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
        n.pulse += 0.018;
      });

      // Connections
      for (let i = 0; i < NODE_COUNT; i++) {
        for (let j = i + 1; j < NODE_COUNT; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            const alpha = 0.3 * (1 - dist / CONNECTION_DIST);
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(100, 170, 255, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      // Nodes
      nodes.forEach(n => {
        const pulse = 0.4 + 0.4 * Math.abs(Math.sin(n.pulse));
        // Glow
        const glow = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.radius * 4);
        glow.addColorStop(0, `rgba(120, 190, 255, ${pulse * 0.4})`);
        glow.addColorStop(1, 'rgba(120, 190, 255, 0)');
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius * 4, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();
        // Core dot
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(160, 210, 255, ${pulse})`;
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };

    resize();
    initNodes();
    animate();

    const handleResize = () => { resize(); initNodes(); };
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

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { dark } = useTheme();

  useEffect(() => {
    api.get('/students/stats')
      .then(res => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const deptData  = stats ? Object.entries(stats.byDepartment).map(([name, value]) => ({ name, value })) : [];
  const roundData = stats ? Object.entries(stats.byRound).map(([name, value]) => ({ name, value })) : [];
  const stageData = stats ? Object.entries(stats.byStage).map(([k, v]) => ({ name: STAGE_NAMES[k] || `Stage ${k}`, value: v })) : [];
  const statusData = stats ? [
    { name: 'Completed',   value: stats.completed  },
    { name: 'In Progress', value: stats.inProgress },
    { name: 'Help Desk',   value: stats.helpDesk   },
  ] : [];

  const textColor = dark ? '#94a3b8' : '#64748b';

  // Glass card style applied to every chart / KPI panel
  const glass = {
    background: dark ? 'rgba(15,23,42,0.65)' : 'rgba(255,255,255,0.55)',
    backdropFilter: 'blur(14px)',
    WebkitBackdropFilter: 'blur(14px)',
    border: dark ? '1px solid rgba(100,160,255,0.15)' : '1px solid rgba(100,160,255,0.2)',
    borderRadius: '16px',
  };

  const tooltipStyle = {
    background: dark ? '#1e293b' : '#fff',
    border: 'none',
    borderRadius: '12px',
  };

  return (
    <div
      className="flex min-h-screen"
      style={{ background: dark ? '#080f1e' : '#0d1a35', position: 'relative' }}
    >
      {/* Particle canvas behind everything */}
      <ParticleNetwork />

      <AdminSidebar />

      <main className="flex-1 p-8 overflow-auto" style={{ position: 'relative', zIndex: 1 }}>
        <div className="fade-in">
          <h1 className="font-display text-2xl font-bold text-white mb-1">Admin Dashboard</h1>
          <p className="text-slate-400 mb-8">Real-time overview of all admissions</p>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Total Registered', value: stats?.total      || 0, icon: '🎓', accent: '#3b82f6' },
                  { label: 'Completed',         value: stats?.completed  || 0, icon: '✅', accent: '#10b981' },
                  { label: 'In Progress',       value: stats?.inProgress || 0, icon: '⏳', accent: '#f59e0b' },
                  { label: 'Help Desk',         value: stats?.helpDesk   || 0, icon: '🆘', accent: '#ef4444' },
                ].map(kpi => (
                  <div key={kpi.label} style={{ ...glass, padding: '20px' }}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl">{kpi.icon}</span>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: kpi.accent, display: 'inline-block', boxShadow: `0 0 6px ${kpi.accent}` }} />
                    </div>
                    <p className="text-3xl font-bold text-white">{kpi.value}</p>
                    <p className="text-sm text-slate-400 mt-1">{kpi.label}</p>
                  </div>
                ))}
              </div>

              {/* Charts Row 1 */}
              <div className="grid lg:grid-cols-2 gap-6 mb-6">
                <div style={{ ...glass, padding: '24px' }}>
                  <h2 className="font-semibold text-white mb-4">Department-wise Students</h2>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={deptData}>
                      <XAxis dataKey="name" tick={{ fill: textColor, fontSize: 12 }} />
                      <YAxis tick={{ fill: textColor, fontSize: 12 }} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div style={{ ...glass, padding: '24px' }}>
                  <h2 className="font-semibold text-white mb-4">Admission Status</h2>
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%" cy="50%"
                        outerRadius={90}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {statusData.map((_, i) => (
                          <Cell key={i} fill={['#10b981', '#3b82f6', '#f59e0b'][i]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Charts Row 2 */}
              <div className="grid lg:grid-cols-2 gap-6">
                <div style={{ ...glass, padding: '24px' }}>
                  <h2 className="font-semibold text-white mb-4">Round-wise Distribution</h2>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={roundData}>
                      <XAxis dataKey="name" tick={{ fill: textColor, fontSize: 11 }} />
                      <YAxis tick={{ fill: textColor, fontSize: 12 }} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div style={{ ...glass, padding: '24px' }}>
                  <h2 className="font-semibold text-white mb-4">Students by Stage</h2>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={stageData}>
                      <XAxis dataKey="name" tick={{ fill: textColor, fontSize: 10 }} />
                      <YAxis tick={{ fill: textColor, fontSize: 12 }} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
