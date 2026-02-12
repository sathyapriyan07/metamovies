const SkeletonCard = () => (
  <div className="flex-shrink-0 w-[140px] md:w-[190px]">
    <div className="skeleton w-full aspect-[2/3] rounded-2xl" />
  </div>
);

const SkeletonGridCard = () => (
  <div>
    <div className="skeleton w-full aspect-[2/3] rounded-2xl" />
    <div className="mt-2 min-h-[56px] pb-3">
      <div className="skeleton h-4 w-full rounded mb-2" />
      <div className="skeleton h-3 w-16 rounded" />
    </div>
  </div>
);

export const SkeletonRow = ({ count = 10 }) => (
  <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export const SkeletonGrid = ({ count = 12 }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonGridCard key={i} />
    ))}
  </div>
);

export default SkeletonCard;
