import { useState } from 'react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';

export default function WhyButton({
  reasons,
  label = 'Why?',
}: {
  reasons: string[];
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="my-1">
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-800 hover:underline"
      >
        <Info className="h-3.5 w-3.5" />
        {label}
        {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>
      {open && (
        <div className="mt-1.5 rounded-md border border-blue-100 bg-blue-50 p-2.5 text-xs text-blue-900">
          <ul className="space-y-0.5">
            {reasons.map((r, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-blue-500" />
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
