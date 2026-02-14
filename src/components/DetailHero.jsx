const DetailHero = ({ backdrop, poster, title }) => {
  return (
    <div className="relative w-full h-[48vh] md:h-[55vh] overflow-hidden">
      <img
        src={backdrop || poster || 'https://via.placeholder.com/1920x1080'}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
    </div>
  );
};

export default DetailHero;
