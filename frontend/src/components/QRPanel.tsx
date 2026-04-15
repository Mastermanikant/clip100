'use client';

import { QRCodeSVG } from 'qrcode.react';

interface QRPanelProps {
  url: string;
  roomId: string;
  label?: string;
}

export default function QRPanel({ url, roomId, label = 'Scan to connect' }: QRPanelProps) {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="p-6 bg-white/5 rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(59,130,246,0.1)]">
        <QRCodeSVG
          value={url}
          size={180}
          bgColor="#050505"
          fgColor="#3b82f6"
          level="H"
        />
      </div>
      <div className="text-center">
        <h3 className="text-xl font-black mb-2 uppercase tracking-widest">
          Room: {roomId}
        </h3>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}
