const DetailHero = ({ backdrop, poster, title, year, rating, genres, runtime, onGenreClick }) => {
  return (
    <div className="relative w-full min-h-[48vh] md:min-h-[60vh] overflow-visible">
      {/* Backdrop */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={backdrop || poster || 'https://via.placeholder.com/1920x1080'}
          alt={title}
          className="w-full h-full object-cover animate-[fadeIn_0.3s_ease-out]"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />
      </div>
      
      {/* Floating Poster */}
      <div className="absolute left-4 md:left-8 bottom-[-20px] md:bottom-[-40px] z-20">
        <img
          src={poster || 'https://via.placeholder.com/300x450'}
          alt={title}
          className="w-[120px] md:w-[180px] h-auto aspect-[2/3] object-contain rounded-xl shadow-2xl border border-white/10 hover:scale-105 transition-transform duration-200"
        />
      </div>
    </div>
  );
};

export default DetailHero;
