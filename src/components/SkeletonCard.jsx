const SkeletonCard = () => (
  <div className="min-w-[120px] md:min-w-[160px]">
    <div className="skeleton w-full aspect-[2/3] rounded-xl" />
    <div className="mt-3">
      <div className="skeleton h-4 w-3/4 mb-2 rounded" />
      <div className="skeleton h-3 w-1/2 rounded" />
    </div>
  </div>
);

export const SkeletonRow = ({ count = 6 }) => (
  <div className="flex gap-6 overflow-x-auto pb-4">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export default SkeletonCard;
