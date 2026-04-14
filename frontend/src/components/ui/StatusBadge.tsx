import React from 'react';

interface StatusBadgeProps {
  status: 'online' | 'offline' | 'connecting';
  label?: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const colors = {
    online: 'bg-green-500',
    offline: 'bg-red-500',
    connecting: 'bg-amber-500'
  };

  const textColors = {
    online: 'text-green-500',
    offline: 'text-gray-500',
    connecting: 'text-amber-500'
  };

  const defaultLabels = {
    online: 'P2P Active',
    offline: 'Disconnected',
    connecting: 'Connecting...'
  };

  const isOnline = status === 'online';

  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-3 w-3">
        {status !== 'offline' && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${colors[status]} opacity-75`} />
        )}
        <span className={`relative inline-flex rounded-full h-3 w-3 ${colors[status]}`} />
      </span>
      <span className={`text-[10px] font-bold uppercase tracking-widest ${textColors[status]}`}>
        {label || defaultLabels[status]}
      </span>
    </div>
  );
}
