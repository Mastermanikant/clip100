'use client';

interface StatusBadgeProps {
  status: 'online' | 'offline' | 'connecting';
  label?: string;
}

const statusConfig = {
  online: { color: 'bg-green-500', text: 'text-green-500', label: 'Connected' },
  offline: { color: 'bg-red-500', text: 'text-red-500', label: 'Disconnected' },
  connecting: { color: 'bg-amber-500', text: 'text-amber-500', label: 'Connecting...' },
};

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-3 w-3">
        {status === 'online' && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.color} opacity-75`}
          />
        )}
        <span
          className={`relative inline-flex rounded-full h-3 w-3 ${config.color}`}
        />
      </span>
      <span
        className={`text-[10px] font-bold uppercase tracking-widest ${config.text}`}
      >
        {label || config.label}
      </span>
    </div>
  );
}
