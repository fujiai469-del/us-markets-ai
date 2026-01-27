import { Component } from 'react';

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
      return (
        <div className="mx-4 my-4 p-6 rounded-2xl bg-[#1F242B] border border-[#A65D57]/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#A65D57]/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-[#D4847E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#E6E3DC]" style={{fontFamily: 'Georgia, serif'}}>
                表示エラーが発生しました
              </h3>
              <p className="text-sm text-[#9FA3A9]">
                このセクションの読み込みに問題がありました
              </p>
            </div>
          </div>
          <button
            onClick={this.handleRetry}
            className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-[#B59A5A] to-[#9C8450] text-[#141414] text-sm font-semibold transition-all duration-300 hover:from-[#C4A96A] hover:to-[#AB9360]"
          >
            再試行
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
