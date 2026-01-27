import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function ProfileMenu() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="icon-btn-neu"
        title="プロフィール"
      >
        <div className="w-7 h-7 rounded-full bg-[var(--accent-blue)] flex items-center justify-center text-white text-sm font-bold">
          {user.name.charAt(0).toUpperCase()}
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-64 neu-card p-4 animate-fadeIn z-50">
          {/* User info */}
          <div className="flex items-center gap-3 pb-4 border-b border-[var(--shadow-dark)]">
            <div className="w-12 h-12 rounded-full bg-[var(--accent-blue)] flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[var(--text-heading)] truncate">
                {user.name}
              </p>
              <p className="text-xs text-[var(--text-muted)] truncate">
                {user.email}
              </p>
            </div>
          </div>

          {/* Menu items */}
          <div className="mt-4 space-y-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 p-3 rounded-xl text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              ログアウト
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
