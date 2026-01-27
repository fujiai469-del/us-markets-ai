export default function SkeletonCard({ featured = false }) {
  if (featured) {
    return (
      <div className="mx-4 mb-6 neu-card overflow-hidden animate-pulse">
        {/* Image skeleton */}
        <div className="h-52 bg-gradient-to-r from-[#dfe6ed] to-[#e8eef4]" />

        <div className="p-6">
          {/* Source and date skeleton */}
          <div className="flex items-center justify-between mb-4">
            <div className="h-3 w-20 bg-[#dfe6ed] rounded-full" />
            <div className="h-3 w-16 bg-[#dfe6ed] rounded-full" />
          </div>

          {/* Title skeleton */}
          <div className="space-y-2 mb-4">
            <div className="h-5 bg-[#dfe6ed] rounded-lg w-full" />
            <div className="h-5 bg-[#dfe6ed] rounded-lg w-3/4" />
          </div>

          {/* Description skeleton */}
          <div className="space-y-2 mb-5">
            <div className="h-3 bg-[#dfe6ed] rounded-full w-full" />
            <div className="h-3 bg-[#dfe6ed] rounded-full w-5/6" />
          </div>

          {/* Divider */}
          <div className="h-px bg-[#dfe6ed] mb-5" />

          {/* Actions skeleton */}
          <div className="flex items-center justify-end gap-3">
            <div className="h-10 w-32 bg-[#dfe6ed] rounded-xl" />
            <div className="h-11 w-11 bg-[#dfe6ed] rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-4 mb-4 neu-flat overflow-hidden animate-pulse">
      <div className="flex gap-4 p-5">
        {/* Thumbnail skeleton */}
        <div className="w-24 h-24 flex-shrink-0 bg-[#dfe6ed] rounded-xl" />

        {/* Content skeleton */}
        <div className="flex-1 min-w-0">
          {/* Source and date */}
          <div className="flex items-center justify-between mb-3">
            <div className="h-2.5 w-16 bg-[#dfe6ed] rounded-full" />
            <div className="h-2.5 w-14 bg-[#dfe6ed] rounded-full" />
          </div>

          {/* Title */}
          <div className="space-y-2 mb-3">
            <div className="h-4 bg-[#dfe6ed] rounded-lg w-full" />
            <div className="h-4 bg-[#dfe6ed] rounded-lg w-2/3" />
          </div>

          {/* Category chip */}
          <div className="h-6 w-16 bg-[#dfe6ed] rounded-full" />
        </div>
      </div>

      {/* Actions skeleton */}
      <div className="flex items-center justify-end gap-2 px-5 pb-5">
        <div className="h-8 w-20 bg-[#dfe6ed] rounded-xl" />
        <div className="h-9 w-9 bg-[#dfe6ed] rounded-xl" />
      </div>
    </div>
  );
}

export function SkeletonList({ count = 5, showFeatured = true }) {
  return (
    <div className="animate-fadeIn">
      {showFeatured && <SkeletonCard featured />}
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
}
