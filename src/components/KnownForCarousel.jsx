import { useState } from 'react';
import KnownForCard from './KnownForCard';

const KnownForCarousel = ({ works }) => {
  const [showAll, setShowAll] = useState(false);
  const displayedWorks = showAll ? works : works.slice(0, 6);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3 md:gap-5">
        {displayedWorks.map((work, i) => (
          <KnownForCard key={i} work={work} />
        ))}
      </div>

      {works.length > 6 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full py-2 px-4 bg-white/5 hover:bg-white/10 rounded-lg transition border border-white/10"
        >
          {showAll ? 'Show Less' : `Show All (${works.length})`}
        </button>
      )}
    </div>
  );
};

export default KnownForCarousel;
