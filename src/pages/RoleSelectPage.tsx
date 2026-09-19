import { useNavigate } from 'react-router-dom';
import { User, Shield, HardHat, Building, ArrowRight } from 'lucide-react';
import { useStore } from '@/store';
import type { Role } from '@/types';
import { ROLE_LABELS } from '@/types';

const roles: { id: Role; icon: typeof User; desc: string; color: string }[] = [
  { id: 'citizen', icon: User, desc: 'Report emergencies & find help', color: 'bg-red-50 text-red-600' },
  { id: 'authority', icon: Shield, desc: 'Coordinate response operations', color: 'bg-blue-50 text-blue-600' },
  { id: 'rescue', icon: HardHat, desc: 'Execute rescue missions', color: 'bg-cyan-50 text-cyan-600' },
  { id: 'hospital', icon: Building, desc: 'Manage capacity & incoming patients', color: 'bg-blue-50 text-blue-600' },
];

export default function RoleSelectPage() {
  const { setRole } = useStore();
  const navigate = useNavigate();

  const select = (r: Role) => {
    setRole(r);
    const dest =
      r === 'citizen'
        ? '/citizen'
        : r === 'authority'
          ? '/response'
          : r === 'rescue'
            ? '/rescue'
            : '/hospital';
    navigate(dest);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Select Your Role</h1>
        <p className="mt-2 text-sm text-gray-500">
          RESQNET shows each user exactly what they need to do. Choose a role to continue.
        </p>
      </div>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {roles.map((r) => (
          <button
            key={r.id}
            onClick={() => select(r.id)}
            className="group flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 text-left transition-all hover:border-blue-300 hover:shadow-md"
          >
            <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${r.color}`}>
              <r.icon className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900">{ROLE_LABELS[r.id]}</div>
              <div className="text-xs text-gray-500">{r.desc}</div>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-300 transition-colors group-hover:text-blue-500" />
          </button>
        ))}
      </div>
      <p className="mt-6 text-center text-xs text-gray-400">
        Demo authentication — no real credentials required.
      </p>
    </div>
  );
}
