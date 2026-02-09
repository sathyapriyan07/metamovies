const DetailHero = ({ backdrop, poster, title, year, rating, genres, runtime, onGenreClick }) => {
  return (
    <>
      {/* Hero Backdrop Section */}
      <div className="relative w-full h-[40vh] md:h-[55vh] overflow-hidden rounded-b-3xl">
        {/* Backdrop */}
        <img
          src={backdrop || poster || 'https://via.placeholder.com/1920x1080'}
          alt={title}
          className="w-full h-full object-cover animate-[fadeIn_0.3s_ease-out]"
        />
        
        {/* Light Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-amber-100/80 via-amber-50/30 to-transparent" />
        
        {/* Floating Poster */}
        <div className="absolute left-4 md:left-10 top-1/2 -translate-y-1/2 z-20 animate-[fadeIn_0.3s_ease-out]">
          <img
            src={poster || 'https://via.placeholder.com/300x450'}
            alt={`${title} poster`}
            className="w-[110px] md:w-[180px] aspect-[2/3] object-cover rounded-2xl shadow-2xl border border-black/10 hover:scale-105 transition-transform duration-200"
          />
        </div>
      </div>

      {/* Beige Title Strip */}
      <div className="bg-[#e8cc8f] py-6 px-4 text-center">
        <h1 className="text-3xl md:text-5xl font-semibold text-black">
          {title} <span className="text-black/70">{year && `(${year})`}</span>
        </h1>
      </div>
    </>
  );
};

export default DetailHero;
