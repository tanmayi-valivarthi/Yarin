import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useStore } from '@/store';

export default function NetworkStatus() {
  const { online, setOnline, pendingSyncCount, setPendingSyncCount } = useStore();
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => {
          if (online) {
            setOnline(false);
          } else {
            setOnline(true);
            if (pendingSyncCount > 0) {
              setTimeout(() => setPendingSyncCount(0), 1500);
            }
          }
        }}
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
          online
            ? 'bg-green-100 text-green-800 hover:bg-green-200'
            : 'bg-red-100 text-red-800 hover:bg-red-200'
        }`}
        title="Toggle connectivity (demo)"
      >
        {online ? (
          <>
            <Wifi className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">CONNECTED</span>
          </>
        ) : (
          <>
            <WifiOff className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">LIMITED</span>
          </>
        )}
        <span className={`h-1.5 w-1.5 rounded-full ${online ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
      </button>
      {pendingSyncCount > 0 && online && (
        <span className="inline-flex items-center gap-1 text-[11px] text-blue-600 animate-pulse">
          <RefreshCw className="h-3 w-3 animate-spin" />
          Syncing {pendingSyncCount}…
        </span>
      )}
    </div>
  );
}
