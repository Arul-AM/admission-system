import { useEffect, useState } from 'react';
import api from '../services/api';
import AdminSidebar from '../components/shared/AdminSidebar';

const STAGE_NAMES = ['Registered', 'Document Verification', 'Certificate Verification', 'Online Verification', 'Photo Capture', 'Admission Completion', 'Completed'];

export default function AdminReports() {
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/students?limit=1000'),
      api.get('/students/stats'),
    ]).then(([s, st]) => {
      setStudents(s.data.students || []);
      setStats(st.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const exportCSV = (data, filename) => {
    const header = 'Name,Application No,Department,Round,Token,Status,Stage,Mobile,Email,Registered\n';
    const rows = data.map(s =>
      `"${s.name}","${s.applicationNumber}","${s.department}","${s.round}","${s.token}","${s.admissionStatus}","${STAGE_NAMES[s.currentStage] || ''}","${s.mobile}","${s.email}","${s.registeredAt || ''}"`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${filename}_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  const reports = [
    { title: 'All Students Report', desc: 'Complete list of all registered students', icon: '📋', data: students, filename: 'all_students' },
    { title: 'Completed Admissions', desc: 'Students who have completed all stages', icon: '✅', data: students.filter(s => s.admissionStatus === 'Completed'), filename: 'completed_admissions' },
    { title: 'Pending Admissions', desc: 'Students currently in progress', icon: '⏳', data: students.filter(s => s.admissionStatus === 'In Progress'), filename: 'pending_admissions' },
    { title: 'Help Desk Cases', desc: 'Students directed to help desk', icon: '🆘', data: students.filter(s => s.admissionStatus === 'Help Desk'), filename: 'helpdesk_cases' },
    { title: 'Round 1 Students', desc: 'All Round 1 admission students', icon: '1️⃣', data: students.filter(s => s.round === 'Round 1'), filename: 'round1_students' },
    { title: 'Round 2 Students', desc: 'All Round 2 admission students', icon: '2️⃣', data: students.filter(s => s.round === 'Round 2'), filename: 'round2_students' },
    { title: 'Upward Movement', desc: 'All Upward Movement students', icon: '⬆️', data: students.filter(s => s.round === 'Upward Movement'), filename: 'upward_movement' },
  ];

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-slate-50 dark:bg-slate-900 p-8 overflow-auto">
        <div className="fade-in">
          <h1 className="font-display text-2xl font-bold text-slate-800 dark:text-white mb-2">Reports & Exports</h1>
          <p className="text-slate-500 mb-8">Download admission data in CSV format</p>

          {loading ? (
            <div className="flex items-center justify-center py-24"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : (
            <>
              {/* Summary cards */}
              {stats && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                  {[
                    { label: 'Total', value: stats.total, icon: '🎓' },
                    { label: 'Completed', value: stats.completed, icon: '✅' },
                    { label: 'In Progress', value: stats.inProgress, icon: '⏳' },
                    { label: 'Help Desk', value: stats.helpDesk, icon: '🆘' },
                  ].map(s => (
                    <div key={s.label} className="card p-4 text-center">
                      <div className="text-2xl mb-1">{s.icon}</div>
                      <div className="text-2xl font-bold text-slate-800 dark:text-white">{s.value}</div>
                      <div className="text-xs text-slate-500">{s.label}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Report cards */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {reports.map(r => (
                  <div key={r.title} className="card p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{r.icon}</span>
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-white text-sm">{r.title}</p>
                        <p className="text-xs text-slate-400">{r.data.length} records</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mb-4">{r.desc}</p>
                    <button
                      onClick={() => exportCSV(r.data, r.filename)}
                      disabled={r.data.length === 0}
                      className="btn-secondary w-full text-sm py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      📥 Export CSV
                    </button>
                  </div>
                ))}
              </div>

              {/* Department-wise breakdown */}
              {stats?.byDepartment && (
                <div className="card p-6 mb-6">
                  <h2 className="font-semibold text-slate-800 dark:text-white mb-4">Department-wise Breakdown</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-700/50">
                          <th className="text-left px-4 py-2 text-slate-500">Department</th>
                          <th className="text-left px-4 py-2 text-slate-500">Total Students</th>
                          <th className="text-left px-4 py-2 text-slate-500">Completed</th>
                          <th className="text-left px-4 py-2 text-slate-500">In Progress</th>
                          <th className="text-left px-4 py-2 text-slate-500">Export</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {Object.entries(stats.byDepartment).map(([dept, count]) => {
                          const deptStudents = students.filter(s => s.department === dept);
                          return (
                            <tr key={dept} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                              <td className="px-4 py-3 font-medium text-slate-800 dark:text-white">{dept}</td>
                              <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{count}</td>
                              <td className="px-4 py-3 text-green-600">{deptStudents.filter(s => s.admissionStatus === 'Completed').length}</td>
                              <td className="px-4 py-3 text-blue-600">{deptStudents.filter(s => s.admissionStatus === 'In Progress').length}</td>
                              <td className="px-4 py-3">
                                <button onClick={() => exportCSV(deptStudents, `${dept}_students`)} className="text-xs text-blue-600 hover:underline">CSV</button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
