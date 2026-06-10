import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Navbar from '../components/shared/Navbar';
import StageProgress from '../components/shared/StageProgress';

const STAGE_NAMES = ['Registered', 'Document Verification', 'Certificate Verification', 'Online Verification', 'Photo Capture', 'Admission Completion', 'Completed'];
const STATUS_COLORS = { 'Completed': 'badge-green', 'In Progress': 'badge-blue', 'Help Desk': 'badge-yellow' };

export default function StudentDashboard() {
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/students/me')
      .then(res => setStudent(res.data))
      .catch(() => setError('Failed to load your profile. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar />
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center"><p className="text-red-500 mb-4">{error}</p></div>
      </div>
    </div>
  );

  const currentStage = student?.currentStage || 0;
  const nextStage = currentStage < 6 ? currentStage + 1 : null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="fade-in">
          {/* Header */}
          <div className="card p-6 mb-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <p className="text-blue-200 text-sm mb-1">Welcome back</p>
                <h1 className="font-display text-2xl font-bold">{student?.name}</h1>
                <p className="text-blue-200 text-sm mt-1">Application No: {student?.applicationNumber}</p>
              </div>
              <div className="text-right">
                <div className="bg-white/20 rounded-xl px-4 py-2">
                  <p className="text-xs text-blue-200 mb-1">Token Number</p>
                  <p className="font-mono font-bold text-xl">{student?.token}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Department', value: student?.department },
              { label: 'Round', value: student?.round },
              { label: 'Category', value: student?.allotmentCategory },
              { label: 'Registered', value: student?.registeredAt ? new Date(student.registeredAt).toLocaleDateString('en-IN') : '-' },
            ].map(item => (
              <div key={item.label} className="card p-4">
                <p className="text-xs text-slate-500 mb-1">{item.label}</p>
                <p className="font-semibold text-slate-800 dark:text-white text-sm">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Status */}
          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            <div className="card p-4">
              <p className="text-xs text-slate-500 mb-2">Admission Status</p>
              <span className={STATUS_COLORS[student?.admissionStatus] || 'badge-blue'}>
                {student?.admissionStatus}
              </span>
            </div>
            <div className="card p-4">
              <p className="text-xs text-slate-500 mb-2">Current Stage</p>
              <p className="font-semibold text-slate-800 dark:text-white text-sm">
                {currentStage === 0 ? 'Awaiting Process' : STAGE_NAMES[currentStage]}
              </p>
            </div>
            <div className="card p-4">
              <p className="text-xs text-slate-500 mb-2">Next Stage</p>
              <p className="font-semibold text-slate-800 dark:text-white text-sm">
                {currentStage >= 6 ? '🎉 Completed!' : nextStage ? STAGE_NAMES[nextStage] : '-'}
              </p>
            </div>
          </div>

          {/* Help Desk warning */}
          {student?.tokenType === 'helpdesk' && (
            <div className="card p-5 mb-6 border-l-4 border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20">
              <p className="font-semibold text-yellow-800 dark:text-yellow-300 mb-1">⚠️ Help Desk Required</p>
              <p className="text-sm text-yellow-700 dark:text-yellow-400">{student.helpDeskReason}</p>
              <p className="text-sm font-mono font-bold text-yellow-800 dark:text-yellow-300 mt-2">Token: {student.token}</p>
            </div>
          )}

          {/* Progress Tracker */}
          {student?.tokenType !== 'helpdesk' && (
            <div className="card p-6 mb-6">
              <h2 className="font-semibold text-slate-800 dark:text-white mb-6">Admission Progress</h2>
              <StageProgress currentStage={currentStage} />
            </div>
          )}

          {/* Stage History */}
          {student?.stageHistory?.length > 0 && (
            <div className="card p-6 mb-6">
              <h2 className="font-semibold text-slate-800 dark:text-white mb-4">Stage History</h2>
              <div className="space-y-3">
                {student.stageHistory.map((h, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">{h.stage}</div>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-slate-800 dark:text-white">{h.name}</p>
                      <p className="text-xs text-slate-400">{new Date(h.timestamp).toLocaleString('en-IN')}</p>
                    </div>
                    <span className="badge-green text-xs">✓ Done</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed */}
          {currentStage >= 6 && (
            <div className="card p-6 text-center bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
              <div className="text-5xl mb-3">🎓</div>
              <h2 className="font-display text-2xl font-bold text-green-700 dark:text-green-400 mb-2">Congratulations!</h2>
              <p className="text-green-600 dark:text-green-400">Your admission has been successfully completed. Welcome to Anna University!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
