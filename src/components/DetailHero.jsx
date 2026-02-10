const DetailHero = ({ backdrop, poster, title }) => {
  return (
    <div className="relative w-full h-[55vh] md:h-[70vh] overflow-visible">
      <img
        src={backdrop || poster || 'https://via.placeholder.com/1920x1080'}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,167,255,0.2),transparent_45%)] z-10" />

      <div className="absolute left-1/2 -translate-x-1/2 bottom-[-28px] md:bottom-[-54px] w-[130px] md:w-[210px] z-20">
        <img
          src={poster || 'https://via.placeholder.com/300x450'}
          alt={`${title} poster`}
          className="w-full h-auto aspect-[2/3] object-contain rounded-2xl neon-ring border border-white/10 hover:scale-105 transition-transform duration-200"
        />
      </div>
    </div>
  );
};

export default DetailHero;
