const STAGES = [
  { num: 1, label: 'Document Verification', icon: '📄' },
  { num: 2, label: 'Certificate Verification', icon: '🏆' },
  { num: 3, label: 'Online Verification', icon: '🌐' },
  { num: 4, label: 'Photo Capture', icon: '📸' },
  { num: 5, label: 'Admission Completion', icon: '✅' },
];

export default function StageProgress({ currentStage }) {
  const pct = currentStage === 0 ? 0 : currentStage >= 6 ? 100 : (currentStage / 5) * 100;

  return (
    <div className="w-full">
      {/* Progress bar */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Admission Progress</span>
        <span className="text-sm font-bold text-blue-600">{Math.round(pct)}%</span>
      </div>
      <div className="h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mb-6">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Stage steps */}
      <div className="relative">
        {/* Connector line */}
        <div className="absolute top-5 left-5 right-5 h-0.5 bg-slate-200 dark:bg-slate-700 z-0" />
        <div className="flex justify-between relative z-10">
          {STAGES.map(stage => {
            const done = currentStage > stage.num || currentStage >= 6;
            const active = currentStage === stage.num;
            return (
              <div key={stage.num} className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all
                  ${done ? 'bg-green-500 border-green-500 text-white' :
                    active ? 'bg-blue-600 border-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900' :
                    'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-400'}`}
                >
                  {done ? '✓' : stage.icon}
                </div>
                <span className={`text-xs text-center leading-tight max-w-16 ${
                  active ? 'text-blue-600 font-semibold' :
                  done ? 'text-green-600 dark:text-green-400 font-medium' :
                  'text-slate-400'
                }`}>{stage.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
