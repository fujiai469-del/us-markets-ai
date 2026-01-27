export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      {/* Neumorphic Spinner */}
      <div className="relative">
        <div className="w-16 h-16 neu-raised rounded-full flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border-3 border-[#c8d0e7] border-t-[#3b82f6] animate-spin" />
        </div>
      </div>

      {/* Text */}
      <p className="mt-6 text-sm font-medium text-[#4a5568]">
        Loading...
      </p>
      <p className="mt-1 text-xs text-[#718096]">
        Please wait
      </p>
    </div>
  );
}
