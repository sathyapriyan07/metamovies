const DetailHero = ({ backdrop, poster, title }) => {
  return (
    <div className="relative w-full h-[50vh] md:h-[65vh] overflow-visible">
      {/* Backdrop Container */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={backdrop || poster || 'https://via.placeholder.com/1920x1080'}
          alt={title}
          className="w-full h-full object-cover object-center animate-[fadeIn_0.25s_ease-out]"
        />
        {/* Dark Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent z-10" />
      </div>
      
      {/* Floating Poster */}
      <div className="absolute z-20 left-4 md:left-10 bottom-[-24px] md:bottom-[-40px] w-[115px] md:w-[190px] overflow-visible animate-[slideUp_0.25s_ease-out]">
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
