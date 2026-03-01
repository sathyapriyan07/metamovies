import { useEffect, useRef, useState } from 'react';
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
  const [activeTab, setActiveTab] = useState('overview');
  const sectionRefs = useRef({});

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
      const personIds = Array.from(new Set([...castList.map((c) => c.id), ...crewList.map((c) => c.id)]));
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
      <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-black text-zinc-100">
        <div className="max-w-5xl mx-auto px-4 pt-12 pb-10">Loading...</div>
      </div>
    );
  }

  if (!series) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-black text-zinc-100">
        <div className="max-w-5xl mx-auto px-4 pt-12 pb-10">Series not found</div>
      </div>
    );
  }

  const watchPlatforms = series.watch_links ? Object.entries(series.watch_links).filter(([, url]) => url) : [];
  const platformLogos = {
    prime: '/logos/prime.png',
    hotstar: '/logos/hotstar.png',
    zee5: '/logos/zee5.png',
    netflix: 'https://www.freepnglogos.com/uploads/netflix-logo-history-32.png',
    sony_liv: '/logos/sonyliv.png'
  };
  const bullet = '\u2022';
  const year = series.first_air_date?.split('-')[0];
  const metaLine = [year, series.number_of_seasons ? `${series.number_of_seasons} Seasons` : null, series.genres?.join(` ${bullet} `)]
    .filter(Boolean)
    .join(` ${bullet} `);
  const topCast = cast.slice(0, 3);

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'cast', label: 'Cast' },
    { key: 'media', label: 'Trailers & Clips' },
    { key: 'reviews', label: 'Reviews' },
    { key: 'watchlist', label: 'Watchlist' }
  ];

  const scrollToSection = (tabKey) => {
    setActiveTab(tabKey);
    const section = sectionRefs.current[tabKey];
    if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-black text-zinc-100">
      <SeoHead title={`${series.name} - Series`} description={series.overview?.slice(0, 160)} />

      <div className="max-w-5xl mx-auto px-4 pt-8 pb-12 space-y-6">
        <section className="space-y-3">
          <div className="backdrop-blur-sm">
            <div className="min-h-[48px]">
              {series.title_logo_url && !series.use_text_title ? (
                <img src={series.title_logo_url} alt={series.name} className="max-h-12 w-auto object-contain max-w-full" />
              ) : (
                <h1 className="text-2xl md:text-3xl font-display font-semibold tracking-wide">{series.name}</h1>
              )}
            </div>
            <p className="text-sm text-zinc-400 mt-2">CBFC: U/A 16+ {metaLine ? `${bullet} ${metaLine}` : ''}</p>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => scrollToSection(tab.key)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm border transition ${
                  activeTab === tab.key
                    ? 'bg-amber-600/20 border-amber-500 text-amber-400'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4">
            <div className="rounded-xl overflow-hidden shadow-lg bg-zinc-900/80 backdrop-blur">
              {series.poster_url ? (
                <img src={series.poster_url} alt={series.name} className="w-full aspect-[2/3] object-cover" />
              ) : (
                <div className="w-full aspect-[2/3] bg-zinc-800" />
              )}
            </div>
            <div className="rounded-xl overflow-hidden shadow-lg bg-zinc-900/80 min-h-[220px]">
              {series.backdrop_url ? (
                <img src={series.backdrop_url} alt={series.name} className="w-full h-full min-h-[220px] object-cover" />
              ) : (
                <div className="w-full h-full min-h-[220px] bg-zinc-800" />
              )}
            </div>
          </div>

          <div className="text-sm text-zinc-300">
            <span className="text-amber-400 font-medium">
              Rating: {series.tmdb_rating ? `${Number(series.tmdb_rating).toFixed(1)}/10` : 'NR'}
            </span>
            {series.imdb_rating ? (
              <>
                <span className="mx-2 text-zinc-500">{bullet}</span>
                <span className="text-amber-400">IMDb {series.imdb_rating} &gt;</span>
              </>
            ) : null}
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-zinc-800/80 backdrop-blur rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">Where to Watch</h3>
              <span className="text-zinc-400">⌄</span>
            </div>
            {watchPlatforms.length > 0 ? (
              <div className="flex gap-3 overflow-x-auto no-scrollbar">
                {watchPlatforms.slice(0, 4).map(([platform, url]) => {
                  const logoSrc = platformLogos[platform];
                  return (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-lg bg-zinc-900 flex items-center justify-center flex-shrink-0"
                    >
                      {logoSrc ? (
                        <img src={logoSrc} alt={platform} className="w-8 h-8 object-contain" />
                      ) : (
                        <span className="text-[10px] text-zinc-300 capitalize">{platform.replace('_', ' ')}</span>
                      )}
                    </a>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-zinc-400">Streaming links unavailable.</p>
            )}
          </div>

          <div className="bg-zinc-800/80 backdrop-blur rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">Cast Preview</h3>
              <span className="text-zinc-400">⌄</span>
            </div>
            {topCast.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {topCast.map((member) => (
                  <button
                    key={`cast-preview-${member.id}`}
                    className="text-left"
                    onClick={() => member.person_id && navigate(`/person/${member.person_id}`)}
                  >
                    {member.profile_path ? (
                      <img
                        loading="lazy"
                        src={getImageUrl(member.profile_path, 'w185')}
                        alt={member.name}
                        className="w-full aspect-square rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-full aspect-square rounded-lg bg-zinc-700 flex items-center justify-center text-xs">
                        {member.name?.[0] || '?'}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-400">Cast data unavailable.</p>
            )}
          </div>
        </section>

        <section
          ref={(el) => {
            sectionRefs.current.overview = el;
          }}
          className="bg-zinc-800/80 backdrop-blur rounded-2xl p-5 space-y-4"
        >
          <h2 className="font-display text-lg">Overview</h2>
          {series.overview ? (
            <div>
              <p className={`text-zinc-400 leading-relaxed ${overviewExpanded ? '' : 'line-clamp-4'}`}>{series.overview}</p>
              {series.overview.length > 160 && (
                <button onClick={() => setOverviewExpanded(!overviewExpanded)} className="text-amber-400 text-sm mt-2">
                  {overviewExpanded ? 'Read Less' : 'Read More'}
                </button>
              )}
            </div>
          ) : (
            <p className="text-sm text-zinc-400">No storyline available.</p>
          )}
          <div
            ref={(el) => {
              sectionRefs.current.watchlist = el;
            }}
            className="flex flex-wrap gap-3 pt-2"
          >
            <button
              className="border border-amber-500 text-amber-400 rounded-full px-5 py-2 hover:bg-amber-500 hover:text-black transition"
              onClick={() => navigate('/watchlist')}
            >
              Already Watched
            </button>
            <button
              className="border border-amber-500 text-amber-400 rounded-full px-5 py-2 hover:bg-amber-500 hover:text-black transition"
              onClick={() => navigate('/watchlist')}
            >
              Want to Watch
            </button>
          </div>
        </section>

        {cast.length > 0 && (
          <section
            ref={(el) => {
              sectionRefs.current.cast = el;
            }}
            className="mt-8 pt-6 border-t border-zinc-800 space-y-4"
          >
            <h2 className="text-lg font-semibold">Cast</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {cast.map((member) => (
                <button
                  key={member.id}
                  className="text-left"
                  onClick={() => member.person_id && navigate(`/person/${member.person_id}`)}
                >
                  {member.profile_path ? (
                    <img
                      loading="lazy"
                      src={getImageUrl(member.profile_path, 'w185')}
                      alt={member.name}
                      className="w-full aspect-square rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-full aspect-square rounded-xl bg-zinc-800 flex items-center justify-center">{member.name?.[0] || '?'}</div>
                  )}
                  <div className="mt-2 text-sm font-medium truncate">{member.name}</div>
                  <div className="text-xs text-zinc-400 truncate">{member.character}</div>
                </button>
              ))}
            </div>
          </section>
        )}

        {crew.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Crew</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {crew.map((member) => (
                <button
                  key={`crew-${member.credit_id}`}
                  className="text-left"
                  onClick={() => member.person_id && navigate(`/person/${member.person_id}`)}
                >
                  {member.profile_path ? (
                    <img
                      loading="lazy"
                      src={getImageUrl(member.profile_path, 'w185')}
                      alt={member.name}
                      className="w-full aspect-square rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-full aspect-square rounded-xl bg-zinc-800 flex items-center justify-center">{member.name?.[0] || '?'}</div>
                  )}
                  <div className="mt-2 text-sm font-medium truncate">{member.name}</div>
                  <div className="text-xs text-zinc-400 truncate">{member.job}</div>
                </button>
              ))}
            </div>
          </section>
        )}

        <section
          ref={(el) => {
            sectionRefs.current.reviews = el;
          }}
          className="bg-zinc-800/80 border border-zinc-700 rounded-2xl p-5"
        >
          <h2 className="text-lg font-semibold mb-2">Reviews</h2>
          <p className="text-sm text-zinc-400">Series reviews are not available yet.</p>
        </section>

        <section
          ref={(el) => {
            sectionRefs.current.media = el;
          }}
          className="space-y-3"
        >
          <h2 className="text-lg font-semibold">Seasons</h2>
          <div className="space-y-4">
            {seasons.map((season) => {
              const seasonEpisodes = episodesBySeason[season.id] || [];
              const visibleCount = visibleCounts[season.id] ?? 3;
              const visibleEpisodes = seasonEpisodes.slice(0, visibleCount);
              return (
                <div key={season.id} className="bg-zinc-800/80 border border-zinc-700 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{season.name || `Season ${season.season_number}`}</p>
                      <p className="text-xs text-zinc-400">{season.air_date || 'Unknown date'}</p>
                    </div>
                    <span className="text-xs text-zinc-400">{season.episode_count || 0} episodes</span>
                  </div>
                  <div className="mt-3 space-y-2">
                    {visibleEpisodes.map((ep) => {
                      const dbEpisode = dbEpisodesBySeason[season.id]?.get(ep.episode_number);
                      return (
                        <div key={ep.id} className="flex gap-3 py-3 border-b border-zinc-700">
                          {ep.still_path ? (
                            <img src={getImageUrl(ep.still_path, 'w300')} alt={ep.name} className="w-24 h-16 object-cover rounded-md flex-shrink-0" />
                          ) : (
                            <div className="w-24 h-16 rounded-md bg-zinc-700" />
                          )}
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {ep.episode_number}. {ep.name}
                            </p>
                            {ep.runtime ? <p className="text-xs text-zinc-400">{ep.runtime}m</p> : null}
                            {ep.overview && <p className="text-xs text-zinc-400 md:line-clamp-3">{ep.overview}</p>}
                            {dbEpisode?.watch_link && (
                              <a
                                href={dbEpisode.watch_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-black bg-amber-500 px-3 py-1 rounded-md w-fit"
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
                        className="text-amber-400 text-sm mt-3"
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
                        className="text-amber-400 text-sm mt-3"
                      >
                        Show fewer episodes
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            {seasons.length === 0 && <div className="text-sm text-zinc-400">No seasons found.</div>}
          </div>
        </section>
      </div>
    </div>
  );
};

export default SeriesDetail;
