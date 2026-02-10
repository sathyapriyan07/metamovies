const MusicHero = ({ poster, title }) => {
  return (
    <div className="relative w-full h-[50vh] md:h-[65vh] overflow-visible">
      {poster ? (
        <img
          src={poster}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover opacity-40 blur-[2px]"
          loading="lazy"
        />
      ) : null}

      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.28),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(16,185,129,0.22),transparent_55%)]" />

      {poster ? (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-[-26px] md:bottom-[-50px] w-[140px] md:w-[220px]">
          <img
            src={poster}
            alt={`${title} cover`}
            className="w-full h-auto aspect-square object-cover rounded-2xl border border-white/10 shadow-[0_0_35px_rgba(16,185,129,0.2)]"
            loading="lazy"
          />
        </div>
      ) : null}
    </div>
  );
};

export default MusicHero;
