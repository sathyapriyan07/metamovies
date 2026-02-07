const SkeletonCard = () => (
  <div className="w-full">
    <div className="skeleton w-full aspect-[2/3] rounded-2xl" />
  </div>
);

export const SkeletonRow = ({ count = 10 }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export default SkeletonCard;
