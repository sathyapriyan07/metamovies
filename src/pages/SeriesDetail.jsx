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
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedEpisode, setExpandedEpisode] = useState(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [currentEmbed, setCurrentEmbed] = useState('');

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
      const castList = details?.credits?.cast?.slice(0, 20) || [];
      const crewList = details?.credits?.crew?.slice(0, 20) || [];
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

  const openPlayer = (seriesId, seasonNumber, episodeNumber) => {
    navigate(`/watch/tv/${seriesId}/${seasonNumber}/${episodeNumber}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-zinc-100">
        <div className="px-4 pt-12 pb-10">Loading...</div>
      </div>
    );
  }

  if (!series) {
    return (
      <div className="min-h-screen bg-black text-zinc-100">
        <div className="px-4 pt-12 pb-10">Series not found</div>
      </div>
    );
  }

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'cast', label: 'Cast' },
    { key: 'crew', label: 'Crew' },
    { key: 'seasons', label: 'Seasons' },
    { key: 'related', label: 'Related' }
  ];

  return (
    <div className="min-h-screen bg-black text-zinc-100 pb-20">
      <SeoHead title={`${series.name} - Series`} description={series.overview?.slice(0, 160)} />

      {/* Hero Image */}
      {series.backdrop_url && (
        <div className="relative w-full h-[60vh] overflow-hidden">
          <img
            src={series.backdrop_url}
            alt={series.name}
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        </div>
      )}

      {/* Title Section */}
      <div className="px-4 mt-4 space-y-2">
        {series.title_logo_url && !series.use_text_title ? (
          <img
            src={series.title_logo_url}
            alt={series.name}
            className="max-h-14 object-contain mb-2"
          />
        ) : (
          <h1 className="text-xl font-semibold tracking-tight">{series.name}</h1>
        )}
        {series.imdb_rating && (
          <span className="inline-block bg-yellow-500 text-black px-2 py-1 rounded text-xs font-semibold">
            IMDb {series.imdb_rating}
          </span>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="px-4 mt-5 flex gap-6 overflow-x-auto border-b border-zinc-800 pb-3 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`whitespace-nowrap text-sm relative pb-3 transition ${
              activeTab === tab.key
                ? 'text-yellow-400 font-medium after:absolute after:-bottom-[3px] after:left-0 after:h-[2px] after:w-full after:bg-yellow-400'
                : 'text-zinc-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="px-4 mt-5 space-y-5">
      {activeTab === 'overview' && (
        <div className="space-y-5">
          {/* Description */}
          {series.overview && (
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-zinc-200">Description</h3>
              <p className="text-sm leading-relaxed text-zinc-300">{series.overview}</p>
            </div>
          )}

          {/* First Air Date */}
          {series.first_air_date && (
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-zinc-200">First Aired</h3>
              <p className="text-sm text-zinc-400">{series.first_air_date}</p>
            </div>
          )}

          {/* Seasons */}
          {series.number_of_seasons && (
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-zinc-200">Seasons</h3>
              <p className="text-sm text-zinc-400">{series.number_of_seasons} seasons</p>
            </div>
          )}

          {/* Genre */}
          {series.genres && (
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-zinc-200">Genre</h3>
              <p className="text-sm text-zinc-400">{Array.isArray(series.genres) ? series.genres.join(', ') : series.genres}</p>
            </div>
          )}

          {/* Watch Platforms */}
          {series.watch_links && Object.keys(series.watch_links).length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-zinc-200">Where to Watch</h3>
              <div className="flex gap-3 overflow-x-auto scrollbar-hide">
                {Object.entries(series.watch_links).filter(([, url]) => url).map(([platform, url]) => {
                  const platformLogos = {
                    prime: '/logos/prime.png',
                    hotstar: '/logos/hotstar.png',
                    zee5: '/logos/zee5.png',
                    netflix: 'https://www.freepnglogos.com/uploads/netflix-logo-history-32.png',
                    sony_liv: '/logos/sonyliv.png'
                  };
                  const logoSrc = platformLogos[platform];
                  return (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-14 h-14 rounded-lg bg-zinc-900 flex items-center justify-center flex-shrink-0 hover:bg-zinc-800 transition"
                    >
                      {logoSrc ? (
                        <img src={logoSrc} alt={platform} className="w-9 h-9 object-contain" />
                      ) : (
                        <span className="text-[10px] text-zinc-300 capitalize">{platform.replace('_', ' ')}</span>
                      )}
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button className="bg-yellow-400 text-black px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-yellow-500 transition">
              + Add to Watchlist
            </button>
            <button className="bg-zinc-800 text-zinc-100 px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-zinc-700 transition">
              Share
            </button>
          </div>
        </div>
      )}

      {activeTab === 'cast' && (
        <div className="space-y-4">
          {cast.length > 0 ? (
            <div className="space-y-3">
              {cast.map((member) => (
                <button
                  key={`cast-${member.id}`}
                  className="w-full flex items-center gap-3 text-left"
                  onClick={() => member.person_id && navigate(`/person/${member.person_id}`)}
                >
                  {member.profile_path ? (
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-800 flex-shrink-0">
                      <img
                        loading="lazy"
                        src={getImageUrl(member.profile_path, 'w185')}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-xs flex-shrink-0">
                      {member.name?.[0] || '?'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{member.name}</p>
                    <p className="text-xs text-zinc-400 truncate">{member.character}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-400">No cast information available.</p>
          )}
        </div>
      )}

      {activeTab === 'crew' && (
        <div className="space-y-4">
          {crew.length > 0 ? (
            <div className="space-y-3">
              {crew.map((member) => (
                <button
                  key={`crew-${member.credit_id}`}
                  className="w-full flex items-center gap-3 text-left"
                  onClick={() => member.person_id && navigate(`/person/${member.person_id}`)}
                >
                  {member.profile_path ? (
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-800 flex-shrink-0">
                      <img
                        loading="lazy"
                        src={getImageUrl(member.profile_path, 'w185')}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-xs flex-shrink-0">
                      {member.name?.[0] || '?'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{member.name}</p>
                    <p className="text-xs text-zinc-400 truncate">{member.job}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-400">Crew information not available.</p>
          )}
        </div>
      )}

      {activeTab === 'seasons' && (
        <div className="space-y-6">
          {seasons.map((season) => {
            const seasonEpisodes = episodesBySeason[season.id] || [];
            const visibleCount = visibleCounts[season.id] ?? 5;
            const visibleEpisodes = seasonEpisodes.slice(0, visibleCount);
            return (
              <div key={season.id} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold">{season.name || `Season ${season.season_number}`}</h3>
                    <p className="text-xs text-zinc-400 mt-1">{season.episode_count || 0} episodes</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {visibleEpisodes.map((ep) => {
                    const dbEpisode = dbEpisodesBySeason[season.id]?.get(ep.episode_number);
                    const episodeKey = `${season.id}-${ep.episode_number}`;
                    const isExpanded = expandedEpisode === episodeKey;
                    return (
                      <div key={ep.id} className="space-y-3 border-b border-zinc-800 pb-4 last:border-0">
                        {/* Thumbnail */}
                        {ep.still_path && (
                          <div className="w-full aspect-video rounded-lg overflow-hidden bg-zinc-800">
                            <img
                              src={getImageUrl(ep.still_path, 'w300')}
                              alt={ep.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                        )}

                        {/* Episode Info */}
                        <div className="space-y-1">
                          <h4 className="text-sm font-semibold text-white">
                            {ep.episode_number}. {ep.name}
                          </h4>
                          <p className="text-xs text-zinc-400">
                            {ep.runtime ? `${ep.runtime} min` : ''}
                            {ep.runtime && ep.air_date ? ' • ' : ''}
                            {ep.air_date || ''}
                          </p>
                        </div>

                        {/* Overview */}
                        {ep.overview ? (
                          <div>
                            <p className={`text-sm text-zinc-300 leading-relaxed ${isExpanded ? '' : 'line-clamp-3'}`}>
                              {ep.overview}
                            </p>
                            {ep.overview.length > 150 && (
                              <button
                                className="text-xs text-yellow-400 mt-1 hover:underline"
                                onClick={() => setExpandedEpisode(isExpanded ? null : episodeKey)}
                              >
                                {isExpanded ? 'Show Less' : 'Read More'}
                              </button>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-zinc-500 italic">No overview available.</p>
                        )}

                        {/* Watch Button */}
                        {dbEpisode?.embed_link && (
                          <button
                            onClick={() => {
                              const season = seasons.find(s => s.id === dbEpisode.season_id);
                              openPlayer(series.id, season?.season_number, ep.episode_number);
                            }}
                            className="mt-3 text-xs bg-yellow-500 text-black px-3 py-2 rounded-full font-medium hover:bg-yellow-400 transition"
                          >
                            ▶ Watch Episode
                          </button>
                        )}
                      </div>
                    );
                  })}
                  {seasonEpisodes.length > visibleCount && (
                    <button
                      onClick={() =>
                        setVisibleCounts((prev) => ({
                          ...prev,
                          [season.id]: visibleCount + 5
                        }))
                      }
                      className="text-sm text-yellow-400 hover:underline"
                    >
                      Load more episodes
                    </button>
                  )}
                  {seasonEpisodes.length > 5 && visibleCount >= seasonEpisodes.length && (
                    <button
                      onClick={() =>
                        setVisibleCounts((prev) => ({
                          ...prev,
                          [season.id]: 5
                        }))
                      }
                      className="text-sm text-yellow-400 hover:underline"
                    >
                      Show fewer episodes
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {seasons.length === 0 && <p className="text-sm text-zinc-400">No seasons found.</p>}
        </div>
      )}

      {activeTab === 'related' && (
        <div className="space-y-4">
          <p className="text-sm text-zinc-400">Related series not available yet.</p>
        </div>
      )}
      </div>
    </div>
  );
};

export default SeriesDetail;
