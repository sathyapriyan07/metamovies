import PosterCard from './PosterCard';
import { SkeletonRow } from './SkeletonCard';

const PosterRow = ({ title, items, type = 'movie', loading = false }) => {
  if (loading) return (
    <div className="mb-12">
      <h2 className="section-title">{title}</h2>
      <SkeletonRow />
    </div>
  );

  if (!items || items.length === 0) return null;

  return (
    <div className="mb-12 fade-in">
      <h2 className="section-title">{title}</h2>
      <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
        {items.map((item) => (
          <PosterCard key={item.id} item={item} type={type} />
        ))}
      </div>
    </div>
  );
};

export default PosterRow;
