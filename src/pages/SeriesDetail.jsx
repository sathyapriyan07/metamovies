import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSeriesById, updateSeries } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { useWatchlist } from '../hooks/useWatchlist';
import CastCard from '../components/CastCard';
import DetailHero from '../components/DetailHero';

const SeriesDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { addItem, removeItem, checkInWatchlist } = useWatchlist();
  const [series, setSeries] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('cast');
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [editingPoster, setEditingPoster] = useState(false);
  const [posterUrl, setPosterUrl] = useState('');
  const [backdropUrl, setBackdropUrl] = useState('');
  const [editingBackdrop, setEditingBackdrop] = useState(false);

  const getYouTubeThumbnail = (url) => {
    const videoId = url?.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/)?.[1];
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
  };

  useEffect(() => {
    loadSeries();
  }, [id]);

  const loadSeries = async () => {
    setLoading(true);
    const { data } = await getSeriesById(id);
    setSeries(data);
    if (data?.seasons?.length > 0) {
      setSelectedSeason(data.seasons[0]);
    }
    if (user && data) {
      const isIn = await checkInWatchlist(data.id, 'series');
      setInWatchlist(isIn);
    }
    setLoading(false);
  };

  const toggleWatchlist = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (inWatchlist) {
      await removeItem(series.id, 'series');
      setInWatchlist(false);
    } else {
      await addItem(series.id, 'series');
      setInWatchlist(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-sky-400"></div>
      </div>
    );
  }

  if (!series) return <div className="min-h-screen flex items-center justify-center">Series not found</div>;

  return (
    <div className="min-h-screen pb-24 md:pb-12">
      <DetailHero backdrop={series.backdrop_url} poster={series.poster_url} title={series.title} />

      <div className="mt-16 md:mt-24 text-center px-4">
        <p className="text-sky-300 text-xs uppercase tracking-[0.3em]">Series</p>
        <h1 className="text-3xl md:text-5xl font-semibold text-white mt-3">
          {series.title}{' '}
          <span className="text-gray-400">
            {series.first_air_date && `(${series.first_air_date.split('-')[0]})`}
          </span>
        </h1>

        <div className="flex items-center justify-center gap-3 text-sm md:text-base mb-4 flex-wrap text-gray-300 mt-4">
          {series.genres && series.genres.length > 0 && (
            <div className="flex gap-2 flex-wrap justify-center">
              {series.genres.slice(0, 3).map((genre, i) => (
                <button
                  key={i}
                  onClick={() => navigate(`/series?genre=${genre}`)}
                  className="chip"
                >
                  {genre}
                </button>
              ))}
            </div>
          )}

          {((typeof series.rating === 'number') || (typeof series.imdb_rating === 'number') || (typeof series.rotten_rating === 'number')) && (
            <div className="flex flex-wrap items-center gap-3">
              {typeof series.rating === 'number' && (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-200 hover:shadow-[0_0_18px_rgba(16,185,129,0.25)] transition">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Tmdb.new.logo.svg/3840px-Tmdb.new.logo.svg.png"
                    alt="TMDB"
                    className="h-6 w-auto"
                    loading="lazy"
                    decoding="async"
                  />
                  {series.rating.toFixed(1)}
                </span>
              )}
              {typeof series.imdb_rating === 'number' && (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-200 hover:shadow-[0_0_18px_rgba(245,197,24,0.25)] transition">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/IMDB_Logo_2016.svg/960px-IMDB_Logo_2016.svg.png"
                    alt="IMDb"
                    className="h-[22px] w-auto"
                    loading="lazy"
                    decoding="async"
                  />
                  {series.imdb_rating.toFixed(1)}
                </span>
              )}
              {typeof series.rotten_rating === 'number' && (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-200 hover:shadow-[0_0_18px_rgba(229,9,20,0.25)] transition">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Rotten_Tomatoes.svg/3840px-Rotten_Tomatoes.svg.png"
                    alt="Rotten Tomatoes"
                    className="h-5 w-5"
                    loading="lazy"
                    decoding="async"
                  />
                  {Math.round(series.rotten_rating)}%
                </span>
              )}
            </div>
          )}
          {series.seasons?.length > 0 && (
            <>
              <span className="text-gray-500">•</span>
              <span className="text-gray-300">{series.seasons.length} Seasons</span>
            </>
          )}
        </div>

        {series.overview && (
          <p className="text-gray-300 text-sm md:text-base max-w-3xl mx-auto mb-6">
            {series.overview}
          </p>
        )}

        <div className="flex flex-wrap gap-3 justify-center mb-8">
          <button onClick={toggleWatchlist} className="btn-ghost">
            {inWatchlist ? 'In Watchlist' : '+ Add to Watchlist'}
          </button>
          {series.trailer_url && (
            <a href={series.trailer_url} target="_blank" rel="noopener noreferrer" className="btn-primary">
              Watch Trailer
            </a>
          )}
          {isAdmin && (
            <>
              <button
                onClick={() => {
                  setEditingPoster(true);
                  setPosterUrl(series.poster_url || '');
                }}
                className="btn-ghost"
              >
                Edit Poster
              </button>
              <button
                onClick={() => {
                  setEditingBackdrop(true);
                  setBackdropUrl(series.backdrop_url || '');
                }}
                className="btn-ghost"
              >
                Edit Backdrop
              </button>
            </>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {series.seasons && series.seasons.length > 0 && (
          <div className="mb-10">
            <h3 className="text-xl font-semibold mb-3">Seasons</h3>
            <select
              value={selectedSeason?.id}
              onChange={(e) => setSelectedSeason(series.seasons.find((s) => s.id === parseInt(e.target.value, 10)))}
              className="w-full md:w-64 px-4 py-2 glass-input"
            >
              {series.seasons.map((season) => (
                <option key={season.id} value={season.id} className="bg-black">
                  Season {season.season_number}
                </option>
              ))}
            </select>

            {selectedSeason && (
              <div className="mt-6 space-y-4">
                {selectedSeason.episodes?.map((episode) => (
                  <div key={episode.id} className="glass-card rounded-2xl p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      <img
                        src={episode.still_url || 'https://via.placeholder.com/300x169'}
                        alt={episode.title}
                        className="w-full md:w-40 h-24 object-cover rounded-xl"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-white">
                          {episode.episode_number}. {episode.title}
                        </h4>
                        <p className="text-sm text-gray-400 mt-1 line-clamp-2">{episode.overview}</p>
                        <p className="text-xs text-gray-500 mt-2">{episode.air_date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="border-b border-white/10 mb-6 flex gap-6">
          <button onClick={() => setActiveTab('cast')} className={`tab-item ${activeTab === 'cast' ? 'tab-item-active' : ''}`}>
            Cast
          </button>
          <button onClick={() => setActiveTab('crew')} className={`tab-item ${activeTab === 'crew' ? 'tab-item-active' : ''}`}>
            Crew
          </button>
          <button onClick={() => setActiveTab('links')} className={`tab-item ${activeTab === 'links' ? 'tab-item-active' : ''}`}>
            External Links
          </button>
        </div>

        {activeTab === 'cast' && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Cast</h3>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {series.cast?.map((c) => (
                <CastCard key={c.id} person={c.person} role={c.character} personId={c.person.id} />
              ))}
            </div>
            {(!series.cast || series.cast.length === 0) && (
              <p className="text-center text-gray-400 py-8">No cast information available</p>
            )}
          </div>
        )}

        {activeTab === 'links' && (
          <div className="space-y-8">
            {series.watch_links && (series.watch_links.netflix || series.watch_links.prime || series.watch_links.hotstar || series.watch_links.zee5) && (
              <div>
                <h3 className="text-xl font-semibold mb-3">Watch Now</h3>
                <div className="flex flex-wrap gap-3">
                  {series.watch_links.netflix && (
                    <a href={series.watch_links.netflix} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#E50914] hover:bg-[#f6121d] text-white transition font-semibold">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/7/7a/Logonetflix.png" alt="Netflix" className="h-8 w-auto" loading="lazy" decoding="async" />
                    </a>
                  )}
                  {series.watch_links.prime && (
                    <a href={series.watch_links.prime} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#1B4DB1] hover:bg-[#225dd6] text-white transition font-semibold">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Amazon_Prime_Video_logo.svg/960px-Amazon_Prime_Video_logo.svg.png" alt="Prime Video" className="h-8 w-auto" loading="lazy" decoding="async" />
                    </a>
                  )}
                  {series.watch_links.hotstar && (
                    <a href={series.watch_links.hotstar} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#0B5FFF] hover:bg-[#1b6dff] text-white transition font-semibold">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/4/40/JioHotstar_2025.png" alt="JioHotstar" className="h-9 w-auto" loading="lazy" decoding="async" />
                    </a>
                  )}
                  {series.watch_links.zee5 && (
                    <a href={series.watch_links.zee5} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#2B2B2B] hover:bg-[#3a3a3a] text-white transition font-semibold">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/ZEE5_2025.svg/250px-ZEE5_2025.svg.png" alt="ZEE5" className="h-7 w-auto" loading="lazy" decoding="async" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {series.trailer_url && (
              <div>
                <h3 className="text-xl font-semibold mb-3">Watch Trailer</h3>
                <a href={series.trailer_url} target="_blank" rel="noopener noreferrer" className="block relative group">
                  <img
                    src={getYouTubeThumbnail(series.trailer_url) || series.backdrop_url || 'https://via.placeholder.com/640x360'}
                    alt="Trailer"
                    className="w-full md:w-2/3 rounded-2xl border border-white/10"
                  />
                  <div className="absolute inset-0 md:w-2/3 flex items-center justify-center bg-black/40 group-hover:bg-black/60 transition rounded-2xl">
                    <div className="w-16 h-16 bg-sky-400 rounded-full flex items-center justify-center group-hover:scale-110 transition">
                      <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </a>
              </div>
            )}

            {series.telegram_link && (
              <div>
                <h3 className="text-xl font-semibold mb-3">Download</h3>
                <a href={series.telegram_link} target="_blank" rel="noopener noreferrer" className="btn-ghost">
                  Download on Telegram
                </a>
              </div>
            )}

            {series.music_links && (series.music_links.spotify || series.music_links.apple_music || series.music_links.youtube_music) && (
              <div>
                <h3 className="text-xl font-semibold mb-3">Listen to Soundtrack</h3>
                <div className="flex flex-wrap gap-3">
                  {series.music_links.spotify && (
                    <a href={series.music_links.spotify} target="_blank" rel="noopener noreferrer" className="btn-ghost">
                      Spotify
                    </a>
                  )}
                  {series.music_links.apple_music && (
                    <a href={series.music_links.apple_music} target="_blank" rel="noopener noreferrer" className="btn-ghost">
                      Apple Music
                    </a>
                  )}
                  {series.music_links.youtube_music && (
                    <a href={series.music_links.youtube_music} target="_blank" rel="noopener noreferrer" className="btn-ghost">
                      YouTube Music
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'crew' && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Crew</h3>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {series.crew?.map((c) => (
                <CastCard key={c.id} person={c.person} role={c.job} personId={c.person.id} />
              ))}
            </div>
            {(!series.crew || series.crew.length === 0) && (
              <p className="text-center text-gray-400 py-8">No crew information available</p>
            )}
          </div>
        )}
      </div>

      {editingPoster && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setEditingPoster(false)}>
          <div className="glass-card rounded-2xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-semibold mb-4">Update Poster</h3>
            {posterUrl && (
              <div className="mb-4 flex justify-center">
                <img src={posterUrl} alt="Preview" className="w-32 h-48 object-cover rounded-lg" onError={(e) => (e.target.style.display = 'none')} />
              </div>
            )}
            <input type="url" value={posterUrl} onChange={(e) => setPosterUrl(e.target.value)} placeholder="Poster URL" className="w-full px-4 py-2 glass-input mb-4" />
            <div className="flex gap-3">
              <button onClick={async () => { await updateSeries(series.id, { poster_url: posterUrl }); setEditingPoster(false); loadSeries(); }} className="btn-primary flex-1">
                Save
              </button>
              <button onClick={() => setEditingPoster(false)} className="btn-ghost flex-1">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {editingBackdrop && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setEditingBackdrop(false)}>
          <div className="glass-card rounded-2xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-semibold mb-4">Update Backdrop</h3>
            {backdropUrl && (
              <div className="mb-4">
                <img src={backdropUrl} alt="Preview" className="w-full h-32 object-cover rounded-lg" onError={(e) => (e.target.style.display = 'none')} />
              </div>
            )}
            <input type="url" value={backdropUrl} onChange={(e) => setBackdropUrl(e.target.value)} placeholder="Backdrop URL" className="w-full px-4 py-2 glass-input mb-4" />
            <div className="flex gap-3">
              <button onClick={async () => { await updateSeries(series.id, { backdrop_url: backdropUrl }); setEditingBackdrop(false); loadSeries(); }} className="btn-primary flex-1">
                Save
              </button>
              <button onClick={() => setEditingBackdrop(false)} className="btn-ghost flex-1">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeriesDetail;
