import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

let toastCount = 0;
const toasts: Toast[] = [];
let listeners: ((toasts: Toast[]) => void)[] = [];

export function addToast(message: string, type: 'success' | 'error' = 'success') {
  const id = `toast-${toastCount++}`;
  toasts.push({ id, message, type });
  listeners.forEach(listener => listener([...toasts]));
  
  setTimeout(() => {
    const index = toasts.findIndex(t => t.id === id);
    if (index > -1) {
      toasts.splice(index, 1);
      listeners.forEach(listener => listener([...toasts]));
    }
  }, 3000);
}

function Toast({ message, type, onClose }: ToastProps) {
  return (
    <div
      className={clsx(
        'fixed bottom-4 right-4 px-6 py-4 rounded-lg shadow-lg',
        'flex items-center gap-3',
        'transform transition-all duration-300 ease-out',
        'animate-enter-toast',
        type === 'success' 
          ? 'bg-white dark:bg-gray-800 border border-green-100 dark:border-green-900/30' 
          : 'bg-white dark:bg-gray-800 border border-red-100 dark:border-red-900/30',
      )}
      role="alert"
    >
      {/* Status Icon */}
      <div className={clsx(
        'flex-shrink-0 w-4 h-4',
        type === 'success' ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'
      )}>
        {type === 'success' ? (
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        )}
      </div>

      {/* Message */}
      <p className={clsx(
        'text-sm font-medium',
        type === 'success' 
          ? 'text-gray-800 dark:text-gray-100' 
          : 'text-gray-800 dark:text-gray-100'
      )}>
        {message}
      </p>
    </div>
  );
}

export function ToastContainer() {
  const [currentToasts, setCurrentToasts] = useState<Toast[]>([]);

  useEffect(() => {
    listeners.push(setCurrentToasts);
    return () => {
      listeners = listeners.filter(l => l !== setCurrentToasts);
    };
  }, []);

  if (typeof window === 'undefined') return null;

  return createPortal(
    <div className="fixed bottom-0 right-0 p-4 space-y-4 z-50">
      {currentToasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => {
            const index = toasts.findIndex(t => t.id === toast.id);
            if (index > -1) {
              toasts.splice(index, 1);
              listeners.forEach(listener => listener([...toasts]));
            }
          }}
        />
      ))}
    </div>,
    document.body
  );
} 