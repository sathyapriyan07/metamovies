import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPersonById, getFeaturedVideosByPerson } from '../services/supabase';
import FrostedPlayButton from '../components/FrostedPlayButton';

const PersonDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [person, setPerson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [videosLoading, setVideosLoading] = useState(true);
  const [featuredVideos, setFeaturedVideos] = useState([]);
  const [videoImageErrors, setVideoImageErrors] = useState({});
  const [showFullBio, setShowFullBio] = useState(false);

  useEffect(() => {
    loadPerson();
  }, [id]);

  const loadPerson = async () => {
    setLoading(true);
    setVideosLoading(true);
    const [{ data }, { data: videos }] = await Promise.all([
      getPersonById(id),
      getFeaturedVideosByPerson(id, 8)
    ]);
    setPerson(data);
    setFeaturedVideos(videos || []);
    setLoading(false);
    setVideosLoading(false);
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

  const getVideoThumbnail = (video) => {
    if (video?.thumbnail_url) return video.thumbnail_url;
    if (video?.youtube_id) return `https://img.youtube.com/vi/${video.youtube_id}/maxresdefault.jpg`;
    return null;
  };

  const artistPlatformMeta = {
    spotify: {
      label: 'Spotify',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg'
    },
    apple_music: {
      label: 'Apple Music',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Apple_Music_icon.svg/960px-Apple_Music_icon.svg.png'
    },
    youtube_music: {
      label: 'YouTube Music',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/6/6a/Youtube_Music_icon.svg'
    },
    amazon_music: {
      label: 'Amazon Music',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7d/Amazon_Music_logo.svg'
    }
  };

  const artistMusicLinks = Object.entries(artistPlatformMeta)
    .map(([key, meta]) => ({
      key,
      label: meta.label,
      logo: meta.logo,
      url: person?.music_links?.[key] || null
    }))
    .filter((item) => !!item.url);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-white/40"></div>
      </div>
    );
  }

  if (!person) return <div className="min-h-screen flex items-center justify-center">Person not found</div>;

  return (
    <div className="min-h-screen pb-24 md:pb-12">
      {/* Header Section */}
      <div className="relative h-[280px] md:h-[320px] lg:h-[360px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b1220]/60 via-[#04060b]/80 to-[#04060b]" />
        <div className="relative h-full container-desktop flex flex-col items-start justify-end pb-8">
          <div className="w-[160px] h-[160px] md:w-[200px] md:h-[200px] rounded-full overflow-hidden border-4 border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] mb-4">
            {person.profile_url ? (
              <img
                src={person.profile_url}
                alt={person.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-white/10 flex items-center justify-center">
                <svg className="w-20 h-20 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">{person.name}</h1>
          {person.known_for_department && (
            <p className="text-sm text-gray-400 mt-1">{person.known_for_department}</p>
          )}
        </div>
      </div>

      <div className="container-desktop mt-6 lg:mt-10">
        <div className="grid lg:grid-cols-[320px_1fr] gap-8">
          <aside className="space-y-6">
            <div className="bg-[#111827] border border-white/10 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-muted mb-4">Information</h3>
              <div className="space-y-3 text-sm">
                {person.birthday && (
                  <div className="flex justify-between">
                    <span className="text-muted">Born</span>
                    <span className="text-white font-medium">
                      {new Date(person.birthday).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                )}
                {person.place_of_birth && (
                  <div className="flex justify-between">
                    <span className="text-muted">Birthplace</span>
                    <span className="text-white font-medium text-right">{person.place_of_birth}</span>
                  </div>
                )}
                {person.known_for_department && (
                  <div className="flex justify-between">
                    <span className="text-muted">Known For</span>
                    <span className="text-white font-medium">{person.known_for_department}</span>
                  </div>
                )}
              </div>
            </div>

            {artistMusicLinks.length > 0 && (
              <section className="bg-[#111827] border border-white/10 rounded-xl p-5">
                <p className="text-[11px] uppercase tracking-[0.25em] text-muted">Official Profiles</p>
                <h3 className="text-lg font-semibold mt-1 mb-3">Listen Artist</h3>
                <div className="flex flex-wrap gap-2">
                  {artistMusicLinks.map((item) => (
                    <a
                      key={item.key}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-10 px-3 rounded-full bg-white/8 border border-white/12 flex items-center justify-center hover:bg-white/12 transition"
                      aria-label={`Open ${item.label}`}
                    >
                      <img
                        src={item.logo}
                        alt={item.label}
                        loading="lazy"
                        className="h-4 w-auto object-contain"
                      />
                    </a>
                  ))}
                </div>
              </section>
            )}

            {(person.social_links?.instagram || person.social_links?.twitter || person.social_links?.facebook) && (
              <div className="bg-[#111827] border border-white/10 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-muted mb-3">Social</h3>
                <div className="flex gap-3">
                  {person.social_links?.instagram && (
                    <a
                      href={person.social_links.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-icon"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </a>
                  )}
                  {person.social_links?.twitter && (
                    <a
                      href={person.social_links.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-icon"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    </a>
                  )}
                  {person.social_links?.facebook && (
                    <a
                      href={person.social_links.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-icon"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            )}
          </aside>

          <div className="space-y-8">
            {person.biography && (
              <div className="bg-[#111827] border border-white/10 rounded-xl p-5">
                <h2 className="text-lg font-semibold mb-3">About</h2>
                <p className={`text-sm text-secondary leading-relaxed whitespace-pre-line ${!showFullBio && 'line-clamp-5'}`}>
                  {person.biography}
                </p>
                {person.biography.length > 300 && (
                  <button
                    onClick={() => setShowFullBio(!showFullBio)}
                    className="text-sm mt-3 font-medium text-white/80 hover:text-white transition"
                  >
                    {showFullBio ? 'Show Less' : 'More'}
                  </button>
                )}
              </div>
            )}

            {movieCredits.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Filmography</h2>
                  <span className="text-sm text-muted">{movieCredits.length} titles</span>
                </div>
                <div className="carousel-shell">
                  <div className="carousel-track flex gap-3 scrollbar-hide">
                    {movieCredits.slice(0, 20).map((credit, i) => (
                      <div
                        key={i}
                        onClick={() => navigate(`/movie/${credit.id}`)}
                        className="flex-shrink-0 w-[120px] snap-start cursor-pointer group"
                      >
                        <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-[#111827] border border-white/10">
                          <img
                            src={credit.poster_url || 'https://via.placeholder.com/300x450'}
                            alt={credit.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div className="mt-2">
                          <h3 className="text-xs font-semibold line-clamp-2 leading-tight">{credit.title}</h3>
                          <p className="text-[10px] text-muted mt-0.5">{credit.year}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Featured Videos</h2>
                {!videosLoading && <span className="text-sm text-muted">{featuredVideos.length} videos</span>}
              </div>
              {videosLoading ? (
                <div className="carousel-shell">
                  <div className="carousel-track flex gap-3 scrollbar-hide">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <div key={`video-skeleton-${index}`} className="flex-shrink-0 w-[280px] sm:w-[320px] lg:w-[420px]">
                        <div className="aspect-video rounded-xl bg-white/10 animate-pulse" />
                        <div className="h-3 mt-2 rounded bg-white/10 animate-pulse" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : featuredVideos.length === 0 ? (
                <div className="bg-[#111827] border border-white/10 rounded-xl p-4 text-sm text-muted">
                  No featured videos linked yet.
                </div>
              ) : (
                <div className="carousel-shell">
                  <div className="carousel-track flex gap-3 scrollbar-hide">
                    {featuredVideos.map((video) => (
                      <button
                        key={video.id}
                        onClick={() => navigate(`/videos/${video.id}`)}
                        className="flex-shrink-0 w-[280px] sm:w-[320px] lg:w-[420px] snap-start text-left group"
                      >
                        <div className="relative aspect-video overflow-hidden rounded-xl bg-[#0b0f17] border border-white/10">
                          {getVideoThumbnail(video) && !videoImageErrors[video.id] ? (
                            <img
                              src={getVideoThumbnail(video)}
                              alt={video.title}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              onError={() => setVideoImageErrors((prev) => ({ ...prev, [video.id]: true }))}
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-sm text-muted">
                              Thumbnail unavailable
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <FrostedPlayButton className="w-12 h-12 md:w-14 md:h-14" />
                          </div>
                        </div>
                        <div className="mt-2">
                          <h3 className="text-xs font-semibold line-clamp-2 leading-tight">{video.title}</h3>
                          {video.person_role && (
                            <p className="text-[10px] text-muted mt-0.5 line-clamp-1">{video.person_role}</p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonDetail;




