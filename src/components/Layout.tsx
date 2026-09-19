import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import DemoPanel from './DemoPanel';
import { useStore } from '@/store';

export default function Layout() {
  const { role } = useStore();
  const location = useLocation();

  // Require role for app pages (except home and role-select)
  const publicPaths = ['/', '/role'];
  const isPublic = publicPaths.includes(location.pathname);

  if (!role && !isPublic) {
    return <Navigate to="/role" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <DemoPanel />
      <footer className="border-t border-gray-200 bg-white py-3 text-center text-xs text-gray-400">
        RESQNET — Intelligent Disaster Response & Relief Coordination · Demo Prototype
      </footer>
    </div>
  );
}
