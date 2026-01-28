import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginModal({ isOpen, onClose }) {
  const { login } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('メールアドレスとパスワードを入力してください');
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }

    if (password.length < 6) {
      setError('パスワードは6文字以上で入力してください');
      return;
    }

    try {
      login(email, password);
      onClose();
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError('ログインに失敗しました');
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={handleOverlayClick}
    >
      <div className="relative w-[95%] sm:w-full max-w-md neu-card p-6 sm:p-8 md:p-10 animate-fadeIn">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-xl text-[var(--text-muted)] hover:text-[var(--text-body)] hover:bg-[var(--bg-secondary)] transition-colors touch-target"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-5 neu-raised-sm flex items-center justify-center rounded-2xl">
            <svg className="w-7 h-7 sm:w-8 sm:h-8 text-[var(--accent-blue)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-[var(--text-heading)]">
            {isSignUp ? 'アカウント作成' : 'ログイン'}
          </h2>
          <p className="text-[13px] sm:text-sm text-[var(--text-muted)] mt-2 sm:mt-3">
            {isSignUp ? '新しいアカウントを作成します' : 'アカウントにログイン'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[var(--text-body)] mb-3">
              メールアドレス
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              className="input-neu min-h-[52px]"
              style={{ fontSize: '16px' }} /* Prevents iOS zoom */
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-body)] mb-3">
              パスワード
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6文字以上"
              className="input-neu min-h-[52px]"
              style={{ fontSize: '16px' }} /* Prevents iOS zoom */
            />
          </div>

          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-[var(--text-body)] mb-3">
                パスワード（確認）
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="パスワードを再入力"
                className="input-neu min-h-[52px]"
                style={{ fontSize: '16px' }} /* Prevents iOS zoom */
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full btn-neu-primary py-4 sm:py-5 text-base min-h-[52px] mt-2"
          >
            {isSignUp ? 'アカウント作成' : 'ログイン'}
          </button>
        </form>

        {/* Toggle */}
        <div className="mt-6 sm:mt-8 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
            }}
            className="text-sm text-[var(--accent-blue)] hover:underline py-2 px-4 min-h-[44px]"
          >
            {isSignUp ? '既にアカウントをお持ちの方' : '新規アカウント作成'}
          </button>
        </div>
      </div>
    </div>
  );
}
