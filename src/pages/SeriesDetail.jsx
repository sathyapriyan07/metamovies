import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SeoHead from '../components/SeoHead';
import { getSeriesById, getSeasonsBySeries, getEpisodesBySeries, getPersonsByTmdbIds } from '../services/supabase';
import { getSeriesDetails, getSeasonDetails, getImageUrl } from '../services/tmdb';

const SeriesDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [series, setSeries] = useState(null);
  const [seasons, setSeasons] = useState([]);
  const [episodesBySeason, setEpisodesBySeason] = useState({});
  const [dbEpisodesBySeason, setDbEpisodesBySeason] = useState({});
  const [visibleCounts, setVisibleCounts] = useState({});
  const [cast, setCast] = useState([]);
  const [crew, setCrew] = useState([]);
  const [overviewExpanded, setOverviewExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSeries();
  }, [id]);

  const loadSeries = async () => {
    setLoading(true);
    const [{ data: seriesData }, { data: seasonsData }, { data: dbEpisodes }] = await Promise.all([
      getSeriesById(id),
      getSeasonsBySeries(id),
      getEpisodesBySeries(id)
    ]);
    setSeries(seriesData);
    setSeasons(seasonsData || []);
    const dbEpisodeMap = {};
    (dbEpisodes || []).forEach((ep) => {
      if (!dbEpisodeMap[ep.season_id]) {
        dbEpisodeMap[ep.season_id] = new Map();
      }
      dbEpisodeMap[ep.season_id].set(ep.episode_number, ep);
    });
    setDbEpisodesBySeason(dbEpisodeMap);
    const episodeMap = {};
    if (seriesData?.tmdb_id) {
      const details = await getSeriesDetails(seriesData.tmdb_id);
      const castList = details?.credits?.cast?.slice(0, 12) || [];
      const crewList = details?.credits?.crew?.slice(0, 12) || [];
      const personIds = Array.from(new Set([
        ...castList.map((c) => c.id),
        ...crewList.map((c) => c.id)
      ]));
      const { data: persons } = await getPersonsByTmdbIds(personIds);
      const personMap = new Map((persons || []).map((p) => [p.tmdb_id, p]));
      setCast(castList.map((c) => ({ ...c, person_id: personMap.get(c.id)?.id || null })));
      setCrew(crewList.map((c) => ({ ...c, person_id: personMap.get(c.id)?.id || null })));
      for (const season of seasonsData || []) {
        const seasonDetails = await getSeasonDetails(seriesData.tmdb_id, season.season_number);
        episodeMap[season.id] = seasonDetails?.episodes || [];
      }
    }
    setEpisodesBySeason(episodeMap);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-white">
        <div className="max-w-2xl mx-auto px-4 pt-12 pb-10">Loading...</div>
      </div>
    );
  }

  if (!series) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-white">
        <div className="max-w-2xl mx-auto px-4 pt-12 pb-10">Series not found</div>
      </div>
    );
  }

  const watchPlatforms = series.watch_links
    ? Object.entries(series.watch_links).filter(([, url]) => url)
    : [];
  const platformLogos = {
    prime: '/logos/prime.png',
    hotstar: '/logos/hotstar.png',
    zee5: '/logos/zee5.png',
    netflix: 'https://www.freepnglogos.com/uploads/netflix-logo-history-32.png',
    sony_liv: '/logos/sonyliv.png',
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white">
      <SeoHead title={`${series.name} - Series`} description={series.overview?.slice(0, 160)} />
      <div className="max-w-2xl mx-auto px-4 pt-10 pb-10 space-y-6">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
          <div className="flex gap-4 items-start">
            <img
              src={series.poster_url}
              alt={series.name}
              className="w-28 aspect-[2/3] object-cover rounded-xl shadow-md flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              {series.title_logo_url && !series.use_text_title ? (
                <img
                  src={series.title_logo_url}
                  alt={series.name}
                  className="max-h-12 w-auto object-contain max-w-full mb-2"
                />
              ) : (
                <h1 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">{series.name}</h1>
              )}
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-snug flex flex-wrap gap-x-2">
              {series.first_air_date?.split('-')[0] ? `${series.first_air_date.split('-')[0]} • ` : ''}
              {series.number_of_seasons ? `${series.number_of_seasons} Seasons` : ''}
              {series.genres?.length ? ` • ${series.genres.join(' • ')}` : ''}
              </p>
              {(series.tmdb_rating || series.imdb_rating) && (
                <div className="flex items-center gap-3 mt-3">
                  {series.tmdb_rating && (
                    <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#F5C518] text-black text-sm font-semibold">
                      {Number(series.tmdb_rating).toFixed(1)}
                    </span>
                  )}
                  {series.imdb_rating && (
                    <span className="bg-[#F5C518] text-black font-bold px-3 py-1 rounded-lg text-xs">
                      IMDb {series.imdb_rating}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold dark:text-white">Storyline</h2>
          {series.overview ? (
            <div>
              <p
                className={`text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed transition-all duration-300 ease-in-out ${
                  overviewExpanded ? '' : 'line-clamp-4'
                }`}
              >
                {series.overview}
              </p>
              {series.overview.length > 160 && (
                <button
                  onClick={() => setOverviewExpanded(!overviewExpanded)}
                  className="text-yellow-500 text-sm mt-2"
                >
                  {overviewExpanded ? 'Show less' : 'Load more'}
                </button>
              )}
            </div>
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">No storyline available.</p>
          )}
        </section>

        {watchPlatforms.length > 0 && (
          <section className="py-6">
            <h2 className="text-lg font-semibold mb-4">Watch On</h2>
            <div className="flex gap-5 overflow-x-auto pb-2 no-scrollbar">
              {watchPlatforms.map(([platform, url]) => {
                const logoSrc = platformLogos[platform];
                return (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-w-[80px] flex flex-col items-center"
                  >
                    <div className="w-16 h-16 bg-white dark:bg-zinc-900 rounded-xl flex items-center justify-center shadow-md hover:scale-105 transition border border-zinc-200 dark:border-zinc-800">
                      {logoSrc ? (
                        <img
                          src={logoSrc}
                          alt={platform}
                          className="w-10 h-10 object-contain"
                        />
                      ) : (
                        <span className="text-xs text-zinc-700 dark:text-zinc-200 capitalize">
                          {platform.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                  </a>
                );
              })}
            </div>
          </section>
        )}

        {cast.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Cast</h2>
              <button className="text-yellow-500 text-sm">See All</button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {cast.map((member) => (
                <button
                  key={member.id}
                  className="min-w-[92px] text-center"
                  onClick={() => member.person_id && navigate(`/person/${member.person_id}`)}
                >
                  {member.profile_path ? (
                    <img
                      loading="lazy"
                      src={getImageUrl(member.profile_path, 'w185')}
                      alt={member.name}
                      className="w-20 h-20 rounded-full object-cover mx-auto"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center mx-auto text-xs text-zinc-600 dark:text-zinc-200">
                      {member.name?.[0] || '?'}
                    </div>
                  )}
                  <div className="mt-2 text-sm font-medium">{member.name}</div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">{member.character}</div>
                </button>
              ))}
            </div>
          </section>
        )}

        {crew.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Crew</h2>
              <button className="text-yellow-500 text-sm">See All</button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {crew.map((member) => (
                <button
                  key={`crew-${member.credit_id}`}
                  className="min-w-[92px] text-center"
                  onClick={() => member.person_id && navigate(`/person/${member.person_id}`)}
                >
                  {member.profile_path ? (
                    <img
                      loading="lazy"
                      src={getImageUrl(member.profile_path, 'w185')}
                      alt={member.name}
                      className="w-20 h-20 rounded-full object-cover mx-auto"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center mx-auto text-xs text-zinc-600 dark:text-zinc-200">
                      {member.name?.[0] || '?'}
                    </div>
                  )}
                  <div className="mt-2 text-sm font-medium">{member.name}</div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">{member.job}</div>
                </button>
              ))}
            </div>
          </section>
        )}

        <section className="space-y-3">
          <h2 className="text-lg font-semibold mb-3">Seasons</h2>
          <div className="space-y-4">
            {seasons.map((season) => {
              const seasonEpisodes = episodesBySeason[season.id] || [];
              const visibleCount = visibleCounts[season.id] ?? 3;
              const visibleEpisodes = seasonEpisodes.slice(0, visibleCount);
              return (
                <div key={season.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{season.name || `Season ${season.season_number}`}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{season.air_date || 'Unknown date'}</p>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{season.episode_count || 0} episodes</span>
                  </div>
                  <div className="mt-3 space-y-2">
                    {visibleEpisodes.map((ep) => {
                      const dbEpisode = dbEpisodesBySeason[season.id]?.get(ep.episode_number);
                      return (
                        <div key={ep.id} className="flex gap-3 py-3 border-b border-zinc-200 dark:border-zinc-800">
                          {ep.still_path ? (
                            <img
                              src={getImageUrl(ep.still_path, 'w300')}
                              alt={ep.name}
                              className="w-24 h-16 object-cover rounded-md flex-shrink-0"
                            />
                          ) : (
                            <div className="w-24 h-16 rounded-md bg-zinc-200 dark:bg-zinc-800" />
                          )}
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {ep.episode_number}. {ep.name}
                            </p>
                            {ep.runtime ? <p className="text-xs text-gray-500 dark:text-gray-400">{ep.runtime}m</p> : null}
                            {ep.overview && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 md:line-clamp-3">
                                {ep.overview}
                              </p>
                            )}
                            {dbEpisode?.watch_link && (
                              <a
                                href={dbEpisode.watch_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-black bg-[#F5C518] px-3 py-1 rounded-md w-fit"
                              >
                                Watch
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {seasonEpisodes.length > visibleCount && (
                      <button
                        onClick={() =>
                          setVisibleCounts((prev) => ({
                            ...prev,
                            [season.id]: visibleCount + 3
                          }))
                        }
                        className="text-yellow-500 dark:text-yellow-400 text-sm mt-3"
                      >
                        Load more episodes
                      </button>
                    )}
                    {seasonEpisodes.length > 3 && visibleCount >= seasonEpisodes.length && (
                      <button
                        onClick={() =>
                          setVisibleCounts((prev) => ({
                            ...prev,
                            [season.id]: 3
                          }))
                        }
                        className="text-yellow-500 dark:text-yellow-400 text-sm mt-3"
                      >
                        Show fewer episodes
                      </button>
                    )}
                  </div>
                </div>
            );
            })}
            {seasons.length === 0 && <div className="text-sm text-gray-400">No seasons found.</div>}
          </div>
        </section>
      </div>
    </div>
  );
};

export default SeriesDetail;
