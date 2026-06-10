import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Navbar from '../components/shared/Navbar';

const STAGE_NAMES = ['Registered', 'Document Verification', 'Certificate Verification', 'Online Verification', 'Photo Capture', 'Admission Completion', 'Completed'];

export default function StaffDashboard() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [advancing, setAdvancing] = useState(null);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');

  const staffStage = user?.stage;

  const loadStudents = () => {
  console.log("================================");
  console.log("USER:", user);
  console.log("STAFF STAGE:", staffStage);
  console.log("REQUEST URL:", `/students?stage=${staffStage}`);

  setLoading(true);

  api.get(`/students?stage=${staffStage}`)
    .then(res => {
      console.log("API RESPONSE:", res.data);
      console.log("STUDENTS:", res.data.students);
      setStudents(res.data.students || []);
    })
    .catch(err => {
      console.log("API ERROR:", err.response?.data || err);
    })
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="fade-in">
          {/* Header */}
          <div className="card p-6 mb-6 bg-gradient-to-r from-slate-800 to-slate-900 text-white border-0">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-slate-400 text-sm">Staff Dashboard</p>
                <h1 className="font-display text-2xl font-bold">{user?.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="badge-blue text-xs">Stage {staffStage}</span>
                  <span className="text-slate-400 text-sm">{STAGE_NAMES[staffStage]}</span>
                </div>
              </div>
              <div className="bg-white/10 rounded-xl px-4 py-3 text-center">
                <p className="text-slate-400 text-xs">Students Pending</p>
                <p className="text-3xl font-bold">{students.length}</p>
              </div>
            </div>
          </div>

          {message && (
            <div className={`p-4 rounded-xl mb-4 text-sm font-medium ${message.startsWith('✅') ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'}`}>
              {message}
            </div>
          )}

          {/* Workflow info */}
          <div className="card p-4 mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>🔒 Your Access:</strong> You can only view and process students at <strong>Stage {staffStage} — {STAGE_NAMES[staffStage]}</strong>. Students are strictly sequential and cannot skip stages.
            </p>
          </div>

          {/* Search */}
          <div className="mb-4">
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              className="input max-w-md" placeholder="🔍 Search by name, application number, or token..."
            />
          </div>

          {/* Table */}
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700">
              <h2 className="font-semibold text-slate-800 dark:text-white">
                Students at Stage {staffStage} — {STAGE_NAMES[staffStage]}
              </h2>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">🎯</div>
                <p className="text-slate-500">No students pending at this stage.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-700/50">
                      <th className="text-left px-4 py-3 text-slate-500 font-medium">Name</th>
                      <th className="text-left px-4 py-3 text-slate-500 font-medium">App. No.</th>
                      <th className="text-left px-4 py-3 text-slate-500 font-medium">Token</th>
                      <th className="text-left px-4 py-3 text-slate-500 font-medium">Dept</th>
                      <th className="text-left px-4 py-3 text-slate-500 font-medium">Round</th>
                      <th className="text-left px-4 py-3 text-slate-500 font-medium">Mobile</th>
                      <th className="text-left px-4 py-3 text-slate-500 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {filtered.map(s => (
                      <tr key={s.uid} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                        <td className="px-4 py-3 font-medium text-slate-800 dark:text-white">{s.name}</td>
                        <td className="px-4 py-3 text-slate-500 font-mono text-xs">{s.applicationNumber}</td>
                        <td className="px-4 py-3"><span className="badge-blue font-mono">{s.token}</span></td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{s.department}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300 text-xs">{s.round}</td>
                        <td className="px-4 py-3 text-slate-500">{s.mobile}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => advanceStudent(s.uid, s.name)}
                            disabled={advancing === s.uid}
                            className="btn-primary text-xs py-1.5 px-3"
                          >
                            {advancing === s.uid
                              ? <span className="flex items-center gap-1"><span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"/>Processing</span>
                              : `Move to Stage ${staffStage + 1} →`}
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
  );
}
