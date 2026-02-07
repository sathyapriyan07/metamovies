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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {items.slice(0, 10).map((item) => (
            <PosterCard key={item.id} item={item} type={type} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PosterRow;
