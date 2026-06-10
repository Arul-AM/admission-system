import { Link } from 'react-router-dom';
import Navbar from '../components/shared/Navbar';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { user } = useAuth();

  const dashboardLink = user?.role === 'admin' ? '/admin'
    : user?.role === 'staff' ? '/staff/dashboard'
    : user?.role === 'student' ? '/student/dashboard'
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-16 sm:py-24">
        {/* Hero */}
        <div className="text-center mb-16 fade-in">
          <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
            Admission 2026 – Now Open
          </div>
          <h1 className="font-display text-4xl sm:text-6xl font-bold text-slate-900 dark:text-white mb-4 leading-tight">
            Anna University<br />
            <span className="text-blue-600">Admission Portal</span>
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto mb-10">
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
            { label: 'Departments', value: '7+', icon: '🏛️' },
            { label: 'Admission Rounds', value: '3', icon: '📅' },
            { label: 'Workflow Stages', value: '5', icon: '🔄' },
            { label: 'Real-time SMS', value: '✓', icon: '📱' },
          ].map(s => (
            <div key={s.label} className="card p-5 text-center">
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className="text-2xl font-bold text-blue-600 mb-1">{s.value}</div>
              <div className="text-sm text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Workflow */}
        <div className="card p-8 mb-10">
          <h2 className="font-display text-2xl font-bold text-slate-800 dark:text-white mb-6 text-center">Admission Workflow</h2>
          <div className="grid sm:grid-cols-5 gap-4">
            {[
              { stage: 1, label: 'Document Verification', icon: '📄' },
              { stage: 2, label: 'Certificate Verification', icon: '🏆' },
              { stage: 3, label: 'Online Verification', icon: '🌐' },
              { stage: 4, label: 'Photo Capture', icon: '📸' },
              { stage: 5, label: 'Admission Completion', icon: '🎓' },
            ].map((s, i, arr) => (
              <div key={s.stage} className="flex sm:flex-col items-center gap-3 sm:gap-2">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-xl flex-shrink-0">{s.icon}</div>
                <div className="sm:text-center">
                  <div className="text-xs font-semibold text-blue-600 mb-0.5">Stage {s.stage}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-300">{s.label}</div>
                </div>
                {i < arr.length - 1 && <div className="hidden sm:block text-slate-300 text-2xl mx-auto">→</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Portal cards */}
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { title: 'Students', desc: 'Register and track your admission progress in real-time', links: [{ to: '/register', label: 'Register Now' }, { to: '/student-login', label: 'Login' }], color: 'blue' },
            { title: 'Staff', desc: 'Manage admission stages, verify documents and update status', links: [{ to: '/login', label: 'Staff Login' }], color: 'green' },
            { title: 'Admin', desc: 'Full control: manage staff, reports, SMS, and analytics', links: [{ to: '/login', label: 'Admin Login' }], color: 'purple' },
          ].map(card => (
            <div key={card.title} className="card p-6">
              <h3 className="font-semibold text-lg text-slate-800 dark:text-white mb-2">{card.title} Portal</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{card.desc}</p>
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
  );
}
