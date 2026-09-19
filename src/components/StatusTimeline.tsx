import type { EmergencyStatus } from '@/types';
import { STATUS_FLOW } from '@/types';

const labels: Record<EmergencyStatus, string> = {
  reported: 'Reported',
  triaged: 'Triaged',
  resource_assigned: 'Resource Assigned',
  en_route: 'En Route',
  arrived: 'Arrived',
  resolved: 'Resolved',
};

export default function StatusTimeline({
  current,
  compact = false,
}: {
  current: EmergencyStatus;
  compact?: boolean;
}) {
  const idx = STATUS_FLOW.indexOf(current);
  return (
    <div className={`flex items-center ${compact ? 'gap-1' : 'gap-2'} overflow-x-auto`}>
      {STATUS_FLOW.map((s, i) => {
        const done = i <= idx;
        const active = i === idx;
        return (
          <div key={s} className="flex items-center min-w-0">
            <div className="flex flex-col items-center min-w-0">
              <div
                className={`rounded-full ${compact ? 'h-2 w-2' : 'h-3 w-3'} ${
                  done
                    ? active
                      ? 'bg-blue-600 ring-2 ring-blue-200'
                      : 'bg-blue-600'
                    : 'bg-gray-300'
                }`}
              />
              {!compact && (
                <span
                  className={`mt-1 text-[10px] whitespace-nowrap ${
                    done ? 'text-blue-700 font-medium' : 'text-gray-400'
                  }`}
                >
                  {labels[s]}
                </span>
              )}
            </div>
            {i < STATUS_FLOW.length - 1 && (
              <div
                className={`${compact ? 'w-3 h-0.5' : 'w-5 h-0.5'} ${
                  i < idx ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
