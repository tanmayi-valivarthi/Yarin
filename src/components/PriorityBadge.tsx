import type { Priority } from '@/types';

const styles: Record<Priority, string> = {
  critical: 'bg-red-600 text-white border-red-700',
  high: 'bg-orange-500 text-white border-orange-600',
  medium: 'bg-yellow-400 text-yellow-900 border-yellow-500',
  low: 'bg-gray-200 text-gray-700 border-gray-300',
};

const labels: Record<Priority, string> = {
  critical: 'CRITICAL',
  high: 'HIGH',
  medium: 'MEDIUM',
  low: 'LOW',
};

export default function PriorityBadge({
  priority,
  size = 'md',
}: {
  priority: Priority;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sz =
    size === 'sm'
      ? 'text-[10px] px-2 py-0.5'
      : size === 'lg'
        ? 'text-sm px-3 py-1.5'
        : 'text-xs px-2.5 py-1';
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-bold tracking-wide ${styles[priority]} ${sz}`}
    >
      {priority === 'critical' && (
        <span className={`h-1.5 w-1.5 rounded-full bg-white ${size === 'lg' ? 'h-2 w-2' : ''} animate-pulse`} />
      )}
      {labels[priority]}
    </span>
  );
}
