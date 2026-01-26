export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-slate-700"></div>
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-400 animate-spin"></div>
        <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-blue-500 animate-spin" style={{ animationDuration: '0.8s', animationDirection: 'reverse' }}></div>
      </div>
      <p className="mt-4 text-sm text-slate-400">読み込み中...</p>
    </div>
  );
}
