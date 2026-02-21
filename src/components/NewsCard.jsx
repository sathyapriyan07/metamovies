import { useNavigate } from 'react-router-dom';

const NewsCard = ({ article, rank }) => {
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div
      onClick={() => navigate(`/news/${article.id}`)}
      className="glass-card rounded-[14px] overflow-hidden cursor-pointer card-hover group h-full"
    >
      <div className="flex flex-col md:flex-row h-full">
        <div className="relative md:w-[200px] lg:w-[240px] flex-shrink-0">
          <div className="aspect-[2/3] md:h-full relative overflow-hidden">
            <img
              src={article.image_url || 'https://via.placeholder.com/400x600'}
              alt={article.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02] will-change-transform"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>

          {rank && (
            <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-sm font-bold bg-white/12 border border-white/14">
              #{rank}
            </div>
          )}
        </div>

        <div className="flex-1 p-5 md:p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-lg md:text-xl mb-3 line-clamp-2 group-hover:text-white transition-colors">
              {article.title}
            </h3>

            <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
              <span>{formatDate(article.created_at)}</span>
              {article.is_featured && (
                <>
                  <span>|</span>
                  <span className="text-white/85">Featured</span>
                </>
              )}
            </div>

            <p className="text-sm text-gray-300 line-clamp-3 leading-relaxed">
              {article.excerpt || article.content?.substring(0, 150)}
            </p>
          </div>

          <div className="mt-4">
            <span className="text-sm text-white/80 hover:text-white transition-colors inline-flex items-center gap-1">
              Read More
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsCard;


