export function SkeletonCard() {
  return (
    <div className="mx-4 mb-4 rounded-2xl bg-[#1F242B] border border-[#2A2A2A] overflow-hidden card-gold-border">
      <div className="flex p-6 gap-4">
        {/* 画像スケルトン */}
        <div className="flex-shrink-0 w-24 h-24 rounded-xl bg-[#2A2A2A] animate-pulse" />

        {/* コンテンツスケルトン */}
        <div className="flex-1 min-w-0 flex flex-col gap-3">
          {/* タイトルスケルトン */}
          <div className="space-y-2">
            <div className="h-4 bg-[#2A2A2A] rounded animate-pulse w-full" />
            <div className="h-4 bg-[#2A2A2A] rounded animate-pulse w-3/4" />
          </div>

          {/* メタ情報スケルトン */}
          <div className="flex items-center gap-2">
            <div className="h-3 bg-[#2A2A2A] rounded animate-pulse w-20" />
            <div className="h-3 bg-[#2A2A2A] rounded animate-pulse w-16" />
          </div>
        </div>
      </div>

      {/* 説明文スケルトン */}
      <div className="px-6 pb-4">
        <div className="space-y-2">
          <div className="h-3 bg-[#2A2A2A] rounded animate-pulse w-full" />
          <div className="h-3 bg-[#2A2A2A] rounded animate-pulse w-5/6" />
        </div>
      </div>

      {/* ボタンスケルトン */}
      <div className="flex items-center justify-end px-6 pb-6 gap-3">
        <div className="h-10 bg-[#2A2A2A] rounded-xl animate-pulse w-24" />
        <div className="h-10 w-10 bg-[#2A2A2A] rounded-xl animate-pulse" />
      </div>
    </div>
  );
}

export function FeaturedSkeletonCard() {
  return (
    <div className="mx-4 mb-5 rounded-2xl bg-[#1F242B] border border-[#2A2A2A] overflow-hidden card-gold-border">
      {/* 画像スケルトン */}
      <div className="h-52 bg-[#2A2A2A] animate-pulse" />

      <div className="p-6">
        {/* ヘッダースケルトン */}
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 bg-[#2A2A2A] rounded animate-pulse w-24" />
          <div className="h-3 bg-[#2A2A2A] rounded animate-pulse w-20" />
        </div>

        {/* タイトルスケルトン */}
        <div className="space-y-3 mb-4">
          <div className="h-6 bg-[#2A2A2A] rounded animate-pulse w-full" />
          <div className="h-6 bg-[#2A2A2A] rounded animate-pulse w-4/5" />
        </div>

        {/* 説明文スケルトン */}
        <div className="space-y-2 mb-6">
          <div className="h-4 bg-[#2A2A2A] rounded animate-pulse w-full" />
          <div className="h-4 bg-[#2A2A2A] rounded animate-pulse w-3/4" />
        </div>

        {/* ボタンスケルトン */}
        <div className="flex items-center justify-end gap-3">
          <div className="h-12 bg-[#2A2A2A] rounded-xl animate-pulse w-28" />
          <div className="h-12 w-12 bg-[#2A2A2A] rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonList({ count = 5, showFeatured = true }) {
  return (
    <>
      {showFeatured && <FeaturedSkeletonCard />}
      <div className="mt-2">
        {Array.from({ length: count }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    </>
  );
}
