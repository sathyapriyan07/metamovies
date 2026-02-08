import PosterCard from './PosterCard';
import { SkeletonRow } from './SkeletonCard';

const PosterRow = ({ title, items, type = 'movie', loading = false }) => {
  if (loading) return (
    <div className="mb-12">
      <h2 className="section-title px-4 md:px-8">{title}</h2>
      <div className="px-4 md:px-8">
        <SkeletonRow />
      </div>
    </div>
  );

  if (!items || items.length === 0) return null;

  return (
    <div className="mb-12 fade-in">
      <h2 className="section-title px-4 md:px-8">{title}</h2>
      <div className="px-4 md:px-8">
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {items.map((item) => (
            <div key={item.id} className="flex-shrink-0 w-[120px] md:w-[160px]">
              <PosterCard item={item} type={type} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PosterRow;
