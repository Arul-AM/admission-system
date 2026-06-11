import { Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import Navbar from '../components/shared/Navbar';
import { useAuth } from '../context/AuthContext';

function ParticleBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;
    let particles = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + Math.random() * 100;
        this.size = 1 + Math.random() * 3;
        this.speedY = 0.4 + Math.random() * 1.2;
        this.speedX = (Math.random() - 0.5) * 0.4;
        this.opacity = 0;
        this.maxOpacity = 0.3 + Math.random() * 0.5;
        this.fadeIn = true;
        this.life = 0;
        this.maxLife = canvas.height * (0.7 + Math.random() * 0.5);
        // Blue to cyan palette matching the app's theme
        const hue = 195 + Math.random() * 40;
        this.color = `hsla(${hue}, 85%, 70%, `;
      }

      update() {
        this.y -= this.speedY;
        this.x += this.speedX;
        this.life += this.speedY;

        if (this.fadeIn && this.opacity < this.maxOpacity) {
          this.opacity += 0.008;
        }

        const lifeRatio = this.life / this.maxLife;
        if (lifeRatio > 0.7) {
          this.opacity = this.maxOpacity * (1 - (lifeRatio - 0.7) / 0.3);
          this.fadeIn = false;
        }

        if (this.life >= this.maxLife || this.opacity <= 0) {
          this.reset();
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `${this.color}${this.opacity})`;
        ctx.fill();
      }
    }

    const init = () => {
      resize();
      particles = [];
      const count = Math.floor((canvas.width * canvas.height) / 8000);
      for (let i = 0; i < count; i++) {
        const p = new Particle();
        // Scatter initial positions across the canvas height
        p.y = Math.random() * canvas.height;
        p.life = Math.random() * p.maxLife * 0.6;
        p.opacity = Math.random() * p.maxOpacity;
        particles.push(p);
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      animationId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      init();
    };

    init();
    animate();

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
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    />
  );
}

export default function LandingPage() {
  const { user } = useAuth();

  const dashboardLink = user?.role === 'admin' ? '/admin'
    : user?.role === 'staff' ? '/staff/dashboard'
    : user?.role === 'student' ? '/student/dashboard'
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Particle canvas */}
      <ParticleBackground />

      {/* Subtle radial vignette so content stays readable */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 80% 60% at 50% 40%, transparent 40%, rgba(2,6,23,0.55) 100%)',
          pointerEvents: 'none',
        }}
      />

      <div className="relative z-10">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-16 sm:py-24">
          {/* Hero */}
          <div className="text-center mb-16 fade-in">
            <div className="inline-flex items-center gap-2 bg-blue-900/40 text-blue-300 border border-blue-700/40 px-4 py-1.5 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
              Admission 2026 – Now Open
            </div>
            <h1 className="font-display text-4xl sm:text-6xl font-bold text-white mb-4 leading-tight">
              Anna University<br />
              <span className="text-blue-400">Admission Portal</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-xl mx-auto mb-10">
              Streamlined admissions for College of Engineering, Guindy. Register, track your progress, and complete your admission — all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {dashboardLink ? (
                <Link to={dashboardLink} className="btn-primary text-base px-8 py-3">Go to Dashboard →</Link>
              ) : (
                <>
                  <Link to="/register" className="btn-primary text-base px-8 py-3">New Student Registration</Link>
                  <Link to="/student-login" className="btn-secondary text-base px-8 py-3">Student Login</Link>
                </>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16">
            {[
              { label: 'Departments', value: '11+', icon: '🏛️' },
              { label: 'Admission Rounds', value: '4', icon: '📅' },
              { label: 'Workflow Stages', value: '5', icon: '🔄' },
              { label: 'Real-time SMS', value: '✓', icon: '📱' },
            ].map(s => (
              <div key={s.label} className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5 text-center">
                <div className="text-3xl mb-2">{s.icon}</div>
                <div className="text-2xl font-bold text-blue-400 mb-1">{s.value}</div>
                <div className="text-sm text-slate-400">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Workflow */}
          <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8 mb-10">
            <h2 className="font-display text-2xl font-bold text-white mb-6 text-center">Admission Workflow</h2>
            <div className="grid sm:grid-cols-5 gap-4">
              {[
                { stage: 1, label: 'Document Verification', icon: '📄' },
                { stage: 2, label: 'Certificate Verification', icon: '🏆' },
                { stage: 3, label: 'Online Verification', icon: '🌐' },
                { stage: 4, label: 'Photo Capture', icon: '📸' },
                { stage: 5, label: 'Admission Completion', icon: '🎓' },
              ].map((s, i, arr) => (
                <div key={s.stage} className="flex sm:flex-col items-center gap-3 sm:gap-2">
                  <div className="w-12 h-12 bg-blue-900/40 border border-blue-700/30 rounded-xl flex items-center justify-center text-xl flex-shrink-0">{s.icon}</div>
                  <div className="sm:text-center">
                    <div className="text-xs font-semibold text-blue-400 mb-0.5">Stage {s.stage}</div>
                    <div className="text-sm text-slate-300">{s.label}</div>
                  </div>
                  {i < arr.length - 1 && <div className="hidden sm:block text-slate-600 text-2xl mx-auto">→</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Portal cards */}
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { title: 'Students', desc: 'Register and track your admission progress in real-time', links: [{ to: '/register', label: 'Register Now' }, { to: '/student-login', label: 'Login' }] },
              { title: 'Staff', desc: 'Manage admission stages, verify documents and update status', links: [{ to: '/login', label: 'Staff Login' }] },
              { title: 'Admin', desc: 'Full control: manage staff, reports, SMS, and analytics', links: [{ to: '/login', label: 'Admin Login' }] },
            ].map(card => (
              <div key={card.title} className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                <h3 className="font-semibold text-lg text-white mb-2">{card.title} Portal</h3>
                <p className="text-sm text-slate-400 mb-4">{card.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {card.links.map(l => (
                    <Link key={l.to} to={l.to} className="btn-primary text-sm py-1.5 px-4">{l.label}</Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
