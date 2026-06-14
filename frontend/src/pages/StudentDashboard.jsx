import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Navbar from '../components/shared/Navbar';

const STAGES = [
  { num: 1, name: 'Document Verification',   icon: '📄', counter: 'Counter A', color: 'blue'   },
  { num: 2, name: 'Certificate Verification', icon: '🏆', counter: 'Counter B', color: 'violet' },
  { num: 3, name: 'Online Verification',      icon: '🌐', counter: 'Counter C', color: 'cyan'   },
  { num: 4, name: 'Photo Capture',            icon: '📸', counter: 'Counter D', color: 'amber'  },
  { num: 5, name: 'Admission Completion',     icon: '✅', counter: 'Counter E', color: 'green'  },
];

const COLOR_MAP = {
  blue:   { bg: 'bg-blue-50 dark:bg-blue-900/20',   text: 'text-blue-600 dark:text-blue-400',   ring: 'ring-blue-200 dark:ring-blue-800',   dot: 'bg-blue-500'   },
  violet: { bg: 'bg-violet-50 dark:bg-violet-900/20', text: 'text-violet-600 dark:text-violet-400', ring: 'ring-violet-200 dark:ring-violet-800', dot: 'bg-violet-500' },
  cyan:   { bg: 'bg-cyan-50 dark:bg-cyan-900/20',   text: 'text-cyan-600 dark:text-cyan-400',   ring: 'ring-cyan-200 dark:ring-cyan-800',   dot: 'bg-cyan-500'   },
  amber:  { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400', ring: 'ring-amber-200 dark:ring-amber-800', dot: 'bg-amber-500'  },
  green:  { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400', ring: 'ring-green-200 dark:ring-green-800', dot: 'bg-green-500'  },
};

export default function StudentDashboard() {
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    api.get('/students/me')
      .then(res => setStudent(res.data))
      .catch(() => setError('Failed to load your profile. Please try again.'))
      .finally(() => setLoading(false));

    // Live clock
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 text-sm">Loading your admission details...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar />
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center card p-8 max-w-sm mx-4">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="text-red-500 font-medium mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-primary">Try Again</button>
        </div>
      </div>
    </div>
  );

  const currentStage = student?.currentStage || 0;
  const pct = currentStage >= 6 ? 100 : Math.round((currentStage / 5) * 100);
  const isCompleted = currentStage >= 6;
  const isHelpDesk = student?.tokenType === 'helpdesk';
  const currentStageInfo = STAGES.find(s => s.num === currentStage);
  const nextStageInfo = STAGES.find(s => s.num === currentStage + 1);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-5 fade-in">

        {/* ── Hero Banner ─────────────────────────────────────────────── */}
        {isCompleted ? (
          <div className="rounded-2xl p-8 text-center bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg">
            <div className="text-6xl mb-3">🎓</div>
            <h1 className="font-display text-3xl font-bold mb-1">Congratulations, {student?.name?.split(' ')[0]}!</h1>
            <p className="text-green-100 mb-4">Your admission to Anna University has been successfully completed.</p>
            <div className="inline-block bg-white/20 rounded-xl px-6 py-3">
              <p className="text-xs text-green-100 mb-1">Admission Token</p>
              <p className="font-mono font-bold text-2xl tracking-widest">{student?.token}</p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden shadow-lg">
            {/* Top gradient bar */}
            <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 p-6 text-white">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-blue-200 text-xs font-medium">ADMISSION IN PROGRESS</span>
                  </div>
                  <h1 className="font-display text-2xl sm:text-3xl font-bold">{student?.name}</h1>
                  <div className="flex flex-wrap gap-3 mt-2 text-sm text-blue-200">
                    <span>📋 {student?.applicationNumber}</span>
                    <span>🏛️ {student?.department}</span>
                    <span>📅 {student?.round}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="bg-white/15 backdrop-blur rounded-xl p-4 border border-white/20">
                    <p className="text-blue-200 text-xs mb-1 uppercase tracking-wider">Your Token</p>
                    <p className="font-mono font-bold text-2xl tracking-wider">{student?.token}</p>
                    <p className="text-blue-200 text-xs mt-1">{student?.allotmentCategory} · CEG</p>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-5">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-blue-200 text-xs">Admission Progress</span>
                  <span className="text-white font-bold text-sm">{pct}%</span>
                </div>
                <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-400 to-emerald-300 rounded-full transition-all duration-1000"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-blue-300 text-xs">Stage {currentStage} of 5</span>
                  <span className="text-blue-300 text-xs">
                    {now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Help Desk Alert ──────────────────────────────────────────── */}
        {isHelpDesk && (
          <div className="rounded-2xl p-5 bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-300 dark:border-amber-700">
            <div className="flex items-start gap-4">
              <div className="text-3xl">⚠️</div>
              <div className="flex-1">
                <h3 className="font-bold text-amber-800 dark:text-amber-300 text-lg mb-1">Help Desk Required</h3>
                <p className="text-amber-700 dark:text-amber-400 text-sm mb-3">{student?.helpDeskReason}</p>
                <div className="flex items-center gap-3">
                  <div className="bg-amber-100 dark:bg-amber-900/40 rounded-xl px-4 py-2">
                    <p className="text-xs text-amber-600 dark:text-amber-400 mb-0.5">Help Desk Token</p>
                    <p className="font-mono font-bold text-amber-800 dark:text-amber-300 text-lg">{student?.token}</p>
                  </div>
                  <p className="text-amber-600 dark:text-amber-400 text-sm">Please report to the Help Desk counter immediately.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Current & Next Stage Cards ───────────────────────────────── */}
        {!isHelpDesk && !isCompleted && (
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Current Stage */}
            <div className="card p-5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">📍 You Are Here</p>
              {currentStageInfo ? (
                <div className={`rounded-xl p-4 ${COLOR_MAP[currentStageInfo.color].bg} ring-2 ${COLOR_MAP[currentStageInfo.color].ring}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{currentStageInfo.icon}</span>
                    <div>
                      <p className={`font-bold ${COLOR_MAP[currentStageInfo.color].text}`}>{currentStageInfo.name}</p>
                      <p className="text-xs text-slate-500">{currentStageInfo.counter}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className={`w-2 h-2 rounded-full animate-pulse ${COLOR_MAP[currentStageInfo.color].dot}`} />
                    <span className="text-xs text-slate-500">Currently processing</span>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl p-4 bg-slate-100 dark:bg-slate-700">
                  <p className="text-slate-500 text-sm">Waiting to be called</p>
                </div>
              )}
            </div>

            {/* Next Stage */}
            <div className="card p-5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">⏭️ Up Next</p>
              {nextStageInfo ? (
                <div className="rounded-xl p-4 bg-slate-100 dark:bg-slate-700/50 border-2 border-dashed border-slate-200 dark:border-slate-600">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl opacity-60">{nextStageInfo.icon}</span>
                    <div>
                      <p className="font-semibold text-slate-600 dark:text-slate-300">{nextStageInfo.name}</p>
                      <p className="text-xs text-slate-400">{nextStageInfo.counter}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Proceed here after current stage is approved</p>
                </div>
              ) : (
                <div className="rounded-xl p-4 bg-green-50 dark:bg-green-900/20">
                  <p className="text-green-600 dark:text-green-400 font-medium text-sm">🎉 Final stage — almost done!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── 5-Stage Visual Workflow ──────────────────────────────────── */}
        {!isHelpDesk && (
          <div className="card p-6">
            <h2 className="font-semibold text-slate-800 dark:text-white mb-5">Admission Workflow</h2>
            <div className="space-y-3">
              {STAGES.map((stage, i) => {
                const done = currentStage > stage.num || isCompleted;
                const active = currentStage === stage.num && !isCompleted;
                const pending = currentStage < stage.num && !isCompleted;
                const c = COLOR_MAP[stage.color];

                return (
                  <div key={stage.num} className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                    done   ? 'bg-green-50 dark:bg-green-900/15' :
                    active ? `${c.bg} ring-2 ${c.ring}` :
                    'bg-slate-50 dark:bg-slate-800/50 opacity-60'
                  }`}>
                    {/* Step icon */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm ${
                      done   ? 'bg-green-500 text-white' :
                      active ? `${c.dot} text-white ring-4 ring-offset-2 ${c.ring}` :
                      'bg-slate-200 dark:bg-slate-700 text-slate-400'
                    }`}>
                      {done ? '✓' : stage.icon}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`font-semibold text-sm ${
                          done ? 'text-green-700 dark:text-green-400' :
                          active ? c.text :
                          'text-slate-400'
                        }`}>{stage.name}</p>
                        {active && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.bg} ${c.text}`}>
                            Current
                          </span>
                        )}
                        {done && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400">
                            Completed
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{stage.counter}</p>
                    </div>

                    {/* Timestamp if done */}
                    {done && student?.stageHistory?.find(h => h.stage === stage.num) && (
                      <p className="text-xs text-green-600 dark:text-green-400 flex-shrink-0">
                        {new Date(student.stageHistory.find(h => h.stage === stage.num).timestamp)
                          .toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Student Details ──────────────────────────────────────────── */}
        <div className="card p-6">
          <h2 className="font-semibold text-slate-800 dark:text-white mb-4">Student Information</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: 'Full Name',         value: student?.name,             icon: '👤' },
              { label: 'Application No.',   value: student?.applicationNumber, icon: '📋' },
              { label: 'Department',        value: student?.department,        icon: '🏛️' },
              { label: 'Admission Round',   value: student?.round,             icon: '📅' },
              { label: 'Allotment Category',value: student?.allotmentCategory, icon: '🏷️' },
              { label: 'Mobile',            value: student?.mobile,            icon: '📱' },
              { label: 'Email',             value: student?.email,             icon: '📧' },
              { label: 'Registered On',     value: student?.registeredAt ? new Date(student.registeredAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-', icon: '🗓️' },
              { label: 'Token Type',        value: student?.tokenType === 'helpdesk' ? 'Help Desk' : 'Admission', icon: '🎟️' },
            ].map(item => (
              <div key={item.label} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                <p className="text-xs text-slate-400 mb-1">{item.icon} {item.label}</p>
                <p className="font-semibold text-slate-800 dark:text-white text-sm truncate">{item.value || '—'}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Activity Timeline ────────────────────────────────────────── */}
        {student?.stageHistory?.length > 0 && (
          <div className="card p-6">
            <h2 className="font-semibold text-slate-800 dark:text-white mb-4">Activity Timeline</h2>
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700" />
              <div className="space-y-4">
                {[...student.stageHistory].reverse().map((h, i) => (
                  <div key={i} className="flex items-start gap-4 relative">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 font-bold text-sm ${
                      i === 0 ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'
                    }`}>
                      {i === 0 ? '●' : '✓'}
                    </div>
                    <div className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-xl p-3 mt-1">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <p className="font-semibold text-slate-800 dark:text-white text-sm">{h.name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${i === 0 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' : 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'}`}>
                          {i === 0 ? 'Current' : 'Completed'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(h.timestamp).toLocaleString('en-IN', {
                          day: 'numeric', month: 'short',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Important Instructions ───────────────────────────────────── */}
        <div className="card p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
          <h2 className="font-semibold text-blue-800 dark:text-blue-300 mb-3">📌 Important Instructions</h2>
          <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-400">
            <li className="flex items-start gap-2"><span className="mt-0.5">•</span> Keep your token number <strong>{student?.token}</strong> ready at all counters</li>
            <li className="flex items-start gap-2"><span className="mt-0.5">•</span> Carry original documents + 2 sets of photocopies</li>
            <li className="flex items-start gap-2"><span className="mt-0.5">•</span> Proceed to the next counter only after staff approval</li>
            <li className="flex items-start gap-2"><span className="mt-0.5">•</span> Do not skip any stage — process is strictly sequential</li>
            <li className="flex items-start gap-2"><span className="mt-0.5">•</span> For any issues, report to the Help Desk with your token number</li>
          </ul>
        </div>

        {/* ── Footer ──────────────────────────────────────────────────── */}
        <div className="text-center pb-4">
          <p className="text-xs text-slate-400">
            Anna University · College of Engineering, Guindy, Chennai – 600025
          </p>
          <p className="text-xs text-slate-300 dark:text-slate-600 mt-1">
            Last refreshed: {now.toLocaleTimeString('en-IN')}
          </p>
        </div>

      </div>
    </div>
  );
}
