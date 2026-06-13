import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import Navbar from '../components/shared/Navbar';

const DEPARTMENTS = [
  { label: 'BIO MEDICAL ENGINEERING',                          code: 'BME'  },
  { label: 'CIVIL ENGINEERING',                                code: 'CIVIL' },
  { label: 'CIVIL ENGINEERING TAMIL MEDIUM',                   code: 'CIVIL-TM' },
  { label: 'COMPUTER SCIENCE AND ENGINEERING',                 code: 'CSE'  },
  { label: 'ELECTRICAL AND ELECTRONICS ENGINEERING',           code: 'EEE'  },
  { label: 'ELECTRONICS AND COMMUNICATION ENGINEERING',        code: 'ECE'  },
  { label: 'ELECTRONICS ENGINEERING (VLSI DESIGN)',            code: 'VLSI' },
  { label: 'GEO INFORMATICS',                                  code: 'GEO'  },
  { label: 'INDUSTRIAL ENGINEERING',                           code: 'IE'   },
  { label: 'INFORMATION TECHNOLOGY (SS)',                      code: 'IT'   },
  { label: 'MANUFACTURING ENGINEERING',                        code: 'MFGE' },
  { label: 'MATERIALS SCIENCE AND ENGINEERING',                code: 'MSE'  },
  { label: 'MECHANICAL ENGINEERING',                           code: 'MECH' },
  { label: 'MECHANICAL ENGINEERING TAMIL MEDIUM',              code: 'MECH-TM' },
  { label: 'MINING ENGINEERING',                               code: 'MINE' },
  { label: 'PRINTING AND PACKAGING TECHNOLOGY',               code: 'PPT'  },
];

const ROUNDS = [
  { label: 'Round 1',           value: 'Round 1' },
  { label: 'Round 1 Upward',    value: 'Round 1 Upward' },
  { label: 'Round 2',           value: 'Round 2' },
  { label: 'Round 2 Upward',    value: 'Round 2 Upward' },
];

