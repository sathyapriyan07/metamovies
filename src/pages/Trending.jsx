import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SeoHead from '../components/SeoHead';
import {
  getWeeklyTrending,
  getMostWatchlistedMovies,
  getMostSearched,
  getMoviesByIds,
  getPersonsByIds,
  getSongsByIds
} from '../services/supabase';

const getWeekStart = () => {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split('T')[0];
};

const Trending = () => {
  const navigate = useNavigate();
  const [weekly, setWeekly] = useState([]);
  const [weeklyItems, setWeeklyItems] = useState({ movie: [], person: [], song: [] });
  const [watchlisted, setWatchlisted] = useState([]);
  const [mostSearched, setMostSearched] = useState([]);
  const [loading, setLoading] = useState(true);

  const weekStart = useMemo(() => getWeekStart(), []);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [weeklyResp, watchResp, searchResp] = await Promise.all([
      getWeeklyTrending(weekStart),
      getMostWatchlistedMovies(10),
      getMostSearched(10)
    ]);

    const weeklyData = weeklyResp.data || [];
    setWeekly(weeklyData);
    setWatchlisted(watchResp.data || []);
    setMostSearched(searchResp.data || []);

    const movieIds = weeklyData
      .filter((i) => i.entity_type === 'movie')
      .map((i) => Number(i.entity_id))
      .filter((v) => !Number.isNaN(v));
    const personIds = weeklyData
      .filter((i) => i.entity_type === 'person')
      .map((i) => Number(i.entity_id))
      .filter((v) => !Number.isNaN(v));
    const songIds = weeklyData
      .filter((i) => i.entity_type === 'song')
      .map((i) => Number(i.entity_id))
      .filter((v) => !Number.isNaN(v));

    const [movies, persons, songs] = await Promise.all([
      getMoviesByIds(movieIds),
      getPersonsByIds(personIds),
      getSongsByIds(songIds)
    ]);

    setWeeklyItems({
      movie: movies.data || [],
      person: persons.data || [],
      song: songs.data || []
    });

    setLoading(false);
  };

  const weeklyByType = (type) => weekly.filter((item) => item.entity_type === type);

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <SeoHead title="Trending - MetaMovies+" description="Weekly trending movies, people, and songs." />
      <div className="max-w-2xl mx-auto px-4 pb-10 pt-6">
        <h1 className="text-2xl font-bold">Trending This Week</h1>
        <p className="text-sm text-gray-400 mt-2">Week starting {weekStart}</p>

        {loading ? (
          <p className="py-6">Loading...</p>
        ) : (
          <>
            <section className="py-6">
              <h2 className="text-lg font-semibold mb-3">Movies</h2>
              <div className="grid grid-cols-2 gap-3">
                {weeklyByType('movie').map((item) => {
                  const movie = weeklyItems.movie.find((m) => m.id === item.entity_id);
                  if (!movie) return null;
                  return (
                    <button key={`movie-${item.id}`} className="text-left" onClick={() => navigate(`/movie/${movie.id}`)}>
                      <div className="relative aspect-[2/3] rounded-md overflow-hidden bg-[#1a1a1a] border border-gray-800">
                        <img loading="lazy" src={movie.poster_url || movie.backdrop_url} alt={movie.title} className="w-full h-full object-cover" />
                        <div className="absolute bottom-2 left-2 text-xs bg-black/70 px-2 py-1 rounded">
                          Score {item.score}
                        </div>
                      </div>
                      <p className="mt-2 text-sm font-medium truncate">{movie.title}</p>
                    </button>
                  );
                })}
                {weeklyByType('movie').length === 0 && (
                  <div className="col-span-2 text-sm text-gray-400">No weekly data yet.</div>
                )}
              </div>
            </section>

            <section className="py-6">
              <h2 className="text-lg font-semibold mb-3">People</h2>
              <div className="space-y-2">
                {weeklyByType('person').map((item) => {
                  const person = weeklyItems.person.find((p) => p.id === item.entity_id);
                  if (!person) return null;
                  return (
                    <button key={`person-${item.id}`} className="w-full flex items-center gap-3 text-left bg-[#1a1a1a] rounded-md p-3 border border-gray-800" onClick={() => navigate(`/person/${person.id}`)}>
                      <div className="w-10 h-10 rounded-full bg-[#2a2a2a] flex items-center justify-center text-xs">
                        {person.name?.[0] || '?'}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{person.name}</p>
                        <p className="text-xs text-gray-400">Score {item.score}</p>
                      </div>
                    </button>
                  );
                })}
                {weeklyByType('person').length === 0 && (
                  <div className="text-sm text-gray-400">No weekly data yet.</div>
                )}
              </div>
            </section>

            <section className="py-6">
              <h2 className="text-lg font-semibold mb-3">Songs</h2>
              <div className="space-y-2">
                {weeklyByType('song').map((item) => {
                  const song = weeklyItems.song.find((s) => s.id === item.entity_id);
                  if (!song) return null;
                  return (
                    <button key={`song-${item.id}`} className="w-full flex items-center gap-3 text-left bg-[#1a1a1a] rounded-md p-3 border border-gray-800" onClick={() => navigate(`/songs/${song.id}`)}>
                      <div className="w-12 h-12 rounded-md bg-[#2a2a2a]" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{song.title}</p>
                        <p className="text-xs text-gray-400">Score {item.score}</p>
                      </div>
                    </button>
                  );
                })}
                {weeklyByType('song').length === 0 && (
                  <div className="text-sm text-gray-400">No weekly data yet.</div>
                )}
              </div>
            </section>
          </>
        )}

        <section className="py-6">
          <h2 className="text-lg font-semibold mb-3">Most Watchlisted</h2>
          <div className="grid grid-cols-2 gap-3">
            {watchlisted.map((entry) => (
              <button key={`watch-${entry.movie?.id}`} className="text-left" onClick={() => navigate(`/movie/${entry.movie?.id}`)}>
                <div className="aspect-[2/3] rounded-md overflow-hidden bg-[#1a1a1a] border border-gray-800">
                  <img loading="lazy" src={entry.movie?.poster_url || entry.movie?.backdrop_url} alt={entry.movie?.title} className="w-full h-full object-cover" />
                </div>
                <p className="mt-2 text-sm font-medium truncate">{entry.movie?.title}</p>
                <p className="text-xs text-gray-400">{entry.count} watchlists</p>
              </button>
            ))}
            {watchlisted.length === 0 && (
              <div className="col-span-2 text-sm text-gray-400">No watchlist data yet.</div>
            )}
          </div>
        </section>

        <section className="py-6">
          <h2 className="text-lg font-semibold mb-3">Most Searched</h2>
          <div className="space-y-2">
            {mostSearched.map((item) => (
              <div key={item.query} className="bg-[#1a1a1a] border border-gray-800 rounded-md p-3 flex items-center justify-between">
                <span className="text-sm">{item.query}</span>
                <span className="text-xs text-gray-400">{item.count} searches</span>
              </div>
            ))}
            {mostSearched.length === 0 && (
              <div className="text-sm text-gray-400">No search data yet.</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Trending;
