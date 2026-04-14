import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QRPanelProps {
  url: string;
  roomId: string;
  color?: string;
  bgColor?: string;
}

export function QRPanel({ 
  url, 
  roomId, 
  color = '#3b82f6', 
  bgColor = '#050505' 
}: QRPanelProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-gray-600 gap-6">
      <div className="relative group">
         <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000" />
         <QRCodeSVG 
           value={url} 
           size={150} 
           bgColor={bgColor} 
           fgColor={color} 
           level="H"
           className="relative p-4 bg-white/5 rounded-3xl border border-white/10 shadow-2xl"
         />
      </div>
      <div className="text-center space-y-2">
        <h3 className="text-xl font-black uppercase tracking-widest text-white">Room: {roomId}</h3>
        <p className="text-sm text-gray-500">Scan QR with your phone to connect.</p>
        <p className="text-xs font-mono tracking-widest uppercase text-gray-600">Waiting for peer...</p>
      </div>
    </div>
  );
}
