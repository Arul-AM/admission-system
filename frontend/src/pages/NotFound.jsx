import { Link } from 'react-router-dom';
import Navbar from '../components/shared/Navbar';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar />
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center fade-in">
          <div className="text-8xl mb-4">404</div>
          <h1 className="font-display text-3xl font-bold text-slate-800 dark:text-white mb-2">Page Not Found</h1>
          <p className="text-slate-500 mb-6">The page you're looking for doesn't exist.</p>
          <Link to="/" className="btn-primary">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
