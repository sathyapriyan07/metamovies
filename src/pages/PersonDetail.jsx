import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getPersonById,
  getFeaturedVideosByPerson,
  getPageMeta,
  recordViewEvent,
  resolveSlug,
  followEntity,
  unfollowEntity,
  getFollowStatus
} from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import SeoHead from '../components/SeoHead';

const PersonDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [person, setPerson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [videosLoading, setVideosLoading] = useState(true);
  const [featuredVideos, setFeaturedVideos] = useState([]);
  const [showFullBio, setShowFullBio] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [pageMeta, setPageMeta] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    loadPerson();
  }, [id]);

  const loadPerson = async () => {
    setLoading(true);
    setVideosLoading(true);
    let resolvedId = id;
    if (!/^\d+$/.test(id)) {
      const { data: slugData } = await resolveSlug(id, 'person');
      resolvedId = slugData?.entity_id || id;
    }
    const [{ data }, { data: videos }] = await Promise.all([
      getPersonById(resolvedId),
      getFeaturedVideosByPerson(resolvedId, 8)
    ]);
    setPerson(data);
    setFeaturedVideos(videos || []);
    if (data?.id) {
      await recordViewEvent('person', data.id, user?.id || null);
      if (user) {
        const status = await getFollowStatus(user.id, 'person', data.id);
        setIsFollowing(status);
      }
      const { data: meta } = await getPageMeta('person', String(data.id));
      setPageMeta(meta || null);
    }
    setLoading(false);
    setVideosLoading(false);
  };

  const toggleFollow = async () => {
    if (!user) return navigate('/login');
    if (isFollowing) {
      await unfollowEntity(user.id, 'person', person.id);
      setIsFollowing(false);
    } else {
      await followEntity(user.id, 'person', person.id);
      setIsFollowing(true);
    }
  };

  const movieCredits = useMemo(() => {
    if (!person) return [];
    return [
      ...(person.cast_roles?.filter((c) => c.movie)?.map((c) => ({
        ...(c.movie || {}),
        type: 'movie',
        role: c.character,
        year: c.movie?.release_date?.split('-')[0]
      })) || []),
      ...(person.crew_roles?.filter((c) => c.movie)?.map((c) => ({
        ...(c.movie || {}),
        type: 'movie',
        role: c.job,
        year: c.movie?.release_date?.split('-')[0]
      })) || [])
    ].sort((a, b) => (b.year || '0').localeCompare(a.year || '0'));
  }, [person]);

  const seriesCredits = useMemo(() => {
    if (!person) return [];
    return [
      ...(person.series_cast_roles?.filter((c) => c.series)?.map((c) => ({
        ...(c.series || {}),
        type: 'series',
        role: c.character,
        year: c.series?.first_air_date?.split('-')[0]
      })) || []),
      ...(person.series_crew_roles?.filter((c) => c.series)?.map((c) => ({
        ...(c.series || {}),
        type: 'series',
        role: c.job,
        year: c.series?.first_air_date?.split('-')[0]
      })) || [])
    ].sort((a, b) => (b.year || '0').localeCompare(a.year || '0'));
  }, [person]);

  const allCredits = useMemo(() => {
    return [...movieCredits, ...seriesCredits].sort((a, b) => (b.year || '0').localeCompare(a.year || '0'));
  }, [movieCredits, seriesCredits]);

  const ageLabel = useMemo(() => {
    if (!person?.birthday) return null;
    const dob = new Date(person.birthday);
    if (Number.isNaN(dob.getTime())) return null;
    const diff = Date.now() - dob.getTime();
    const ageDt = new Date(diff);
    return Math.abs(ageDt.getUTCFullYear() - 1970);
  }, [person?.birthday]);

  const professionLabel = person?.known_for_department ? `Indian ${person.known_for_department.toLowerCase()}` : 'Indian actor';
  const previewMovies = allCredits.slice(0, 3);
  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'movies', label: 'Movies' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-black text-zinc-100">
        <div className="max-w-3xl mx-auto px-4 pt-12 pb-10">Loading...</div>
      </div>
    );
  }
  if (!person) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-black text-zinc-100">
        <div className="max-w-3xl mx-auto px-4 pt-12 pb-10">Person not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-black text-zinc-100">
      <SeoHead
        title={pageMeta?.title || `${person.name} - MetaMovies+`}
        description={pageMeta?.description || person.biography?.slice(0, 160)}
        jsonLd={pageMeta?.jsonld || null}
      />
      <div className="max-w-3xl mx-auto px-4 pt-8 pb-8 space-y-6">
        <section className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-semibold tracking-tight">{person.name}</h1>
              <p className="text-sm text-zinc-400 mt-1">{professionLabel}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              className={`rounded-full px-4 py-2 text-sm border transition ${
                isFollowing ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400' : 'bg-zinc-800 border-zinc-700 text-zinc-300'
              }`}
              onClick={toggleFollow}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm border transition ${
                  activeTab === tab.key
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400'
                    : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative rounded-2xl overflow-hidden mt-4 aspect-[4/5] bg-zinc-800/70 backdrop-blur">
            <img
              loading="lazy"
              src={person.profile_url || 'https://via.placeholder.com/800x1000'}
              alt={person.name}
              className={`w-full h-full object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
            />
            <span className="absolute bottom-3 left-3 text-xs text-zinc-300 bg-black/40 px-2 py-1 rounded">Source: MetaMovies+</span>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-emerald-900/30 rounded-2xl p-5">
              <p className="text-sm text-zinc-400">Age</p>
              <p className="text-xl font-semibold mt-1">{ageLabel ?? 'N/A'}</p>
              <p className="text-sm text-zinc-400 mt-1">{person.birthday || 'Date unknown'}</p>
            </div>

            <div className="bg-emerald-900/30 rounded-2xl p-5">
              <div className="flex items-center">
                <p className="text-sm text-zinc-400">Movies</p>
              </div>
              <div className="flex gap-3 mt-3 overflow-x-auto no-scrollbar">
                {previewMovies.length > 0 ? (
                  previewMovies.map((credit, idx) => (
                    <button
                      key={`preview-${idx}`}
                      onClick={() => navigate(`/${credit.type}/${credit.id}`)}
                      className="w-16 aspect-[2/3] flex-shrink-0 rounded-lg overflow-hidden bg-zinc-800 shadow-md transition-transform duration-300 hover:scale-105"
                    >
                      <img
                        src={credit.poster_url || credit.backdrop_url || 'https://via.placeholder.com/100x150'}
                        alt={credit.title || credit.name}
                        className="w-full h-full object-contain bg-zinc-900"
                      />
                    </button>
                  ))
                ) : (
                  <div className="text-xs text-zinc-400">No credits</div>
                )}
              </div>
            </div>
          </div>
        </section>

        {activeTab === 'overview' && (
          <>
            {person.biography && (
              <section className="bg-emerald-900/30 rounded-2xl p-5 mt-4">
                <div className="flex justify-between items-center">
                  <h2 className="font-display text-lg">Overview</h2>
                  <button
                    onClick={() => setShowFullBio(!showFullBio)}
                    className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300"
                    aria-label={showFullBio ? 'Collapse bio' : 'Expand bio'}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className={`w-4 h-4 transition-transform duration-300 ${showFullBio ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>
                </div>
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showFullBio ? 'max-h-[700px]' : 'max-h-28'}`}>
                  <p className={`text-zinc-300 text-sm leading-relaxed mt-3 ${showFullBio ? '' : 'line-clamp-4'}`}>{person.biography}</p>
                </div>
              </section>
            )}

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">Featured Videos</h2>
              {videosLoading ? (
                <p className="text-zinc-400 text-sm">Loading...</p>
              ) : featuredVideos.length ? (
                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                  {featuredVideos.map((video) => (
                    <a
                      key={video.id}
                      href={video.youtube_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-w-[180px] bg-zinc-800/70 backdrop-blur border border-zinc-700 rounded-xl overflow-hidden block"
                      aria-label={video.title}
                    >
                      <img src={video.thumbnail_url} alt={video.title} className="w-full h-28 object-cover" />
                    </a>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-zinc-400">No featured videos.</div>
              )}
            </section>
          </>
        )}

        {activeTab === 'movies' && (
          <>
            {allCredits.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-lg font-semibold">Known For</h2>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {allCredits.slice(0, 10).map((credit, i) => (
                    <button key={`known-${i}`} className="min-w-[120px] text-left" onClick={() => navigate(`/${credit.type}/${credit.id}`)}>
                      <div className="aspect-[2/3] rounded-xl overflow-hidden bg-zinc-800/70 border border-zinc-700">
                        <img loading="lazy" src={credit.poster_url || credit.backdrop_url} alt={credit.title || credit.name} className="w-full h-full object-cover" />
                      </div>
                      <p className="mt-2 text-sm font-medium truncate">{credit.title || credit.name}</p>
                    </button>
                  ))}
                </div>
              </section>
            )}

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">Filmography</h2>
              <div className="space-y-3">
                {allCredits.map((credit, i) => (
                  <button
                    key={`film-${i}`}
                    className="w-full flex items-center gap-3 text-left bg-zinc-800/70 backdrop-blur rounded-xl p-3 border border-zinc-700"
                    onClick={() => navigate(`/${credit.type}/${credit.id}`)}
                  >
                    <div className="w-12 h-16 rounded-md overflow-hidden bg-zinc-900 shrink-0">
                      <img loading="lazy" src={credit.poster_url || credit.backdrop_url} alt={credit.title || credit.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{credit.title || credit.name}</p>
                      <p className="text-xs text-zinc-400">
                        {credit.year || 'Year'} • {credit.role || 'Role'} • {credit.type === 'series' ? 'Series' : 'Movie'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default PersonDetail;
