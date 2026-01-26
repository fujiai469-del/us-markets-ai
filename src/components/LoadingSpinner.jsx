export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative w-14 h-14">
        {/* 外側のリング */}
        <div className="absolute inset-0 rounded-full border-2 border-[#2A2A2A]"></div>
        {/* ゴールドのスピナー */}
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#B59A5A] animate-spin"></div>
        {/* 内側のダークゴールドスピナー */}
        <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-[#9C8450] animate-spin" style={{ animationDuration: '0.8s', animationDirection: 'reverse' }}></div>
        {/* 中央のドット */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-[#B59A5A]/50"></div>
        </div>
      </div>
      <p className="mt-4 text-sm text-[#9FA3A9] tracking-wide">読み込み中...</p>
    </div>
  );
}
