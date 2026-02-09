const DetailHero = ({ backdrop, poster, title, year, rating, genres, runtime, onGenreClick }) => {
  return (
    <div className="relative w-full h-[40vh] md:h-[55vh] overflow-hidden">
      {/* Backdrop */}
      <img
        src={backdrop || poster || 'https://via.placeholder.com/1920x1080'}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover animate-[fadeIn_0.3s_ease-out]"
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
      
      {/* Floating Poster */}
      <div className="absolute left-4 md:left-8 bottom-[-40px] md:bottom-[-60px] z-10">
        <img
          src={poster || 'https://via.placeholder.com/300x450'}
          alt={title}
          className="w-[110px] md:w-[200px] aspect-[2/3] object-cover rounded-xl shadow-2xl border border-white/10 hover:scale-105 transition-transform duration-300"
        />
      </div>
    </div>
  );
};

export default DetailHero;
