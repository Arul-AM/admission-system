import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import StudentLoginPage from './pages/StudentLoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/StudentDashboard';
import StaffDashboard from './pages/StaffDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminStudents from './pages/AdminStudents';
import AdminStaff from './pages/AdminStaff';
import AdminReports from './pages/AdminReports';
import AdminSMS from './pages/AdminSMS';
import NotFound from './pages/NotFound';

function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/unauthorized" replace />;
  return children;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/student-login" element={<StudentLoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/student/dashboard" element={
              <PrivateRoute roles={['student']}><StudentDashboard /></PrivateRoute>
            } />
            <Route path="/staff/dashboard" element={
              <PrivateRoute roles={['staff']}><StaffDashboard /></PrivateRoute>
            } />
            <Route path="/admin" element={
              <PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute>
            } />
            <Route path="/admin/students" element={
              <PrivateRoute roles={['admin']}><AdminStudents /></PrivateRoute>
            } />
            <Route path="/admin/staff" element={
              <PrivateRoute roles={['admin']}><AdminStaff /></PrivateRoute>
            } />
            <Route path="/admin/reports" element={
              <PrivateRoute roles={['admin']}><AdminReports /></PrivateRoute>
            } />
            <Route path="/admin/sms" element={
              <PrivateRoute roles={['admin']}><AdminSMS /></PrivateRoute>
            } />
            <Route path="/unauthorized" element={
              <div className="flex items-center justify-center min-h-screen">
                <div className="text-center"><h1 className="text-3xl font-bold text-red-500 mb-4">Access Denied</h1><p className="text-slate-500">You don't have permission to view this page.</p></div>
              </div>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
