import { useEffect, useState } from 'react';
import api from '../services/api';
import AdminSidebar from '../components/shared/AdminSidebar';

const DEPARTMENTS = [
  '',
  'BIO MEDICAL ENGINEERING',
  'CIVIL ENGINEERING',
  'CIVIL ENGINEERING TAMIL MEDIUM',
  'COMPUTER SCIENCE AND ENGINEERING',
  'ELECTRICAL AND ELECTRONICS ENGINEERING',
  'ELECTRONICS AND COMMUNICATION ENGINEERING',
  'ELECTRONICS ENGINEERING (VLSI DESIGN AND TECHNOLOGY)',
  'GEO INFORMATICS',
  'INDUSTRIAL ENGINEERING',
  'INFORMATION TECHNOLOGY (SS)',
  'MANUFACTURING ENGINEERING',
  'MATERIALS SCIENCE AND ENGINEERING',
  'MECHANICAL ENGINEERING',
  'MECHANICAL ENGINEERING TAMIL MEDIUM',
  'MINING ENGINEERING',
  'PRINTING AND PACKAGING TECHNOLOGY'
];
const ROUNDS = ['', 'Round 1','Round 1 Upward ', 'Round 2', 'Round 2 Upward '];
const STATUSES = ['', 'In Progress', 'Completed', 'Help Desk'];
const STAGE_NAMES = ['Registered', 'Document Verification', 'Certificate Verification', 'Online Verification', 'Photo Capture', 'Admission Completion', 'Completed'];

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ department: '', round: '', status: '', search: '' });
  const [selected, setSelected] = useState(null);
  const [advancing, setAdvancing] = useState(null);
  const [msg, setMsg] = useState('');

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
    api.get(`/students?${params}`)
      .then(res => { setStudents(res.data.students || []); setTotal(res.data.total || 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filters]);

  const advance = async (id) => {
    setAdvancing(id);
    try {
      const res = await api.post(`/students/${id}/advance`, {});
      setMsg(`✅ Student moved to Stage ${res.data.currentStage}`);
      load();
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg(`❌ ${err.response?.data?.message || 'Failed'}`);
      setTimeout(() => setMsg(''), 3000);
    } finally { setAdvancing(null); }
  };

  const exportCSV = () => {
    const header = 'Name,Application No,Department,Round,Token,Status,Stage,Mobile,Email,Registered\n';
    const rows = students.map(s =>
      `"${s.name}","${s.applicationNumber}","${s.department}","${s.round}","${s.token}","${s.admissionStatus}","${STAGE_NAMES[s.currentStage] || ''}","${s.mobile}","${s.email}","${s.registeredAt}"`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `admissions_${new Date().toISOString().slice(0,10)}.csv`; a.click();
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-slate-50 dark:bg-slate-900 overflow-auto">
        <div className="p-8 fade-in">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div>
              <h1 className="font-display text-2xl font-bold text-slate-800 dark:text-white">Students</h1>
              <p className="text-slate-500 text-sm">{total} total records</p>
            </div>
            <button onClick={exportCSV} className="btn-secondary text-sm">📥 Export CSV</button>
          </div>

          {msg && <div className={`p-3 rounded-xl mb-4 text-sm ${msg.startsWith('✅') ? 'bg-green-50 dark:bg-green-900/20 text-green-700' : 'bg-red-50 dark:bg-red-900/20 text-red-600'}`}>{msg}</div>}

          {/* Filters */}
          <div className="card p-4 mb-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <input value={filters.search} onChange={e => setFilters(f => ({...f, search: e.target.value}))}
                className="input" placeholder="🔍 Search..." />
              <select value={filters.department} onChange={e => setFilters(f => ({...f, department: e.target.value}))} className="input">
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d || 'All Departments'}</option>)}
              </select>
              <select value={filters.round} onChange={e => setFilters(f => ({...f, round: e.target.value}))} className="input">
                {ROUNDS.map(r => <option key={r} value={r}>{r || 'All Rounds'}</option>)}
              </select>
              <select value={filters.status} onChange={e => setFilters(f => ({...f, status: e.target.value}))} className="input">
                {STATUSES.map(s => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="card overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-16"><div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-700/50">
                      {['Name', 'App. No.', 'Dept', 'Round', 'Token', 'Stage', 'Status', 'Mobile', 'Actions'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-slate-500 font-medium whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {students.map(s => (
                      <tr key={s.uid} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                        <td className="px-4 py-3 font-medium text-slate-800 dark:text-white whitespace-nowrap">{s.name}</td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-500">{s.applicationNumber}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{s.department}</td>
                        <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{s.round}</td>
                        <td className="px-4 py-3"><span className="badge-blue font-mono text-xs">{s.token}</span></td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300 text-xs whitespace-nowrap">{STAGE_NAMES[s.currentStage] || '-'}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                            s.admissionStatus === 'Completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' :
                            s.admissionStatus === 'Help Desk' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400' :
                            'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'
                          }`}>{s.admissionStatus}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-500">{s.mobile}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button onClick={() => setSelected(s)} className="text-xs text-blue-600 hover:underline">View</button>
                            {s.currentStage > 0 && s.currentStage < 6 && (
                              <button onClick={() => advance(s.uid)} disabled={advancing === s.uid}
                                className="btn-primary text-xs py-1 px-2">
                                {advancing === s.uid ? '...' : 'Advance'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {students.length === 0 && (
                  <div className="text-center py-12 text-slate-500">No students found matching your filters.</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Detail Modal */}
        {selected && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
            <div className="card p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl font-bold text-slate-800 dark:text-white">Student Details</h2>
                <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600 text-xl">×</button>
              </div>
              <div className="space-y-3 text-sm">
                {[
                  ['Name', selected.name], ['Application No.', selected.applicationNumber],
                  ['Department', selected.department], ['Round', selected.round],
                  ['Category', selected.allotmentCategory], ['Token', selected.token],
                  ['Mobile', selected.mobile], ['Email', selected.email],
                  ['Status', selected.admissionStatus], ['Current Stage', STAGE_NAMES[selected.currentStage]],
                  ['Online Admission Done', selected.onlineAdmissionDone ? 'Yes' : 'No'],
                  ['Semester Fee Paid', selected.semesterFeePaid ? 'Yes' : 'No'],
                  ['Registered At', selected.registeredAt ? new Date(selected.registeredAt).toLocaleString('en-IN') : '-'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-700">
                    <span className="text-slate-500">{k}</span>
                    <span className="font-medium text-slate-800 dark:text-white">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
