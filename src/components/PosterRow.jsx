import PosterCard from './PosterCard';
import { SkeletonRow } from './SkeletonLoader';

const PosterRow = ({ title, items, type = 'movie', loading = false, subtitle }) => {
  if (loading) return (
    <div className="mb-10">
      <div className="px-4 md:px-8 flex items-end justify-between">
        <div>
          <h2 className="section-title">{title}</h2>
          {subtitle && <p className="text-secondary text-sm">{subtitle}</p>}
        </div>
      </div>
      <div className="px-4 md:px-8 mt-4">
        <SkeletonRow />
      </div>
    </div>
  );

  if (!items || items.length === 0) return null;

  return (
    <div className="mb-10 fade-in">
      <div className="px-4 md:px-8">
        <h2 className="text-xl md:text-2xl font-semibold mb-4">{title}</h2>
        {subtitle && <p className="text-secondary text-sm mb-3">{subtitle}</p>}
      </div>
      <div className="px-4 md:px-8">
        <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide snap-x snap-mandatory">
          {items.map((item) => (
            <div key={item.id} className="flex-shrink-0 w-[140px] md:w-[185px] snap-start">
              <PosterCard item={item} type={type} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PosterRow;
