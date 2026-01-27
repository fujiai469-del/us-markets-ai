import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';
import ProfileMenu from './ProfileMenu';

export default function Header({ onRefresh, isLoading }) {
  const { user } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 header-neu">
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            {/* Logo Icon */}
            <div className="w-11 h-11 neu-raised-sm flex items-center justify-center">
              <svg className="w-6 h-6 text-[var(--accent-blue)]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z" />
                <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z" fillOpacity="0.3" transform="translate(0, 2)" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-[var(--text-heading)] tracking-tight">
                US Markets
              </h1>
              <span className="text-[11px] font-medium text-[var(--text-muted)] tracking-wide">
                AIニュース分析
              </span>
            </div>
          </div>

          {/* Right side buttons */}
          <div className="flex items-center gap-3">
            {/* Refresh Button */}
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isLoading}
                className="icon-btn-neu"
                title="更新"
              >
                <svg
                  className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
            )}

            {/* Profile Button / Login */}
            {user ? (
              <ProfileMenu />
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="icon-btn-neu"
                title="ログイン"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </header>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </>
  );
}
