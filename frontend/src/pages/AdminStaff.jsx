import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import AdminSidebar from '../components/shared/AdminSidebar';

const STAGE_NAMES = { 1: 'Document Verification', 2: 'Certificate Verification', 3: 'Online Verification', 4: 'Photo Capture', 5: 'Admission Completion' };

export default function AdminStaff() {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [msg, setMsg] = useState('');
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const load = () => {
    api.get('/staff').then(res => setStaffList(res.data || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const onSubmit = async (data) => {
    try {
      if (editing) {
        await api.put(`/staff/${editing.uid}`, data);
        setMsg('✅ Staff updated');
      } else {
        await api.post('/staff', data);
        setMsg('✅ Staff account created');
      }
      reset(); setShowForm(false); setEditing(null); load();
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg(`❌ ${err.response?.data?.message || 'Failed'}`);
      setTimeout(() => setMsg(''), 3000);
    }
  };

  const toggle = async (id, name, isActive) => {
    try {
      await api.patch(`/staff/${id}/toggle`);
      setMsg(`✅ ${name} ${isActive ? 'disabled' : 'enabled'}`);
      load();
      setTimeout(() => setMsg(''), 3000);
    } catch { setMsg('❌ Failed'); setTimeout(() => setMsg(''), 3000); }
  };

  const startEdit = (s) => {
    setEditing(s);
    reset({ name: s.name, username: s.username, stage: s.stage });
    setShowForm(true);
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-slate-50 dark:bg-slate-900 p-8 overflow-auto">
        <div className="fade-in">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div>
              <h1 className="font-display text-2xl font-bold text-slate-800 dark:text-white">Staff Accounts</h1>
              <p className="text-slate-500 text-sm">{staffList.length} / 20 accounts created</p>
            </div>
            <button onClick={() => { setEditing(null); reset(); setShowForm(!showForm); }} className="btn-primary">
              {showForm ? '✕ Cancel' : '+ Create Staff'}
            </button>
          </div>

          {msg && <div className={`p-3 rounded-xl mb-4 text-sm ${msg.startsWith('✅') ? 'bg-green-50 dark:bg-green-900/20 text-green-700' : 'bg-red-50 dark:bg-red-900/20 text-red-600'}`}>{msg}</div>}

          {/* Form */}
          {showForm && (
            <div className="card p-6 mb-6 fade-in">
              <h2 className="font-semibold text-slate-800 dark:text-white mb-4">
                {editing ? `Edit: ${editing.name}` : 'Create New Staff Account'}
              </h2>
              <form onSubmit={handleSubmit(onSubmit)} className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Full Name *</label>
                  <input {...register('name', { required: 'Required' })} className="input" placeholder="Staff full name" />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="label">Username *</label>
                  <input {...register('username', { required: 'Required' })} className="input" placeholder="e.g. staff01" disabled={!!editing} />
                  {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
                </div>
                <div>
                  <label className="label">Password {editing ? '(leave blank to keep)' : '*'}</label>
                  <input type="password" {...register('password', { required: editing ? false : 'Required', minLength: { value: 6, message: 'Min 6 chars' } })} className="input" placeholder="Password" />
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                </div>
                <div>
                  <label className="label">Assigned Stage *</label>
                  <select {...register('stage', { required: 'Required' })} className="input">
                    <option value="">Select stage</option>
                    {Object.entries(STAGE_NAMES).map(([k, v]) => (
                      <option key={k} value={k}>Stage {k} — {v}</option>
                    ))}
                  </select>
                  {errors.stage && <p className="text-red-500 text-xs mt-1">{errors.stage.message}</p>}
                </div>
                <div className="sm:col-span-2">
                  <button type="submit" className="btn-primary">{editing ? 'Save Changes' : 'Create Account'}</button>
                </div>
              </form>
            </div>
          )}

          {/* Staff table */}
          <div className="card overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-16"><div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-700/50">
                    {['Name', 'Username', 'Stage', 'Status', 'Created', 'Actions'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-slate-500 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {staffList.map(s => (
                    <tr key={s.uid} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                      <td className="px-4 py-3 font-medium text-slate-800 dark:text-white">{s.name}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-500">{s.username}</td>
                      <td className="px-4 py-3">
                        <span className="badge-blue text-xs">Stage {s.stage} — {STAGE_NAMES[s.stage]}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${s.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'}`}>
                          {s.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{s.createdAt ? new Date(s.createdAt).toLocaleDateString('en-IN') : '-'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => startEdit(s)} className="text-xs text-blue-600 hover:underline">Edit</button>
                          <button onClick={() => toggle(s.uid, s.name, s.isActive)}
                            className={`text-xs ${s.isActive ? 'text-red-500 hover:underline' : 'text-green-600 hover:underline'}`}>
                            {s.isActive ? 'Disable' : 'Enable'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {!loading && staffList.length === 0 && (
              <div className="text-center py-12 text-slate-500">No staff accounts created yet. Create your first account above.</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
