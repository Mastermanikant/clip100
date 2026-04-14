'use client';

import React from 'react';
import { File, Check, X, Download, Pause, Play, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface TransferItemProps {
  name: string;
  size: string;
  progress: number;
  status: 'Encrypting' | 'Sending' | 'Receiving' | 'Verifying' | 'Stored' | 'Completed';
  speed?: string;
  onCancel?: () => void;
  onDownload?: () => void;
  isIncoming?: boolean;
}

export default function TransferItem({
  name,
  size,
  progress,
  status,
  speed,
  onCancel,
  onDownload,
  isIncoming = false
}: TransferItemProps) {
  const isComplete = progress === 100 || status === 'Completed' || status === 'Stored';

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-3 shadow-sm hover:border-white/20 transition-all"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`p-2 rounded-lg ${isIncoming ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
            <File className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">{name}</div>
            <div className="text-[10px] text-gray-500">{size}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {status === 'Receiving' || status === 'Sending' ? (
            <span className="text-[10px] font-mono text-gray-400">{speed || '0 B/s'}</span>
          ) : null}
          <div className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider ${
            isComplete ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
          }`}>
            {status}
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className={`h-full transition-all duration-300 ${isComplete ? 'bg-green-500' : 'bg-blue-500'}`}
          />
        </div>
        <div className="flex justify-between text-[10px] font-mono text-gray-500">
          <span>{progress}%</span>
          {isComplete && <Check className="w-3 h-3 text-green-400" />}
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-1">
        {!isComplete ? (
          <button 
            onClick={onCancel}
            className="p-1.5 hover:bg-red-500/20 text-gray-500 hover:text-red-400 rounded-lg transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          isIncoming && (
            <button 
              onClick={onDownload}
              className="flex items-center gap-2 px-3 py-1.5 bg-white text-black text-xs font-bold rounded-xl hover:bg-gray-200 transition-all"
            >
              <Download className="w-3 h-3" />
              Download
            </button>
          )
        )}
      </div>
    </motion.div>
  );
}
