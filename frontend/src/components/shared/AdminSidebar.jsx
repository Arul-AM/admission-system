import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: '📊', end: true },
  { to: '/admin/students', label: 'Students', icon: '🎓' },
  { to: '/admin/staff', label: 'Staff Accounts', icon: '👥' },
  { to: '/admin/reports', label: 'Reports', icon: '📋' },
  { to: '/admin/sms', label: 'SMS & Logs', icon: '💬' },
];

export default function AdminSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <aside className="w-64 min-h-screen bg-slate-900 dark:bg-slate-950 text-white flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-lg">AU</div>
          <div>
            <p className="font-display font-bold text-sm leading-none">Anna University</p>
            <p className="text-xs text-slate-400 mt-0.5">Admin Panel</p>
          </div>
        </div>
        <div className="mt-4 p-3 bg-slate-800 rounded-xl">
          <p className="text-sm font-semibold">{user?.name}</p>
          <p className="text-xs text-slate-400">Administrator</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(item => (
          <NavLink key={item.to} to={item.to} end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`
            }
          >
            <span>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <button onClick={() => { logout(); navigate('/'); }}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
          <span>🚪</span> Logout
        </button>
      </div>
    </aside>
  );
}
