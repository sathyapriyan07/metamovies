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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-white">
        <div className="max-w-2xl mx-auto px-4 pt-12 pb-10">Loading...</div>
      </div>
    );
  }
  if (!person) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-white">
        <div className="max-w-2xl mx-auto px-4 pt-12 pb-10">Person not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <SeoHead
        title={pageMeta?.title || `${person.name} - MetaMovies+`}
        description={pageMeta?.description || person.biography?.slice(0, 160)}
        jsonLd={pageMeta?.jsonld || null}
      />
      <div className="max-w-2xl mx-auto px-4 pt-12 pb-10">
        <section className="flex flex-col items-center text-center gap-3">
          <div className="w-28 h-28 rounded-full overflow-hidden bg-[#1a1a1a] border border-gray-800">
            <img loading="lazy" src={person.profile_url || 'https://via.placeholder.com/800x800'} alt={person.name} className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold">{person.name}</h1>
          {person.known_for_department && <p className="text-sm text-gray-400">{person.known_for_department}</p>}
          {(person.birthday || person.place_of_birth) && (
            <p className="text-sm text-gray-400">
              {person.birthday || ''}{person.birthday && person.place_of_birth ? ' • ' : ''}{person.place_of_birth || ''}
            </p>
          )}
          <button className="btn-secondary h-10 px-4" onClick={toggleFollow}>
            {isFollowing ? 'Following' : 'Follow'}
          </button>
        </section>

        {person.biography && (
          <section className="py-6">
            <h2 className="text-lg font-semibold mb-3">Biography</h2>
            <p className="text-sm text-gray-300">
              {showFullBio ? person.biography : person.biography.slice(0, 300)}
              {person.biography.length > 300 && !showFullBio ? '...' : ''}
            </p>
            {person.biography.length > 300 && (
              <button className="mt-2 text-sm text-gray-400 hover:text-white transition" onClick={() => setShowFullBio(!showFullBio)}>
                {showFullBio ? 'Read Less' : 'Read More'}
              </button>
            )}
          </section>
        )}

        {movieCredits.length > 0 && (
          <section className="py-6">
            <h2 className="text-lg font-semibold mb-3">Known For</h2>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {movieCredits.slice(0, 10).map((credit, i) => (
                <button key={`known-${i}`} className="min-w-[120px] text-left" onClick={() => navigate(`/movie/${credit.id}`)}>
                  <div className="aspect-[2/3] rounded-md overflow-hidden bg-[#1a1a1a] border border-gray-800">
                    <img loading="lazy" src={credit.poster_url || credit.backdrop_url} alt={credit.title} className="w-full h-full object-cover" />
                  </div>
                  <p className="mt-2 text-sm font-medium truncate">{credit.title}</p>
                </button>
              ))}
            </div>
          </section>
        )}

        <section className="py-6">
          <h2 className="text-lg font-semibold mb-3">Filmography</h2>
          <div className="space-y-3">
            {movieCredits.map((credit, i) => (
              <button
                key={`film-${i}`}
                className="w-full flex items-center gap-3 text-left bg-[#1a1a1a] rounded-md p-3 border border-gray-800"
                onClick={() => navigate(`/movie/${credit.id}`)}
              >
                <div className="w-12 h-16 rounded-md overflow-hidden bg-[#111] shrink-0">
                  <img loading="lazy" src={credit.poster_url || credit.backdrop_url} alt={credit.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{credit.title}</p>
                  <p className="text-xs text-gray-400">{credit.year || 'Year'} • {credit.role || 'Role'}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="py-6">
          <h2 className="text-lg font-semibold mb-3">Featured Videos</h2>
          {videosLoading ? (
            <p>Loading...</p>
          ) : (
            <div className="space-y-2">
              {featuredVideos.map((video) => (
                <button key={video.id} className="w-full text-left bg-[#1a1a1a] rounded-md p-3" onClick={() => navigate(`/videos/${video.id}`)}>
                  <p className="text-sm font-medium">{video.title}</p>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );

};

export default PersonDetail;
