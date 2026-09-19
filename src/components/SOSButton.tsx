import { Link } from 'react-router-dom';
import { Siren } from 'lucide-react';

export default function SOSButton({ large = false }: { large?: boolean }) {
  return (
    <Link
      to="/sos"
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-red-600 font-bold text-white shadow-lg shadow-red-600/30 transition-all hover:bg-red-700 hover:shadow-red-600/40 active:scale-95 ${
        large ? 'px-8 py-4 text-lg' : 'px-4 py-2 text-sm'
      }`}
    >
      <Siren className={large ? 'h-6 w-6' : 'h-4 w-4'} />
      {large ? 'EMERGENCY SOS' : 'SOS'}
      {large && <span className="h-2.5 w-2.5 rounded-full bg-white animate-pulse" />}
    </Link>
  );
}
