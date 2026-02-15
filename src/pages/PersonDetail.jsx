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
    if (video?.youtube_id) return `https://img.youtube.com/vi/${video.youtube_id}/hqdefault.jpg`;
    return 'https://via.placeholder.com/600x900';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-sky-400"></div>
      </div>
    );
  }

  if (!person) return <div className="min-h-screen flex items-center justify-center">Person not found</div>;

  return (
    <div className="min-h-screen pb-24 md:pb-12">
      {/* Header Section */}
      <div className="relative h-[280px] md:h-[320px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b1220]/60 via-[#04060b]/80 to-[#04060b]" />
        <div className="relative h-full flex flex-col items-center justify-end pb-8 px-5">
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
          <h1 className="text-2xl md:text-3xl font-bold text-center">{person.name}</h1>
          {person.known_for_department && (
            <p className="text-sm text-gray-400 mt-1">{person.known_for_department}</p>
          )}
        </div>
      </div>

      <div className="px-5 space-y-6 mt-6">
        {/* Biography */}
        {person.biography && (
          <div className="glass-card p-5 rounded-2xl">
            <h2 className="text-lg font-semibold mb-3">About</h2>
            <p className={`text-sm text-gray-300 leading-relaxed whitespace-pre-line ${!showFullBio && 'line-clamp-4'}`}>
              {person.biography}
            </p>
            {person.biography.length > 300 && (
              <button
                onClick={() => setShowFullBio(!showFullBio)}
                className="text-[#3ba7ff] hover:text-[#5dd1ff] text-sm mt-3 font-medium transition"
              >
                {showFullBio ? 'Show Less' : 'More'}
              </button>
            )}
          </div>
        )}

        {/* Info Card */}
        <div className="glass-card p-5 rounded-2xl">
          <h3 className="text-sm font-semibold mb-4 text-gray-400">Information</h3>
          <div className="space-y-3 text-sm">
            {person.birthday && (
              <div className="flex justify-between">
                <span className="text-gray-400">Born</span>
                <span className="text-white font-medium">
                  {new Date(person.birthday).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
            )}
            {person.place_of_birth && (
              <div className="flex justify-between">
                <span className="text-gray-400">Birthplace</span>
                <span className="text-white font-medium text-right">{person.place_of_birth}</span>
              </div>
            )}
            {person.known_for_department && (
              <div className="flex justify-between">
                <span className="text-gray-400">Known For</span>
                <span className="text-white font-medium">{person.known_for_department}</span>
              </div>
            )}
          </div>
        </div>

        {/* Filmography */}
        {movieCredits.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Filmography</h2>
              <span className="text-sm text-gray-400">{movieCredits.length} titles</span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide snap-x snap-mandatory">
              {movieCredits.slice(0, 20).map((credit, i) => (
                <div
                  key={i}
                  onClick={() => navigate(`/movie/${credit.id}`)}
                  className="flex-shrink-0 w-[120px] snap-start cursor-pointer group"
                >
                  <div className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-white/5 shadow-lg transition-all duration-300 group-hover:shadow-[0_8px_24px_rgba(59,167,255,0.35)] group-active:scale-[0.97]">
                    <img
                      src={credit.poster_url || 'https://via.placeholder.com/300x450'}
                      alt={credit.title}
                      className="w-full h-full object-cover transition-all duration-300 group-hover:scale-[1.03]"
                      loading="lazy"
                    />
                  </div>
                  <div className="mt-2">
                    <h3 className="text-xs font-semibold line-clamp-2 leading-tight">{credit.title}</h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">{credit.year}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Featured Videos */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Featured Videos</h2>
            {!videosLoading && <span className="text-sm text-gray-400">{featuredVideos.length} videos</span>}
          </div>
          {videosLoading ? (
            <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={`video-skeleton-${index}`} className="flex-shrink-0 w-[120px]">
                  <div className="aspect-[2/3] rounded-2xl bg-white/10 animate-pulse" />
                  <div className="h-3 mt-2 rounded bg-white/10 animate-pulse" />
                </div>
              ))}
            </div>
          ) : featuredVideos.length === 0 ? (
            <div className="glass-card p-4 rounded-2xl text-sm text-gray-400">
              No featured videos linked yet.
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide snap-x snap-mandatory">
              {featuredVideos.map((video) => (
                <button
                  key={video.id}
                  onClick={() => navigate(`/videos/${video.id}`)}
                  className="flex-shrink-0 w-[120px] snap-start text-left group"
                >
                  <div className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-white/5 shadow-lg">
                    <img
                      src={getVideoThumbnail(video)}
                      alt={video.title}
                      className="w-full h-full object-cover transition-all duration-300 group-hover:scale-[1.03]"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FrostedPlayButton className="w-12 h-12 md:w-14 md:h-14" />
                    </div>
                  </div>
                  <div className="mt-2">
                    <h3 className="text-xs font-semibold line-clamp-2 leading-tight">{video.title}</h3>
                    {video.person_role && (
                      <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">{video.person_role}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Social Links */}
        {(person.social_links?.instagram || person.social_links?.twitter || person.social_links?.facebook) && (
          <div className="flex gap-3 justify-center">
            {person.social_links?.instagram && (
              <a
                href={person.social_links.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            )}
            {person.social_links?.twitter && (
              <a
                href={person.social_links.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            )}
            {person.social_links?.facebook && (
              <a
                href={person.social_links.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonDetail;
