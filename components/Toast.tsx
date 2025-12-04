import React, { useEffect, useState } from 'react';
import * as Icons from 'lucide-react';
import { ToastType } from '../types';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 300); // Match animation duration
  };

  const styles = {
    success: 'bg-white border-l-4 border-green-500 text-slate-800',
    error: 'bg-white border-l-4 border-red-500 text-slate-800',
    info: 'bg-white border-l-4 border-indigo-500 text-slate-800',
  };

  const icons = {
    success: <Icons.CheckCircle2 className="text-green-500" size={20} />,
    error: <Icons.AlertCircle className="text-red-500" size={20} />,
    info: <Icons.Info className="text-indigo-500" size={20} />,
  };

  return (
    <div 
      className={`
        flex items-center gap-3 px-4 py-3 rounded shadow-lg border border-slate-100 min-w-[300px] max-w-md
        transition-all duration-300 transform 
        ${isExiting ? 'opacity-0 translate-x-full' : 'translate-x-0 opacity-100'}
        ${styles[type]}
      `}
      role="alert"
    >
      <div className="shrink-0">{icons[type]}</div>
      <div className="flex-1 text-sm font-medium">{message}</div>
      <button 
        onClick={handleClose} 
        className="text-slate-400 hover:text-slate-600 transition-colors"
      >
        <Icons.X size={16} />
      </button>
    </div>
  );
};

export default Toast;