import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  const dashboardLink = user?.role === 'admin' ? '/admin'
    : user?.role === 'staff' ? '/staff/dashboard'
    : '/student/dashboard';

  return (
    <nav className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">CEG</span>
          </div>
          <div className="hidden sm:block">
            <p className="font-display text-base font-bold text-blue-900 dark:text-blue-100 leading-none">Anna University</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Admission Process Portal</p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <button onClick={toggle} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors" aria-label="Toggle theme">
            {dark ? '☀️' : '🌙'}
          </button>
          {user ? (
            <div className="flex items-center gap-3">
              <Link to={dashboardLink} className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors">
                Dashboard
              </Link>
              <div className="hidden sm:flex items-center gap-2 bg-slate-50 dark:bg-slate-700 px-3 py-1.5 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{user.name}</span>
                <span className="text-xs text-slate-400 capitalize">({user.role})</span>
              </div>
              <button onClick={handleLogout} className="btn-secondary text-sm py-1.5 px-3">Logout</button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/student-login" className="btn-secondary text-sm py-1.5 px-3">Student Login</Link>
              <Link to="/login" className="btn-primary text-sm py-1.5 px-3">Staff Login</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