export default function RegisterPage() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const onlineAdmissionDone = watch('onlineAdmissionDone');

  const onSubmit = async (data) => {
    setLoading(true); setError('');
    try {
      const payload = {
        ...data,
        onlineAdmissionDone: data.onlineAdmissionDone === 'true',
        semesterFeePaid: data.semesterFeePaid === 'true',
      };
      const res = await api.post('/students/register', payload);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  if (result) {
    const isHelpDesk = result.tokenType === 'helpdesk';
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12">
          <div className="w-full max-w-md fade-in">
            <div className="card p-8 text-center">
              <div className="text-5xl mb-4">{isHelpDesk ? '⚠️' : '🎉'}</div>
              <h2 className="font-display text-2xl font-bold text-slate-800 dark:text-white mb-2">
                {isHelpDesk ? 'Help Desk Required' : 'Registration Successful!'}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">{result.message}</p>

              <div className={`p-5 rounded-2xl mb-6 ${isHelpDesk ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'bg-green-50 dark:bg-green-900/20'}`}>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Your Token Number</p>
                <p className={`text-3xl font-bold font-mono ${isHelpDesk ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>
                  {result.token}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  {isHelpDesk ? 'Report to Help Desk Counter' : 'Proceed to Document Verification Counter'}
                </p>
              </div>

              {isHelpDesk && (
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl mb-6 text-left">
                  <p className="text-sm text-orange-700 dark:text-orange-300 font-medium">📋 Action Required</p>
                  <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">{result.message}</p>
                </div>
              )}

              <p className="text-xs text-slate-400 mb-4">📧 A confirmation email has been sent to your registered email address.</p>

              <div className="flex flex-col gap-3">
                <Link to="/student-login" className="btn-primary py-2.5">Track My Admission Status</Link>
                <Link to="/" className="btn-secondary py-2.5">Back to Home</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="fade-in">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-bold text-slate-800 dark:text-white">Student Registration</h1>
            <p className="text-slate-500 mt-2">Fill in all details carefully. Token will be generated automatically.</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="card p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

              {/* Personal Info */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 dark:border-slate-700">
                  Personal Information
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Student Name *</label>
                    <input {...register('name', { required: 'Name is required' })} className="input" placeholder="Full Name" />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="label">Application Number *</label>
                    <input {...register('applicationNumber', { required: 'Application number is required' })} className="input" placeholder="e.g. 659832" />
                    {errors.applicationNumber && <p className="text-red-500 text-xs mt-1">{errors.applicationNumber.message}</p>}
                  </div>
                  <div>
                    <label className="label">Mobile Number *</label>
                    <input
                      {...register('mobile', {
                        required: 'Mobile is required',
                        pattern: { value: /^[6-9]\d{9}$/, message: 'Enter valid 10-digit number' }
                      })}
                      className="input" placeholder="10-digit mobile" maxLength={10}
                    />
                    {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile.message}</p>}
                  </div>
                  <div>
                    <label className="label">Email ID *</label>
                    <input type="email" {...register('email', { required: 'Email is required' })} className="input" placeholder="student@email.com" />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                  </div>
                </div>
              </div>

              {/* Academic Info */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 dark:border-slate-700">
                  Academic Details
                </h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="label">Department *</label>
                    {/* Store dept CODE as value, show full label */}
                    <select {...register('department', { required: 'Department is required' })} className="input">
                      <option value="">Select Department</option>
                      {DEPARTMENTS.map(d => (
                        <option key={d.code} value={d.code}>{d.label}</option>
                      ))}
                    </select>
                    {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department.message}</p>}
                  </div>
                  <div>
                    <label className="label">Allotment Category *</label>
                    <input {...register('allotmentCategory', { required: 'Category is required' })} className="input" placeholder="OC / BC / MBC / SC / ST" />
                    {errors.allotmentCategory && <p className="text-red-500 text-xs mt-1">{errors.allotmentCategory.message}</p>}
                  </div>
                  <div className="sm:col-span-3">
                    <label className="label">Admission Round *</label>
                    <select {...register('round', { required: 'Round is required' })} className="input">
                      <option value="">Select Round</option>
                      {ROUNDS.map(r => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                    {errors.round && <p className="text-red-500 text-xs mt-1">{errors.round.message}</p>}
                  </div>
                </div>
              </div>

              {/* Admission Validation */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 dark:border-slate-700">
                  Admission Validation
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Online Admission Submission Completed? *</label>
                    <select {...register('onlineAdmissionDone', { required: 'This field is required' })} className="input">
                      <option value="">Select</option>
                      <option value="true">Yes — Completed</option>
                      <option value="false">No — Pending</option>
                    </select>
                    {errors.onlineAdmissionDone && <p className="text-red-500 text-xs mt-1">{errors.onlineAdmissionDone.message}</p>}
                    {onlineAdmissionDone === 'false' && (
                      <p className="text-yellow-600 dark:text-yellow-400 text-xs mt-1.5 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded-lg">
                        ⚠️ You will be directed to Help Desk for assistance.
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="label">Semester Fee Paid? *</label>
                    <select
                      {...register('semesterFeePaid', { required: 'This field is required' })}
                      className={`input ${(!onlineAdmissionDone || onlineAdmissionDone === 'false') ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={!onlineAdmissionDone || onlineAdmissionDone === 'false'}
                    >
                      <option value="">Select</option>
                      <option value="true">Yes — Paid</option>
                      <option value="false">No — Pending</option>
                    </select>
                    {errors.semesterFeePaid && <p className="text-red-500 text-xs mt-1">{errors.semesterFeePaid.message}</p>}
                    {(!onlineAdmissionDone || onlineAdmissionDone === 'false') && (
                      <p className="text-slate-400 text-xs mt-1">Complete online admission first to enable this field.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  <strong>📋 Token Generation:</strong> If both validations are complete, an Admission Token will be generated automatically. Otherwise, you will receive a Help Desk token.
                </p>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
                {loading
                  ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Registering...</span>
                  : '📝 Submit Registration'
                }
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
