import { useEffect } from 'react';

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-600';

  return (
    <div className="fixed top-20 right-4 z-[60] animate-fade-in">
      <div className={`${bgColor} text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3`}>
        {type === 'success' && <span>✓</span>}
        {type === 'error' && <span>✕</span>}
        {type === 'info' && <span>ℹ</span>}
        <span>{message}</span>
        <button onClick={onClose} className="ml-2 hover:opacity-75">×</button>
      </div>
    </div>
  );
};

export default Toast;
