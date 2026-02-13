import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const themes = [
    { id: 'dark', name: 'Dark', icon: '🌙' },
    { id: 'amoled', name: 'AMOLED', icon: '⚫' },
    { id: 'blue', name: 'Dark Blue', icon: '💙' },
    { id: 'light', name: 'Light', icon: '☀️' }
  ];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentTheme = themes.find(t => t.id === theme);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
        aria-label="Toggle theme"
      >
        <span className="text-lg">{currentTheme?.icon}</span>
        <span className="hidden md:inline text-sm">{currentTheme?.name}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 glass-card rounded-xl border border-white/10 shadow-xl z-50 overflow-hidden">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                toggleTheme(t.id);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-white/10 transition-all ${
                theme === t.id ? 'bg-white/5 text-accent' : ''
              }`}
            >
              <span className="text-lg">{t.icon}</span>
              <span>{t.name}</span>
              {theme === t.id && <span className="ml-auto text-accent">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThemeToggle;
