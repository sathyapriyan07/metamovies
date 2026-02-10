const SkeletonCard = () => (
  <div className="flex-shrink-0 w-[140px] md:w-[190px]">
    <div className="skeleton w-full aspect-[2/3] rounded-2xl" />
  </div>
);

export const SkeletonRow = ({ count = 10 }) => (
  <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export default SkeletonCard;
