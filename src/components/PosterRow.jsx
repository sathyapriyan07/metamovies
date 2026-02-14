import PosterCard from './PosterCard';
import { SkeletonRow } from './SkeletonLoader';

const PosterRow = ({ title, items, type = 'movie', loading = false, subtitle }) => {
  if (loading) return (
    <div className="mb-12">
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
    <div className="mb-12 fade-in">
      <div className="px-4 md:px-8 flex items-end justify-between">
        <div>
          <h2 className="section-title">{title}</h2>
          {subtitle && <p className="text-secondary text-sm">{subtitle}</p>}
        </div>
      </div>
      <div className="px-4 md:px-8 mt-4">
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {items.map((item) => (
            <div key={item.id} className="flex-shrink-0 w-[125px] md:w-[185px]">
              <PosterCard item={item} type={type} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PosterRow;
