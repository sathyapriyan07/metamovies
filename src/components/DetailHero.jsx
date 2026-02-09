const DetailHero = ({ backdrop, poster, title }) => {
  return (
    <div className="relative w-full h-[50vh] md:h-[65vh] overflow-visible">
      {/* Backdrop */}
      <img
        src={backdrop || poster || 'https://via.placeholder.com/1920x1080'}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover z-0"
      />
      
      {/* Dark Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent z-10" />
      
      {/* Centered Floating Poster */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-[-28px] md:bottom-[-48px] w-[120px] md:w-[200px] z-20 overflow-visible">
        <img
          src={poster || 'https://via.placeholder.com/300x450'}
          alt={`${title} poster`}
          className="w-full h-auto aspect-[2/3] object-contain rounded-xl shadow-2xl border border-white/10 hover:scale-105 transition-transform duration-200"
        />
      </div>
    </div>
  );
};

export default DetailHero;
