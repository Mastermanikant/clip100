import React from 'react';
import { File, Check, X, Download } from 'lucide-react';
import { motion } from 'framer-motion';

export interface TransferItemProps {
  id: string;
  name: string;
  size: string;
  progress: number;
  status: 'encrypting' | 'sending' | 'receiving' | 'verifying' | 'completed' | 'paused' | 'error';
  speed?: string;
  direction: 'incoming' | 'outgoing';
  onCancel?: (id: string) => void;
  onDownload?: (id: string) => void;
}

export function TransferItem({
  id,
  name,
  size,
  progress,
  status,
  speed,
  direction,
  onCancel,
  onDownload
}: TransferItemProps) {
  const isComplete = progress >= 100 || status === 'completed';
  const isIncoming = direction === 'incoming';

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-3 shadow-sm hover:border-white/20 transition-all backdrop-blur-sm"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`p-2 rounded-lg shrink-0 ${isIncoming ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
            <File className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold truncate max-w-[150px]">{name}</div>
            <div className="text-[10px] text-gray-500 font-mono">{size}</div>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-1">
          <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
            isComplete ? 'bg-green-500/20 text-green-400' : 
            status === 'error' ? 'bg-red-500/20 text-red-400' : 
            'bg-blue-500/20 text-blue-400'
          }`}>
            {status}
          </div>
          {!isComplete && speed && (
             <span className="text-[8px] font-mono text-gray-400">{speed}</span>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className={`h-full transition-all duration-300 ${isComplete ? 'bg-green-500' : status === 'error' ? 'bg-red-500' : 'bg-blue-500'}`}
          />
        </div>
        <div className="flex justify-between items-center text-[10px] font-mono text-gray-500">
          <span>{Math.round(progress)}%</span>
          {isComplete && <Check className="w-3 h-3 text-green-400" />}
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-1">
        {!isComplete && status !== 'error' && onCancel && (
          <button 
            onClick={() => onCancel(id)}
            className="p-1.5 hover:bg-red-500/20 text-gray-500 hover:text-red-400 rounded-lg transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {isComplete && isIncoming && onDownload && (
          <button 
            onClick={() => onDownload(id)}
            className="flex items-center gap-2 px-3 py-1.5 bg-white text-black text-xs font-bold rounded-xl hover:bg-gray-200 transition-all uppercase tracking-widest"
          >
            <Download className="w-3 h-3 shrink-0" />
            Download
          </button>
        )}
      </div>
    </motion.div>
  );
}
