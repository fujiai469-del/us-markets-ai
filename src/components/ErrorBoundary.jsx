import { Component } from 'react';

// エラータイプを判定してユーザーフレンドリーなメッセージを返す
function getErrorInfo(error) {
  const errorMessage = error?.message || '';

  // APIレート制限・クオータ超過
  if (errorMessage.includes('429') ||
    errorMessage.includes('上限') ||
    errorMessage.includes('quota') ||
    errorMessage.includes('RATE_LIMIT') ||
    errorMessage.includes('rate limit')) {
    return {
      icon: '⏱',
      title: 'サービス利用制限',
      message: 'APIの利用上限に達しました。しばらく時間をおいてから再度お試しください。',
      code: 'RATE_LIMIT'
    };
  }

  // ネットワークエラー
  if (errorMessage.includes('network') ||
    errorMessage.includes('Network') ||
    errorMessage.includes('fetch') ||
    errorMessage.includes('Failed to fetch') ||
    errorMessage.includes('ERR_NETWORK')) {
    return {
      icon: '📡',
      title: '通信エラー',
      message: 'インターネット接続を確認してください。',
      code: 'NETWORK'
    };
  }

  // 認証エラー
  if (errorMessage.includes('401') ||
    errorMessage.includes('403') ||
    errorMessage.includes('API key') ||
    errorMessage.includes('authentication')) {
    return {
      icon: '🔒',
      title: '認証エラー',
      message: 'サービスへの接続に問題が発生しました。',
      code: 'AUTH'
    };
  }

  // サーバーエラー
  if (errorMessage.includes('500') ||
    errorMessage.includes('502') ||
    errorMessage.includes('503') ||
    errorMessage.includes('504')) {
    return {
      icon: '🔧',
      title: 'サーバーエラー',
      message: 'サービスが一時的に利用できません。しばらくしてから再度お試しください。',
      code: 'SERVER'
    };
  }

  // AI/Gemini特有のエラー
  if (errorMessage.includes('Gemini') ||
    errorMessage.includes('generateContent') ||
    errorMessage.includes('model')) {
    return {
      icon: '🤖',
      title: 'AIサービスエラー',
      message: 'AI分析サービスが一時的に利用できません。',
      code: 'AI'
    };
  }

  // デフォルト
  return {
    icon: '⚠',
    title: 'エラーが発生しました',
    message: 'コンテンツの読み込みに失敗しました。再度お試しください。',
    code: 'UNKNOWN'
  };
}

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const errorInfo = getErrorInfo(this.state.error);

      return (
        <div className="mx-4 my-4 p-6 neu-card text-center">
          <div className="w-14 h-14 mx-auto mb-4 neu-raised rounded-full flex items-center justify-center">
            <span className="text-2xl">{errorInfo.icon}</span>
          </div>
          <h3 className="text-base font-semibold text-[var(--text-heading)] mb-2">
            {errorInfo.title}
          </h3>
          <p className="text-sm text-[var(--text-muted)] mb-2">
            {errorInfo.message}
          </p>
          <p className="text-xs text-[var(--text-light)] mb-4">
            エラーコード: {errorInfo.code}
          </p>
          <button
            onClick={this.handleRetry}
            className="btn-neu-primary"
          >
            再試行
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
