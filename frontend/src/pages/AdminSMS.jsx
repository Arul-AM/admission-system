import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import AdminSidebar from '../components/shared/AdminSidebar';

export default function AdminSMS() {
  const [logs, setLogs] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('sms');
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState('');
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    Promise.all([
      api.get('/notifications/sms-logs'),
      api.get('/notifications/audit-logs'),
    ]).then(([s, a]) => {
      setLogs(s.data || []);
      setAuditLogs(a.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const sendSMS = async (data) => {
    setSending(true);
    try {
      await api.post('/notifications/send-sms', data);
      setMsg('✅ SMS sent successfully');
      reset();
    } catch (err) {
      setMsg(`❌ ${err.response?.data?.message || 'Failed to send'}`);
    } finally {
      setSending(false);
      setTimeout(() => setMsg(''), 3000);
    }
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-slate-50 dark:bg-slate-900 p-8 overflow-auto">
        <div className="fade-in">
          <h1 className="font-display text-2xl font-bold text-slate-800 dark:text-white mb-2">SMS & Audit Logs</h1>
          <p className="text-slate-500 mb-6">Manage notifications and view system audit trail</p>

          {/* Manual SMS */}
          <div className="card p-6 mb-6">
            <h2 className="font-semibold text-slate-800 dark:text-white mb-4">Send Manual SMS</h2>
            {msg && <div className={`p-3 rounded-xl mb-4 text-sm ${msg.startsWith('✅') ? 'bg-green-50 dark:bg-green-900/20 text-green-700' : 'bg-red-50 dark:bg-red-900/20 text-red-600'}`}>{msg}</div>}
            <form onSubmit={handleSubmit(sendSMS)} className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="label">Mobile Number *</label>
                <input {...register('mobile', { required: 'Required', pattern: { value: /^[6-9]\d{9}$/, message: 'Invalid mobile' } })}
                  className="input" placeholder="10-digit number" maxLength={10} />
                {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile.message}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className="label">Message *</label>
                <input {...register('message', { required: 'Required' })} className="input" placeholder="Enter SMS message..." />
                {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
              </div>
              <div>
                <button type="submit" disabled={sending} className="btn-primary w-full">
                  {sending ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Sending...</span> : '📱 Send SMS'}
                </button>
              </div>
            </form>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-4 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
            {[['sms', '📱 SMS Logs'], ['audit', '📋 Audit Logs']].map(([key, label]) => (
              <button key={key} onClick={() => setTab(key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === key ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                {label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16"><div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : (
            <div className="card overflow-hidden">
              {tab === 'sms' ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-700/50">
                        {['Mobile', 'Type', 'Message', 'Status', 'Sent At'].map(h => (
                          <th key={h} className="text-left px-4 py-3 text-slate-500 font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                      {logs.map(log => (
                        <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                          <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-300">{log.mobile}</td>
                          <td className="px-4 py-3"><span className="badge-blue text-xs">{log.type}</span></td>
                          <td className="px-4 py-3 text-slate-500 text-xs max-w-xs truncate">{log.message}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-1 rounded-full font-semibold ${log.status === 'sent' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {log.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-400 text-xs">{new Date(log.sentAt).toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {logs.length === 0 && <div className="text-center py-12 text-slate-500">No SMS logs yet.</div>}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-700/50">
                        {['User ID', 'Role', 'Action', 'Timestamp'].map(h => (
                          <th key={h} className="text-left px-4 py-3 text-slate-500 font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                      {auditLogs.map(log => (
                        <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                          <td className="px-4 py-3 font-mono text-xs text-slate-500 truncate max-w-32">{log.userId}</td>
                          <td className="px-4 py-3"><span className="badge-blue text-xs capitalize">{log.role}</span></td>
                          <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200 text-xs">{log.action}</td>
                          <td className="px-4 py-3 text-slate-400 text-xs">{new Date(log.timestamp).toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {auditLogs.length === 0 && <div className="text-center py-12 text-slate-500">No audit logs yet.</div>}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
