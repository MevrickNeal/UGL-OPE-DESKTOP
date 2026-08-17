import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback(({ type = 'info', title, message }) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, title, message }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem = ({ toast, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 8000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const icons = {
    success: <CheckCircle className="text-green-500 w-5 h-5" />,
    warning: <AlertTriangle className="text-amber-500 w-5 h-5" />,
    error: <XCircle className="text-red-500 w-5 h-5" />,
    info: <Info className="text-blue-500 w-5 h-5" />,
  };

  const borders = {
    success: 'border-l-green-500',
    warning: 'border-l-amber-500',
    error: 'border-l-red-500',
    info: 'border-l-blue-500',
  };

  return (
    <div className={`flex items-start bg-white/90 backdrop-blur shadow-lg rounded-lg border-l-4 ${borders[toast.type]} p-4 w-80 animate-in slide-in-from-right fade-in duration-300`}>
      <div className="mr-3 mt-0.5">{icons[toast.type]}</div>
      <div className="flex-1">
        <h4 className="text-sm font-semibold text-gray-900">{toast.title}</h4>
        <p className="text-sm text-gray-600 mt-1">{toast.message}</p>
      </div>
      <button onClick={() => onRemove(toast.id)} className="ml-3 text-gray-400 hover:text-gray-600 transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
