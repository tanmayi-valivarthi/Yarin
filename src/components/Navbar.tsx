import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Siren,
  Activity,
  Map as MapIcon,
  UserSearch,
  Package,
  MessageSquare,
  Bell,
  Shield,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import { useStore } from '@/store';
import NetworkStatus from './NetworkStatus';
import { ROLE_LABELS } from '@/types';

const navItems = [
  { to: '/', label: 'Home', icon: Home, roles: null },
  { to: '/emergency', label: 'Emergency', icon: Siren, roles: null },
  { to: '/response', label: 'Response', icon: Activity, roles: ['authority', 'rescue'] },
  { to: '/map', label: 'Map', icon: MapIcon, roles: null },
  { to: '/missing', label: 'Missing Persons', icon: UserSearch, roles: null },
  { to: '/resources', label: 'Resources', icon: Package, roles: ['authority'] },
  { to: '/messages', label: 'Messages', icon: MessageSquare, roles: null },
];

export default function Navbar() {
  const { role, setRole, notifications } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const unread = notifications.filter(
    (n) => !n.read && (role ? n.roles.includes(role as never) : true),
  ).length;

  const items = navItems.filter((i) => !i.roles || (role && i.roles.includes(role as never)));

  const handleLogout = () => {
    setRole(null);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-[1100] border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-white">
            <Shield className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-gray-900">RESQNET</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5 ml-2">
          {items.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  active ? 'bg-red-50 text-red-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <NetworkStatus />

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen((o) => !o)}
              className="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100"
            >
              <Bell className="h-5 w-5" />
              {unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                  {unread}
                </span>
              )}
            </button>
            {notifOpen && (
              <div className="absolute right-0 top-11 z-[1200] w-80 rounded-lg border border-gray-200 bg-white shadow-xl">
                <div className="border-b border-gray-100 px-3 py-2 text-sm font-semibold">Notifications</div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications
                    .filter((n) => (role ? n.roles.includes(role as never) : true))
                    .slice(0, 10)
                    .map((n) => (
                      <div key={n.id} className="border-b border-gray-50 px-3 py-2 text-xs">
                        <div className="flex items-start gap-2">
                          <span
                            className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                              n.level === 'critical'
                                ? 'bg-red-600'
                                : n.level === 'high'
                                  ? 'bg-orange-500'
                                  : n.level === 'medium'
                                    ? 'bg-yellow-400'
                                    : 'bg-gray-400'
                            }`}
                          />
                          <span className="text-gray-700">{n.text}</span>
                        </div>
                      </div>
                    ))}
                  {notifications.length === 0 && (
                    <div className="px-3 py-4 text-center text-xs text-gray-400">No notifications</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Role badge */}
          {role && (
            <div className="hidden sm:flex items-center gap-1.5 rounded-lg bg-gray-100 px-2.5 py-1">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-xs font-medium text-gray-700">{ROLE_LABELS[role as keyof typeof ROLE_LABELS]}</span>
            </div>
          )}

          {role && (
            <button
              onClick={handleLogout}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-red-600"
              title="Switch role"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="md:hidden border-t border-gray-100 bg-white px-4 py-2">
          {items.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
                  active ? 'bg-red-50 text-red-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
