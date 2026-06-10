import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import api from '../services/api';
import AdminSidebar from '../components/shared/AdminSidebar';
import { useTheme } from '../context/ThemeContext';

const STAGE_NAMES = { 0: 'Registered', 1: 'Doc Verify', 2: 'Cert Verify', 3: 'Online Verify', 4: 'Photo', 5: 'Completion', 6: 'Completed' };
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

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

  const deptData = stats ? Object.entries(stats.byDepartment).map(([name, value]) => ({ name, value })) : [];
  const roundData = stats ? Object.entries(stats.byRound).map(([name, value]) => ({ name, value })) : [];
  const stageData = stats ? Object.entries(stats.byStage).map(([k, v]) => ({ name: STAGE_NAMES[k] || `Stage ${k}`, value: v })) : [];

  const statusData = stats ? [
    { name: 'Completed', value: stats.completed },
    { name: 'In Progress', value: stats.inProgress },
    { name: 'Help Desk', value: stats.helpDesk },
  ] : [];

  const textColor = dark ? '#94a3b8' : '#64748b';
  const gridColor = dark ? '#334155' : '#e2e8f0';

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-slate-50 dark:bg-slate-900 p-8 overflow-auto">
        <div className="fade-in">
          <h1 className="font-display text-2xl font-bold text-slate-800 dark:text-white mb-2">Admin Dashboard</h1>
          <p className="text-slate-500 mb-8">Real-time overview of all admissions</p>

          {loading ? (
            <div className="flex items-center justify-center py-24"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Total Registered', value: stats?.total || 0, icon: '🎓', color: 'blue' },
                  { label: 'Completed', value: stats?.completed || 0, icon: '✅', color: 'green' },
                  { label: 'In Progress', value: stats?.inProgress || 0, icon: '⏳', color: 'amber' },
                  { label: 'Help Desk', value: stats?.helpDesk || 0, icon: '🆘', color: 'red' },
                ].map(kpi => (
                  <div key={kpi.label} className="card p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl">{kpi.icon}</span>
                      <span className={`badge-${kpi.color === 'green' ? 'green' : kpi.color === 'amber' ? 'yellow' : kpi.color === 'red' ? 'red' : 'blue'} text-xs`}>
                        {kpi.color}
                      </span>
                    </div>
                    <p className="text-3xl font-bold text-slate-800 dark:text-white">{kpi.value}</p>
                    <p className="text-sm text-slate-500 mt-1">{kpi.label}</p>
                  </div>
                ))}
              </div>

              {/* Charts Row 1 */}
              <div className="grid lg:grid-cols-2 gap-6 mb-6">
                <div className="card p-6">
                  <h2 className="font-semibold text-slate-800 dark:text-white mb-4">Department-wise Students</h2>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={deptData}>
                      <XAxis dataKey="name" tick={{ fill: textColor, fontSize: 12 }} />
                      <YAxis tick={{ fill: textColor, fontSize: 12 }} />
                      <Tooltip contentStyle={{ background: dark ? '#1e293b' : '#fff', border: 'none', borderRadius: '12px' }} />
                      <Bar dataKey="value" fill="#3b82f6" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="card p-6">
                  <h2 className="font-semibold text-slate-800 dark:text-white mb-4">Admission Status</h2>
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={statusData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                        {statusData.map((_, i) => <Cell key={i} fill={['#10b981','#3b82f6','#f59e0b'][i]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: dark ? '#1e293b' : '#fff', border: 'none', borderRadius: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Charts Row 2 */}
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="card p-6">
                  <h2 className="font-semibold text-slate-800 dark:text-white mb-4">Round-wise Distribution</h2>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={roundData}>
                      <XAxis dataKey="name" tick={{ fill: textColor, fontSize: 11 }} />
                      <YAxis tick={{ fill: textColor, fontSize: 12 }} />
                      <Tooltip contentStyle={{ background: dark ? '#1e293b' : '#fff', border: 'none', borderRadius: '12px' }} />
                      <Bar dataKey="value" fill="#8b5cf6" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="card p-6">
                  <h2 className="font-semibold text-slate-800 dark:text-white mb-4">Students by Stage</h2>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={stageData}>
                      <XAxis dataKey="name" tick={{ fill: textColor, fontSize: 10 }} />
                      <YAxis tick={{ fill: textColor, fontSize: 12 }} />
                      <Tooltip contentStyle={{ background: dark ? '#1e293b' : '#fff', border: 'none', borderRadius: '12px' }} />
                      <Bar dataKey="value" fill="#10b981" radius={[4,4,0,0]} />
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
